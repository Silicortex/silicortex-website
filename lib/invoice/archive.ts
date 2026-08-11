// Which documents in the archive are settled by a Stornorechnung.
//
// Nothing is stored for this and nothing needs to be: a Storno already carries the
// number of the invoice it corrects in `stornoFor`, so the relationship is read
// out of the list the archive already has. No column, no second query, and no way
// for a stored flag to drift out of step with the documents themselves.

import type { InvoiceSummary } from './types.ts'

/** The invoice numbers that an ISSUED Stornorechnung cancels.
 *
 *  Draft Stornos do not count. A draft has corrected nothing yet — it can still be
 *  discarded — and treating one as a cancellation would grey out a live invoice
 *  that is still owed, and hide it from the list. */
export function cancelledInvoiceNumbers(invoices: readonly InvoiceSummary[]): Set<string> {
  const cancelled = new Set<string>()
  for (const invoice of invoices) {
    if (invoice.docType === 'storno' && invoice.status === 'issued' && invoice.stornoFor !== '') {
      cancelled.add(invoice.stornoFor)
    }
  }
  return cancelled
}

/** True for a settled pair: the cancelled invoice, and the Storno that cancels it.
 *
 *  Both halves, deliberately. Hiding only the cancelled invoice would leave its
 *  Storno behind as an orphan −130,90 € line, which reads like a document nobody
 *  can explain. */
export function isSettled(invoice: InvoiceSummary, cancelled: ReadonlySet<string>): boolean {
  if (invoice.docType === 'storno' && invoice.status === 'issued') return true
  return invoice.invoiceNumber !== null && cancelled.has(invoice.invoiceNumber)
}

/** The rows to show. Filtering happens here, not in the component, so what the
 *  operator sees is covered by unit tests rather than only by clicking. */
export function visibleInvoices(
  invoices: readonly InvoiceSummary[],
  hideSettled: boolean
): InvoiceSummary[] {
  if (!hideSettled) return [...invoices]
  const cancelled = cancelledInvoiceNumbers(invoices)
  return invoices.filter((invoice) => !isSettled(invoice, cancelled))
}
