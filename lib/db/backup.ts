import 'server-only'
import { sql } from './client.ts'
import { BACKUP_VERSION, type ExportInvoice } from '../invoice/export.ts'

/** A complete, restorable copy of everything the invoicing app stores.
 *
 *  § 147 AO requires invoices to be kept for ten years. The app can reprint any
 *  issued invoice, but only for as long as this one database exists — so the point
 *  of a backup is to survive the database, and it has to be complete enough to
 *  restore into an empty one.
 *
 *  CONTAINS PERSONAL DATA: the IBAN, Steuernummer, Steuer-IdNr.,
 *  Sozialversicherungsnummer and date of birth are all in `masterData`. The file
 *  belongs on the owner's own storage and must never be committed — this
 *  repository is public.
 *
 *  `login_attempts` is deliberately absent: it is a rate-limit ledger with 24h
 *  retention, not a record of anything. */
export type Backup = {
  app: 'silicortex-invoices'
  version: number
  exportedAt: string
  /** Which database it came from, so a restore cannot silently target another. */
  database: string
  masterData: Record<string, unknown>
  invoices: (Record<string, unknown> & { items: Record<string, unknown>[] })[]
  issuedNumbers: Record<string, unknown>[]
}

/** Cluster plus database name — never a credential. Same identity the e2e backup
 *  guard uses, and for the same reason: a network address is not stable, because
 *  `localhost` resolves to 127.0.0.1 or ::1 unpredictably. */
async function databaseIdentity(): Promise<string> {
  const rows = await sql`
    select current_database() as db,
           (select system_identifier::text from pg_control_system()) as cluster
  `
  return `${rows[0].cluster}/${rows[0].db}`
}

export async function createBackup(): Promise<Backup> {
  // Every column is listed explicitly rather than `select *`, so the date casts
  // cannot be lost. The cost is that a new column must be added here too: without
  // doc_type in this list, a restored Angebot came back as an invoice, because the
  // column simply took its default.
  //
  // Dates are cast to text throughout. The driver parses a `date` column into a
  // Date at LOCAL midnight, so a stored 2026-08-08 serialises to 2026-08-07 in
  // CEST — one day early, in the file that is supposed to be the record.
  const [master, invoices, items, numbers, identity] = await Promise.all([
    sql`select * from master_data where id = 1`,
    sql`select id, status, invoice_number, proposed_number, invoice_date::text as invoice_date,
               service_date, customer_number, customer_name, customer_street,
               customer_zip_city, customer_country, customer_vat_id, payment_terms,
               storno_for, storno_for_date, quote_ref, quote_ref_date, doc_type,
               reverse_charge, net_total, vat_total,
               gross_total, vat_breakdown, sender_snapshot,
               issued_at::text as issued_at, created_at::text as created_at
        from invoices order by created_at`,
    sql`select invoice_id, line_no, description, quantity, unit, unit_price, vat_rate, net_amount
        from invoice_items order by invoice_id, line_no`,
    sql`select number, prefix, year, seq, invoice_id, reason, created_at::text as created_at
        from issued_numbers order by created_at, number`,
    databaseIdentity(),
  ])

  const itemsByInvoice = new Map<string, Record<string, unknown>[]>()
  for (const item of items) {
    const list = itemsByInvoice.get(item.invoice_id as string) ?? []
    list.push(item)
    itemsByInvoice.set(item.invoice_id as string, list)
  }

  return {
    app: 'silicortex-invoices',
    version: BACKUP_VERSION,
    // Stamped from the database clock, not the host's: the file records when the
    // data was read, and Vercel Functions run in UTC while the machine asking
    // might be anywhere.
    exportedAt: (await sql`select now()::text as now`)[0].now as string,
    database: identity,
    masterData: master[0] ?? {},
    invoices: invoices.map((invoice) => ({
      ...invoice,
      items: itemsByInvoice.get(invoice.id as string) ?? [],
    })),
    issuedNumbers: numbers,
  }
}

/** The invoices in the shape the CSV wants. Separate from the backup, because the
 *  CSV is for reading and the backup is for restoring. */
export async function listInvoicesForExport(): Promise<ExportInvoice[]> {
  const rows = await sql`
    select status, invoice_number, proposed_number, invoice_date::text as invoice_date,
           service_date, customer_name, customer_street, customer_zip_city,
           customer_country, customer_vat_id, customer_number, reverse_charge,
           storno_for, doc_type, payment_terms, net_total, vat_total, gross_total, vat_breakdown
    from invoices
    -- Offers are excluded. An Angebot in a list the Steuerberater books from is
    -- revenue that does not exist. They are still in the JSON backup, which is a
    -- copy of everything rather than a statement of turnover.
    where doc_type <> 'quote'
    order by invoice_date, invoice_number nulls last
  `
  return rows.map((r) => ({
    invoiceNumber: (r.invoice_number as string | null) ?? null,
    proposedNumber: r.proposed_number as string,
    status: r.status as string,
    invoiceDate: r.invoice_date as string,
    serviceDate: r.service_date as string,
    customerName: r.customer_name as string,
    customerStreet: r.customer_street as string,
    customerZipCity: r.customer_zip_city as string,
    customerCountry: r.customer_country as string,
    customerVatId: r.customer_vat_id as string,
    customerNumber: r.customer_number as string,
    reverseCharge: r.reverse_charge as boolean,
    stornoFor: r.storno_for as string,
    docType: r.doc_type as string,
    paymentTerms: r.payment_terms as string,
    // numeric arrives as a string from the driver
    netTotal: Number(r.net_total),
    vatTotal: Number(r.vat_total),
    grossTotal: Number(r.gross_total),
    vatBreakdown: (r.vat_breakdown as { rate: number; net: number; vat: number }[] | null) ?? [],
  }))
}
