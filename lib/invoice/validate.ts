import type { MasterDataInvoiceVisible } from '../db/masterData.ts'
import type { InvoiceDraft } from './types.ts'

// § 14 UStG mandatory fields, checked before printing. Validation happens on
// the print button because a beforeprint handler cannot cancel a print.
export function validateForPrint(
  invoice: InvoiceDraft,
  sender: MasterDataInvoiceVisible,
  // Validation gates the draft -> issued transition, nothing else.
  //
  // An ISSUED invoice is immutable by design, so refusing to print one leaves a
  // legal document that can never be produced again — worse than any field it
  // was trying to police. That applies to EVERY rule, not just the sender: an
  // invoice issued before prices were quantized can hold a sub-cent line stored
  // as 0.00, which `unitPrice > 0` would reject on every later reprint.
  //
  // So a reprint validates nothing, and the transition validates everything.
  options: { enforceSender: boolean }
): string[] {
  const errors: string[] = []
  const filled = (value: string) => value.trim().length > 0

  // Already issued: it exists, it is immutable, and it must always print.
  if (invoice.status === 'issued') return errors

  if (options.enforceSender) {
    // Nothing in the database can catch an empty sender: the
    // invoices_issued_complete constraint only requires sender_snapshot to be
    // non-null, and an all-empty object satisfies that.
    if (!filled(sender.name)) errors.push('Stammdaten: Name fehlt.')
    if (!filled(sender.street) || !filled(sender.zipCity)) {
      errors.push('Stammdaten: eigene Adresse ist unvollständig.')
    }
    // § 14 UStG is satisfied by EITHER the Steuernummer or the USt-IdNr.
    // Requiring both would block a legitimate invoice.
    if (!filled(sender.taxNumber) && !filled(sender.vatId)) {
      errors.push('Stammdaten: Steuernummer oder USt-IdNr. fehlt (§ 14 UStG).')
    }
  }

  if (!filled(invoice.customerName)) errors.push('Kundenname fehlt.')
  if (!filled(invoice.customerStreet) || !filled(invoice.customerZipCity)) {
    errors.push('Adresse des Kunden ist unvollständig.')
  }

  const number = invoice.proposedNumber
  if (!filled(number)) errors.push('Rechnungsnummer fehlt.')
  if (!filled(invoice.invoiceDate)) errors.push('Rechnungsdatum fehlt.')
  if (!filled(invoice.serviceDate)) errors.push('Leistungsdatum bzw. Leistungszeitraum fehlt.')

  const usable = invoice.items.filter((item) => filled(item.description) && item.unitPrice > 0)
  if (usable.length === 0) {
    errors.push('Mindestens eine Position mit Beschreibung und Preis über 0 € ist erforderlich.')
  }

  return errors
}
