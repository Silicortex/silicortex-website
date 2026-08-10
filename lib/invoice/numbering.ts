// Invoice numbering under § 14 Abs. 4 Nr. 4 UStG.
//
// The legal rule is UNIQUENESS, not gaplessness. The number must be one "die zur
// Identifizierung der Rechnung vom Rechnungsaussteller einmalig vergeben wird" —
// assigned once, ever. UStAE 14.5 Abs. 10 is explicit that a gapless run is not
// required: "Eine lückenlose Abfolge der ausgestellten Rechnungsnummern ist
// nicht zwingend." Nothing here renumbers, backfills, or refuses to continue
// because a number is missing.
//
// Uniqueness is enforced by the database, not here: `issued_numbers` is an
// append-only journal with the number as its primary key, so a number stays
// burned even if its invoice is removed.

/** Number ranges (Nummernkreise). Separate ranges are permitted for
 *  organisationally delimited areas, so one per document type is safe, and each
 *  carries its own independent counter. */
// "Gutschrift" is deliberately NOT used, for either the range or the document
// title. Under German VAT law a Gutschrift is self-billing — the customer
// issuing the invoice on the supplier's behalf — so labelling a cancellation
// that way can trigger an unintended VAT liability. The document is a
// Stornorechnung, and the range is ST-.
export const RANGES = {
  RE: 'Rechnung',
  ST: 'Stornorechnung',
  AN: 'Angebot',
} as const

export type RangePrefix = keyof typeof RANGES

export function isRangePrefix(value: string): value is RangePrefix {
  return Object.hasOwn(RANGES, value)
}

/** The counter is zero-padded to at least three digits and restarts at 001 on
 *  1 January, so the year in the number always matches the invoice date's year. */
export const MIN_WIDTH = 3

export function formatNumber(
  prefix: RangePrefix,
  year: number,
  seq: number,
  width: number = MIN_WIDTH
): string {
  return `${prefix}-${year}-${String(seq).padStart(Math.max(MIN_WIDTH, width), '0')}`
}

export type ParsedNumber = { prefix: RangePrefix; year: number; seq: number; width: number }

/** Parses a number belonging to a managed range. Returns null for anything else
 *  — including a hand-typed number in another format, which stays legal (§ 14
 *  prescribes no format) and is still recorded and still unique. */
export function parseInvoiceNumber(value: string): ParsedNumber | null {
  const match = /^(RE|ST|AN)-(\d{4})-(\d{3,})$/.exec(value.trim())
  if (!match) return null

  const [, prefix, year, digits] = match
  if (!isRangePrefix(prefix)) return null

  const seq = Number.parseInt(digits, 10)
  // `0` is not a document: RE-2026-000 would collide with the first real number
  // on the next increment.
  if (!Number.isSafeInteger(seq) || seq < 1) return null

  return { prefix, year: Number.parseInt(year, 10), seq, width: digits.length }
}

function seqsIn(prefix: RangePrefix, year: number, issuedNumbers: readonly string[]): number[] {
  return issuedNumbers
    .map((n) => parseInvoiceNumber(n))
    .filter((p): p is ParsedNumber => p !== null && p.prefix === prefix && p.year === year)
    .map((p) => p.seq)
}

/** The padding width for a range in a given year.
 *
 *  A year that exceeds 999 documents widens to four digits — but only from the
 *  following January, never mid-year, so existing numbers are never re-padded.
 *  Mid-year overflow simply renders wider than the padding (1000 is already four
 *  characters); that is unavoidable and harmless.
 *
 *  The width never shrinks again: once a range has reached four digits, later
 *  years keep four, so a quiet year cannot narrow the format back and make two
 *  years look inconsistent. */
export function widthFor(
  prefix: RangePrefix,
  year: number,
  issuedNumbers: readonly string[]
): number {
  const priorMax = issuedNumbers
    .map((n) => parseInvoiceNumber(n))
    .filter((p): p is ParsedNumber => p !== null && p.prefix === prefix && p.year < year)
    .reduce((max, p) => Math.max(max, p.seq), 0)

  return Math.max(MIN_WIDTH, String(priorMax).length)
}

/** The next number in a range.
 *
 *  Derived from the HIGHEST number in the same prefix and year — not from the
 *  count of records, and not from the most recently created one. Both of those
 *  were verified wrong: a deleted draft makes the count lag, and the most recent
 *  record is not the highest once the owner has typed a number by hand. */
export function nextNumber(
  prefix: RangePrefix,
  year: number,
  issuedNumbers: readonly string[]
): string {
  const max = seqsIn(prefix, year, issuedNumbers).reduce((a, b) => Math.max(a, b), 0)
  return formatNumber(prefix, year, max + 1, widthFor(prefix, year, issuedNumbers))
}

/** The next number given the highest sequence already used, for the database
 *  path — which asks Postgres for `max(seq)` instead of loading every number. */
export function nextNumberFromMax(
  prefix: RangePrefix,
  year: number,
  maxSeqThisYear: number,
  maxSeqPriorYears: number
): string {
  return formatNumber(
    prefix,
    year,
    Math.max(0, maxSeqThisYear) + 1,
    Math.max(MIN_WIDTH, String(Math.max(0, maxSeqPriorYears)).length)
  )
}

/** Missing numbers inside a range's used span, for the UI to surface.
 *
 *  Gaps are legal and are never closed. They are shown because unexplained gaps
 *  have prompted Schätzungen — the point is that the owner can see them and
 *  attach a reason, not that the software prevents them. Only INTERIOR gaps
 *  count: the numbers above the highest one issued are simply not used yet. */
export function findGaps(
  prefix: RangePrefix,
  year: number,
  issuedNumbers: readonly string[]
): string[] {
  const used = new Set(seqsIn(prefix, year, issuedNumbers))
  if (used.size === 0) return []

  const highest = Math.max(...used)
  const width = widthFor(prefix, year, issuedNumbers)
  const gaps: string[] = []
  for (let seq = 1; seq < highest; seq++) {
    if (!used.has(seq)) gaps.push(formatNumber(prefix, year, seq, width))
  }
  return gaps
}

/** Sorted for display. A plain string sort puts RE-2026-010 before RE-2026-009
 *  once the widths differ; German numeric collation does not. */
export function compareInvoiceNumbers(a: string, b: string): number {
  return a.localeCompare(b, 'de', { numeric: true })
}

/** The reference line a Storno carries. The link is also stored as a field, so
 *  this is presentation only. */
export function stornoReference(originalNumber: string, originalDateDe: string): string {
  return `Storno zu Rechnung ${originalNumber} vom ${originalDateDe}`
}
