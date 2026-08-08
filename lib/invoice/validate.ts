import type { InvoiceDraft } from './types.ts'

// § 14 UStG mandatory fields, checked before printing. Validation happens on
// the print button because a beforeprint handler cannot cancel a print.
export function validateForPrint(invoice: InvoiceDraft): string[] {
  const errors: string[] = []
  const filled = (value: string) => value.trim().length > 0

  if (!filled(invoice.customerName)) errors.push('Kundenname fehlt.')
  if (!filled(invoice.customerStreet) || !filled(invoice.customerZipCity)) {
    errors.push('Adresse des Kunden ist unvollständig.')
  }

  const number = invoice.status === 'issued' ? (invoice.invoiceNumber ?? '') : invoice.proposedNumber
  if (!filled(number)) errors.push('Rechnungsnummer fehlt.')
  if (!filled(invoice.invoiceDate)) errors.push('Rechnungsdatum fehlt.')
  if (!filled(invoice.serviceDate)) errors.push('Leistungsdatum bzw. Leistungszeitraum fehlt.')

  const usable = invoice.items.filter((item) => filled(item.description) && item.unitPrice > 0)
  if (usable.length === 0) {
    errors.push('Mindestens eine Position mit Beschreibung und Preis über 0 € ist erforderlich.')
  }

  return errors
}
