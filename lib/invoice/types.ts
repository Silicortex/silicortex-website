import type { InvoiceItemInput, InvoiceTotals } from './totals.ts'
import type { MasterDataInvoiceVisible } from '../db/masterData.ts'

export type InvoiceStatus = 'draft' | 'issued'

export type InvoiceDraft = {
  id: string | null
  status: InvoiceStatus
  invoiceNumber: string | null // assigned only when issued
  proposedNumber: string // the editable field while still a draft
  invoiceDate: string // ISO yyyy-mm-dd
  serviceDate: string // free text: a date or a period ("Juli 2026")
  customerNumber: string
  customerName: string
  customerStreet: string
  customerZipCity: string
  customerCountry: string
  customerVatId: string
  paymentTerms: string
  /**
   * The number of the invoice this document corrects, from the RE- range, or ''.
   * Stored as a field rather than only as the printed reference line, so the
   * link survives independently of the layout — a Storno's legal meaning is the
   * link, not the sentence.
   */
  stornoFor: string
  /** The referenced invoice's date, frozen when the Storno was written. */
  stornoForDate: string
  items: InvoiceItemInput[]
  /**
   * The sender block as frozen when the invoice was issued. Null for drafts,
   * which render live master data. An issued invoice MUST print from this, or
   * a later Stammdaten edit would silently rewrite documents already sent.
   */
  senderSnapshot: MasterDataInvoiceVisible | null
  /**
   * Totals as stored when the invoice was issued. Null for drafts, which
   * recompute live. An issued invoice MUST print these rather than recomputing:
   * a future change to the rounding rules would otherwise silently restate
   * documents already sent.
   */
  storedTotals: InvoiceTotals | null
}

export type InvoiceSummary = {
  id: string
  status: InvoiceStatus
  invoiceNumber: string | null
  proposedNumber: string
  invoiceDate: string
  customerName: string
  stornoFor: string
  netTotal: number
  vatTotal: number
  grossTotal: number
}

export function emptyItem(vatRate: number): InvoiceItemInput {
  return { description: '', quantity: 1, unit: 'Std', unitPrice: 0, vatRate }
}

export function defaultPaymentTerms(days: number): string {
  return `Zahlbar innerhalb von ${days} Tagen ohne Abzug.`
}

// `crypto.randomUUID()` only exists in a secure context (HTTPS or localhost).
// Opening the admin app from a phone at e.g. http://192.168.x.x:3000 would
// leave it undefined, and because `emptyInvoice` is called from `AdminApp`'s
// `useState` initialiser, that throw would take down the entire admin area on
// mount — not just the id. The check is done at call time (not hoisted to
// module scope) so a test can shadow `crypto.randomUUID` before calling this
// and exercise the fallback deterministically.
//
// `crypto.getRandomValues` has no secure-context restriction, so the fallback
// stays cryptographically random. Its bytes are assembled into a valid UUID v4
// shape, not a loose string: `invoices.id` is a Postgres `uuid` column, and
// something like `inv-abc123` would be rejected at insert time, not in the
// browser.
export function newInvoiceId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()

  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 10xx

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function emptyInvoice(args: {
  proposedNumber: string
  invoiceDate: string
  paymentTerms: string
  vatRate: number
}): InvoiceDraft {
  return {
    // Minted client-side, not left `null`: the id is what `saveDraft`'s
    // `on conflict (id)` upsert keys on, so clicking "Ins Archiv legen"
    // twice in a row updates one row instead of minting two identical
    // drafts server-side (proposed_number has no unique constraint).
    id: newInvoiceId(),
    status: 'draft',
    invoiceNumber: null,
    proposedNumber: args.proposedNumber,
    invoiceDate: args.invoiceDate,
    serviceDate: '',
    customerNumber: '',
    customerName: '',
    customerStreet: '',
    customerZipCity: '',
    customerCountry: 'Deutschland',
    customerVatId: '',
    paymentTerms: args.paymentTerms,
    stornoFor: '',
    stornoForDate: '',
    items: [emptyItem(args.vatRate)],
    senderSnapshot: null,
    storedTotals: null,
  }
}
