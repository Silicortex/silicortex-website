import type { MasterDataInvoiceVisible } from '../db/masterData.ts'
import type { InvoiceDraft } from './types.ts'
import { isOtherEuMemberState, vatIdPrefix } from './euVat.ts'

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
  // as 0.00, which the non-zero price rule would reject on every later reprint.
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
    // An intra-EU invoice is the one case where the Steuernummer is not enough:
    // the supplier's own USt-IdNr. must appear on it.
    if (invoice.reverseCharge && !filled(sender.vatId)) {
      errors.push('Stammdaten: eigene USt-IdNr. ist bei Reverse Charge zwingend.')
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

  // Non-zero, not positive: a Stornorechnung carries negative amounts so it
  // zeroes out the invoice it reverses, and `> 0` refused every one of them.
  // Deliberately no sign-consistency rule — a mixed-sign document is unusual but
  // legal, and an over-strict check here refuses a document that must go out.
  const usable = invoice.items.filter((item) => filled(item.description) && item.unitPrice !== 0)
  if (usable.length === 0) {
    errors.push('Mindestens eine Position mit Beschreibung und einem Preis ungleich 0 € ist erforderlich.')
  }

  if (invoice.reverseCharge) {
    // The UI locks the rate to 0 %, defaults new lines to 0 %, and rewrites
    // existing lines when the switch is turned on. This check exists because all
    // three of those must hold and only one of them has to break to produce an
    // invoice carrying a 19 % line AND a reverse-charge note — invalid,
    // immutable, and correctable only by a Stornorechnung.
    if (invoice.items.some((item) => item.vatRate !== 0)) {
      errors.push('Reverse Charge: alle Positionen müssen 0 % USt. haben.')
    }
    if (!filled(invoice.customerVatId)) {
      errors.push('Reverse Charge: USt-IdNr. des Kunden ist zwingend.')
    } else if (vatIdPrefix(invoice.customerVatId) === null) {
      errors.push('Reverse Charge: USt-IdNr. des Kunden ist keine gültige Nummer.')
    } else if (vatIdPrefix(invoice.customerVatId) === 'DE') {
      // A German customer is a domestic sale, which carries German VAT.
      errors.push('Reverse Charge gilt nicht für deutsche Kunden — bitte mit 19 % abrechnen.')
    } else if (!isOtherEuMemberState(invoice.customerVatId)) {
      errors.push(
        `Reverse Charge: ${vatIdPrefix(invoice.customerVatId)} ist kein EU-Mitgliedstaat.`
      )
    }
  }

  return errors
}
