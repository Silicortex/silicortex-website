// EU VAT identification numbers, for intra-EU B2B reverse charge.
//
// EU membership is derived from the VAT ID's own prefix, not from the free-text
// country field on the invoice: the prefix is structured and authoritative, while
// "Österreich" / "Austria" / "AT" are all things an owner might type.

/** VAT ID prefixes of the 27 EU member states.
 *
 *  Greece is `EL`, not `GR` — its VAT prefix differs from its ISO country code,
 *  and a hand-written list that says GR silently rejects every Greek customer.
 *
 *  `XI` (Northern Ireland) is deliberately absent. It is a valid VAT prefix and
 *  belongs to the EU VAT area for GOODS, but not for services — and this tool
 *  invoices services. */
export const EU_VAT_PREFIXES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'EL', 'ES', 'FI', 'FR', 'HR',
  'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI',
  'SK',
] as const

/** The country prefix of a VAT ID, or null if it does not look like one at all.
 *
 *  Spaces and dots are tolerated on input — a customer writing
 *  "ATU 123 456 78" has given a usable number. */
export function vatIdPrefix(vatId: string): string | null {
  const normalised = vatId.replace(/[\s.\-]/g, '').toUpperCase()
  const match = /^([A-Z]{2})([A-Z0-9]{2,12})$/.exec(normalised)
  return match ? match[1] : null
}

export function isEuVatId(vatId: string): boolean {
  const prefix = vatIdPrefix(vatId)
  return prefix !== null && (EU_VAT_PREFIXES as readonly string[]).includes(prefix)
}

/** Whether this VAT ID belongs to another EU member state — the precondition for
 *  reverse charge. A German customer is a domestic sale and gets German VAT. */
export function isOtherEuMemberState(vatId: string): boolean {
  return isEuVatId(vatId) && vatIdPrefix(vatId) !== 'DE'
}

/** The note an intra-EU reverse-charge invoice must carry.
 *
 *  § 14a UStG governs the additional content of an intra-EU invoice, and what it
 *  requires is an INDICATION that the recipient owes the tax — not a statutory
 *  citation. So no paragraph is printed: § 13b would be plainly wrong here (that
 *  is reverse charge on services RECEIVED in Germany), and even a correct cite is
 *  a liability on a document that does not need one. */
export const REVERSE_CHARGE_NOTE =
  'Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge)'
