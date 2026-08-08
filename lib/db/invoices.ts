import 'server-only'
import { randomUUID } from 'node:crypto'
import { sql } from './client.ts'
// Relative, not `@/…`: plain Node ESM cannot resolve the tsconfig path alias,
// so an `@/` import here breaks every bare-Node verification script in this
// plan (it reads `@/lib/…` as an invalid bare package name). The rest of
// `lib/` already imports relatively for the same reason.
import { computeTotals } from '../invoice/totals.ts'
import { compareInvoiceNumbers } from '../invoice/numbering.ts'
import { todayIso } from '../invoice/format.ts'
import type { InvoiceDraft, InvoiceStatus, InvoiceSummary } from '../invoice/types.ts'
import type { MasterDataInvoiceVisible } from './masterData.ts'

// Verified against the live database: the driver parses a `date` column into a
// Date at LOCAL midnight, so a stored 2026-08-08 arrives as
// 2026-08-07T22:00:00.000Z in CEST. Both naive readings are wrong —
// String(value).slice(0,10) gives "Sat Aug 08", and toISOString().slice(0,10)
// gives "2026-08-07", one day early on a legally dated document.
//
// Every query therefore selects `invoice_date::text`. This guard exists so a
// future query that forgets the cast fails loudly instead of silently shifting
// every invoice date by a day.
function isoDate(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error(
      `invoice_date must be selected as ::text — got ${Object.prototype.toString.call(value)}`
    )
  }
  return value.slice(0, 10)
}

export async function listInvoices(): Promise<InvoiceSummary[]> {
  const rows = await sql`
    select id, status, invoice_number, proposed_number,
           invoice_date::text as invoice_date,
           customer_name, net_total, vat_total, gross_total
    from invoices
  `
  return rows
    .map((r) => ({
      id: r.id as string,
      status: r.status as InvoiceStatus,
      invoiceNumber: (r.invoice_number as string | null) ?? null,
      proposedNumber: r.proposed_number as string,
      invoiceDate: isoDate(r.invoice_date),
      customerName: r.customer_name as string,
      netTotal: Number(r.net_total),
      vatTotal: Number(r.vat_total),
      grossTotal: Number(r.gross_total),
    }))
    .sort((a, b) =>
      compareInvoiceNumbers(
        a.invoiceNumber ?? a.proposedNumber,
        b.invoiceNumber ?? b.proposedNumber
      )
    )
}

export async function loadInvoice(id: string): Promise<InvoiceDraft | null> {
  // Columns are enumerated rather than `select *` so the date cast cannot be
  // lost, and so adding a column later does not silently change this shape.
  const rows = await sql`
    select id, status, invoice_number, proposed_number,
           invoice_date::text as invoice_date,
           service_date, customer_number, customer_name, customer_street,
           customer_zip_city, customer_country, customer_vat_id, payment_terms
    from invoices where id = ${id}
  `
  const r = rows[0]
  if (!r) return null

  const items = await sql`
    select line_no, description, quantity, unit, unit_price, vat_rate
    from invoice_items where invoice_id = ${id} order by line_no
  `

  return {
    id: r.id as string,
    status: r.status as InvoiceStatus,
    invoiceNumber: (r.invoice_number as string | null) ?? null,
    proposedNumber: r.proposed_number as string,
    invoiceDate: isoDate(r.invoice_date),
    serviceDate: r.service_date as string,
    customerNumber: r.customer_number as string,
    customerName: r.customer_name as string,
    customerStreet: r.customer_street as string,
    customerZipCity: r.customer_zip_city as string,
    customerCountry: r.customer_country as string,
    customerVatId: r.customer_vat_id as string,
    paymentTerms: r.payment_terms as string,
    items: items.map((i) => ({
      description: i.description as string,
      quantity: Number(i.quantity),
      unit: i.unit as string,
      unitPrice: Number(i.unit_price),
      vatRate: Number(i.vat_rate),
    })),
  }
}

export async function saveDraft(draft: InvoiceDraft): Promise<string> {
  const id = draft.id ?? randomUUID()
  const totals = computeTotals(draft.items)
  const invoiceDate = draft.invoiceDate || todayIso()

  // One transaction so items are never half-replaced. The immutability
  // trigger rejects this outright if the row is already issued.
  await sql.transaction([
    sql`
      insert into invoices (
        id, status, proposed_number, invoice_date, service_date,
        customer_number, customer_name, customer_street, customer_zip_city,
        customer_country, customer_vat_id, payment_terms,
        net_total, vat_total, gross_total, vat_breakdown
      ) values (
        ${id}, 'draft', ${draft.proposedNumber}, ${invoiceDate}, ${draft.serviceDate},
        ${draft.customerNumber}, ${draft.customerName}, ${draft.customerStreet},
        ${draft.customerZipCity}, ${draft.customerCountry}, ${draft.customerVatId},
        ${draft.paymentTerms}, ${totals.netTotal}, ${totals.vatTotal}, ${totals.grossTotal},
        ${JSON.stringify(totals.groups)}::jsonb
      )
      on conflict (id) do update set
        proposed_number = excluded.proposed_number,
        invoice_date = excluded.invoice_date,
        service_date = excluded.service_date,
        customer_number = excluded.customer_number,
        customer_name = excluded.customer_name,
        customer_street = excluded.customer_street,
        customer_zip_city = excluded.customer_zip_city,
        customer_country = excluded.customer_country,
        customer_vat_id = excluded.customer_vat_id,
        payment_terms = excluded.payment_terms,
        net_total = excluded.net_total,
        vat_total = excluded.vat_total,
        gross_total = excluded.gross_total,
        vat_breakdown = excluded.vat_breakdown,
        updated_at = now()
    `,
    sql`delete from invoice_items where invoice_id = ${id}`,
    ...draft.items.map(
      (item, index) => sql`
        insert into invoice_items (
          invoice_id, line_no, description, quantity, unit, unit_price, vat_rate, net_amount
        ) values (
          ${id}, ${index + 1}, ${item.description}, ${item.quantity}, ${item.unit},
          ${item.unitPrice}, ${item.vatRate}, ${totals.lineNets[index] ?? 0}
        )
      `
    ),
  ])

  return id
}

export async function deleteDraft(id: string): Promise<void> {
  // The trigger blocks deletion of issued rows; this keeps the intent local.
  await sql`delete from invoices where id = ${id} and status = 'draft'`
}

// The number to continue from is the one on the invoice most recently ISSUED —
// not the "highest" by any string ordering.
//
// Sorting the numbers was verified to be wrong: with `2026-050` and
// `RE-2026-001` in the table, German collation ranks the letter-prefixed one
// last, so it was treated as the highest and the next number came out as
// `RE-2026-002` — BELOW the true `2026-050`, with no error raised. Because the
// number is a free-text field the owner may edit, no string ordering can be
// trusted across a change of prefix. `issued_at` always can: invoices are
// issued one at a time, in time order.
export async function lastIssuedNumber(): Promise<string | null> {
  const rows = await sql`
    select invoice_number from invoices
    where status = 'issued' and invoice_number is not null
    order by issued_at desc
    limit 1
  `
  return (rows[0]?.invoice_number as string | undefined) ?? null
}

export async function issueInvoice(
  id: string,
  invoiceNumber: string,
  snapshot: MasterDataInvoiceVisible
): Promise<{ ok: true } | { ok: false; error: 'number_taken' | 'not_draft' }> {
  try {
    // OLD.status is still 'draft' here, so the immutability trigger allows
    // exactly this one transition and nothing after it.
    const rows = await sql`
      update invoices set
        status = 'issued',
        invoice_number = ${invoiceNumber},
        issued_at = now(),
        sender_snapshot = ${JSON.stringify(snapshot)}::jsonb,
        updated_at = now()
      where id = ${id} and status = 'draft'
      returning id
    `
    if (rows.length === 0) return { ok: false, error: 'not_draft' }
    return { ok: true }
  } catch (error) {
    const code = (error as { code?: string }).code
    if (code === '23505' || String(error).includes('invoice_number')) {
      return { ok: false, error: 'number_taken' }
    }
    throw error
  }
}
