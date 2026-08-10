import 'server-only'
import { randomUUID } from 'node:crypto'
import { sql } from './client.ts'
// Relative, not `@/…`: plain Node ESM cannot resolve the tsconfig path alias,
// so an `@/` import here breaks every bare-Node verification script in this
// plan (it reads `@/lib/…` as an invalid bare package name). The rest of
// `lib/` already imports relatively for the same reason.
import { computeTotals, type VatGroup } from '../invoice/totals.ts'
import {
  compareInvoiceNumbers,
  nextNumberFromMax,
  parseInvoiceNumber,
  type RangePrefix,
} from '../invoice/numbering.ts'
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
           customer_name, storno_for, net_total, vat_total, gross_total
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
      stornoFor: r.storno_for as string,
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
           customer_zip_city, customer_country, customer_vat_id, payment_terms,
           storno_for, storno_for_date, sender_snapshot, net_total, vat_total, gross_total, vat_breakdown
    from invoices where id = ${id}
  `
  const r = rows[0]
  if (!r) return null

  const items = await sql`
    select line_no, description, quantity, unit, unit_price, vat_rate, net_amount
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
    stornoFor: r.storno_for as string,
    stornoForDate: r.storno_for_date as string,
    // jsonb arrives already parsed by the driver.
    senderSnapshot: (r.sender_snapshot as MasterDataInvoiceVisible | null) ?? null,
    items: items.map((i) => ({
      description: i.description as string,
      quantity: Number(i.quantity),
      unit: i.unit as string,
      unitPrice: Number(i.unit_price),
      vatRate: Number(i.vat_rate),
    })),
    // Null for a draft, so it keeps recomputing live as the owner edits it.
    // Only an issued invoice prints the figures it was issued with.
    storedTotals:
      r.status === 'draft'
        ? null
        : {
            // lineNets are not stored; the items carry their own net_amount, and
            // the sheet only needs the per-row value it already renders.
            lineNets: items.map((i) => Number(i.net_amount)),
            groups: (r.vat_breakdown as VatGroup[] | null) ?? [],
            netTotal: Number(r.net_total),
            vatTotal: Number(r.vat_total),
            grossTotal: Number(r.gross_total),
          },
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
        storno_for, storno_for_date,
        net_total, vat_total, gross_total, vat_breakdown
      ) values (
        ${id}, 'draft', ${draft.proposedNumber}, ${invoiceDate}, ${draft.serviceDate},
        ${draft.customerNumber}, ${draft.customerName}, ${draft.customerStreet},
        ${draft.customerZipCity}, ${draft.customerCountry}, ${draft.customerVatId},
        ${draft.paymentTerms}, ${draft.stornoFor}, ${draft.stornoForDate},
        ${totals.netTotal}, ${totals.vatTotal}, ${totals.grossTotal},
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
        storno_for = excluded.storno_for,
        storno_for_date = excluded.storno_for_date,
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

// The next number in a range, derived from the highest sequence the JOURNAL has
// ever recorded for that prefix and year — not from the invoices table.
//
// The journal is the right source because it outlives the invoices: a number
// recorded there stays used even if no invoice carries it, which is what makes
// "einmalig vergeben" hold. Two earlier approaches were verified wrong. Sorting
// the numbers as strings ranked `RE-2026-001` above `2026-050`, so the next
// number came out BELOW the true highest with no error raised. Reading the most
// recently issued invoice was right only until a number was typed by hand out of
// order. Asking Postgres for `max(seq)` within the parsed range is neither.
export async function nextNumberFor(prefix: RangePrefix, year: number): Promise<string> {
  const rows = await sql`
    select coalesce(max(seq) filter (where year = ${year}), 0)::int as this_year,
           coalesce(max(seq) filter (where year < ${year}), 0)::int as prior_years
    from issued_numbers
    where prefix = ${prefix}
  `
  return nextNumberFromMax(prefix, year, Number(rows[0].this_year), Number(rows[0].prior_years))
}

/** Every number ever recorded, newest first, for the log the UI shows. */
export async function listNumberJournal(): Promise<
  { number: string; invoiceId: string | null; reason: string; createdAt: string }[]
> {
  // Converted to the German calendar date, not left in UTC. Vercel Functions run
  // in UTC, so for the first hours after midnight in Germany a bare
  // `created_at::text` showed the previous day — a number claimed by an invoice
  // dated 11.08.2026 appeared in the log under 2026-08-10. Same failure the
  // invoice dates are already guarded against.
  const rows = await sql`
    select number, invoice_id, reason,
           (created_at at time zone 'Europe/Berlin')::date::text as created_at
    from issued_numbers
    order by created_at desc, number desc
  `
  return rows.map((r) => ({
    number: r.number as string,
    invoiceId: (r.invoice_id as string | null) ?? null,
    reason: r.reason as string,
    createdAt: (r.created_at as string).slice(0, 10),
  }))
}

/** Records a number as used WITHOUT an invoice behind it — a discarded draft, a
 *  test run, something cancelled before sending.
 *
 *  Gaps are legal (UStAE 14.5 Abs. 10), but unexplained ones have prompted
 *  Schätzungen, so the reason is mandatory rather than optional. */
export async function burnNumber(
  number: string,
  reason: string
): Promise<{ ok: true } | { ok: false; error: 'number_taken' | 'no_reason' }> {
  if (!reason.trim()) return { ok: false, error: 'no_reason' }

  const parsed = parseInvoiceNumber(number)
  try {
    await sql`
      insert into issued_numbers (number, prefix, year, seq, invoice_id, reason)
      values (
        ${number}, ${parsed?.prefix ?? null}, ${parsed?.year ?? null},
        ${parsed?.seq ?? null}, null, ${reason.trim()}
      )
    `
    return { ok: true }
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      return { ok: false, error: 'number_taken' }
    }
    throw error
  }
}

export async function issueInvoice(
  id: string,
  invoiceNumber: string,
  snapshot: MasterDataInvoiceVisible
): Promise<{ ok: true } | { ok: false; error: 'number_taken' | 'not_draft' }> {
  const parsed = parseInvoiceNumber(invoiceNumber)
  try {
    // ONE statement, with the journal insert reading from the UPDATE's own
    // RETURNING rows. The two halves must not be able to disagree: an invoice
    // issued without its journal entry would have a reusable number, and a
    // journal entry without an invoice would be an unexplained burn.
    //
    // A two-statement transaction was verified insufficient. Guarding the insert
    // with `where exists (… and status = 'issued')` looks equivalent but is not:
    // issuing the same invoice a second time under a DIFFERENT number left the
    // update matching nothing while the guard still passed — satisfied by the
    // FIRST issue — so the second number was burned against an invoice that
    // carries neither it nor any explanation. Reading from the update's output
    // cannot make that mistake: no rows updated, no rows inserted.
    //
    // OLD.status is still 'draft' in the update, so the immutability trigger
    // allows exactly this one transition and nothing after it.
    const rows = await sql`
      with issued as (
        update invoices set
          status = 'issued',
          invoice_number = ${invoiceNumber},
          issued_at = now(),
          sender_snapshot = ${JSON.stringify(snapshot)}::jsonb,
          updated_at = now()
        where id = ${id} and status = 'draft'
        returning id
      )
      insert into issued_numbers (number, prefix, year, seq, invoice_id, reason)
      select ${invoiceNumber}, ${parsed?.prefix ?? null}, ${parsed?.year ?? null},
             ${parsed?.seq ?? null}, issued.id, ''
      from issued
      returning number
    `

    if (rows.length === 0) return { ok: false, error: 'not_draft' }
    return { ok: true }
  } catch (error) {
    // Matched by SQLSTATE alone. The previous version also matched the string
    // "invoice_number" anywhere in the error, which would now misfire: the
    // journal's own unique violation names `issued_numbers`, and a future
    // unrelated error mentioning the column would be reported as a taken number.
    if ((error as { code?: string }).code === '23505') {
      return { ok: false, error: 'number_taken' }
    }
    throw error
  }
}

/** Builds — but does not save — the Storno that corrects an issued invoice.
 *
 *  Never reuses, edits or overwrites the original's number: the correction is a
 *  new document with its own number from the GS- range, pointing back at the
 *  original. The original itself is immutable and stays exactly as it was sent.
 *
 *  Amounts are copied unchanged rather than negated. A German Gutschrift states
 *  the amounts it reverses, and the document's own heading and reference line
 *  carry the meaning; negating them here would silently produce a document whose
 *  arithmetic the recipient cannot reconcile against the invoice it cancels. */
export async function buildStornoDraft(originalId: string): Promise<InvoiceDraft | null> {
  const original = await loadInvoice(originalId)
  if (!original) return null
  // Only an issued invoice can be cancelled: a draft is simply edited or deleted.
  if (original.status !== 'issued' || !original.invoiceNumber) return null

  const today = todayIso()
  return {
    ...original,
    id: randomUUID(),
    status: 'draft',
    invoiceNumber: null,
    proposedNumber: await nextNumberFor('GS', Number(today.slice(0, 4))),
    invoiceDate: today,
    stornoFor: original.invoiceNumber,
    stornoForDate: original.invoiceDate,
    senderSnapshot: null,
    storedTotals: null,
  }
}
