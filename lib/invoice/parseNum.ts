// Parses money and quantity input for a German-first invoicing tool.
//
// NEVER use <input type="number"> for these values: it accepts only "." as
// the decimal separator, so a German "80,50" makes .value return an empty
// string and the amount silently becomes 0.
//
// Rules, in order of precedence:
//   1. A comma is ALWAYS the decimal separator ("0,005" -> 0.005). German
//      users do not write commas as thousands separators.
//   2. A lone dot is a THOUSANDS separator when it groups exactly three
//      digits and the leading group does not start with "0" ("1.234" ->
//      1234); otherwise it is a decimal point ("80.50" -> 80.5).
//   3. With both present, whichever appears last is the decimal separator.
//   4. Anything else is rejected as 0 rather than silently reinterpreted:
//      "8O,50" (letter O) must not become 8.5 on a customer's invoice.
export function parseNum(value: unknown): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0

  // Strip currency noise only at the edges, never in the middle: removing a
  // stray character between digits would fuse groups into a wrong number.
  let s = String(value).replace(/[\s ]/g, '')
  s = s.replace(/^(?:€|\$|eur)/i, '').replace(/(?:€|\$|eur)$/i, '')
  if (!s) return 0

  if (!/^-?[\d.,]+$/.test(s)) return 0

  const negative = s.startsWith('-')
  if (negative) s = s.slice(1)
  if (s.includes('-')) return 0

  const commas = (s.match(/,/g) ?? []).length
  const dots = (s.match(/\./g) ?? []).length
  if (commas > 1) return 0 // "80,50,60" is not a number

  let normalised: string
  if (commas === 1 && dots > 0) {
    normalised =
      s.lastIndexOf(',') > s.lastIndexOf('.')
        ? s.replace(/\./g, '').replace(',', '.') // 1.234,56
        : s.replace(/,/g, '') // 1,234.56
  } else if (commas === 1) {
    normalised = s.replace(',', '.') // 80,50 and 0,005
  } else if (dots > 0 && isThousandsGrouping(s)) {
    normalised = s.replace(/\./g, '') // 1.234 and 1.234.567
  } else if (dots > 1) {
    return 0 // "1.2.3" is neither a grouping nor a decimal
  } else {
    normalised = s // 80.50 and 0.005
  }

  const n = parseFloat(normalised)
  if (!Number.isFinite(n)) return 0
  return negative ? -n : n
}

// True for "1.234" and "1.234.567"; false for "80.50" and "0.005".
// A thousands grouping never starts with 0 and every later group is 3 digits.
function isThousandsGrouping(s: string): boolean {
  return /^[1-9]\d{0,2}(\.\d{3})+$/.test(s)
}
