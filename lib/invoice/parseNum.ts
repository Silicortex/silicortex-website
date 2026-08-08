// Parses both German ("1.234,56") and English ("1,234.56") number input.
//
// NEVER use <input type="number"> for these values: it accepts only "." as
// the decimal separator, so a German "80,50" makes .value return an empty
// string and the amount silently becomes 0.
export function parseNum(value: unknown): number {
  if (value === null || value === undefined) return 0
  let s = String(value).trim()
  if (!s) return 0

  s = s.replace(/[^\d.,\-]/g, '') // "95 €" -> "95"

  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')

  if (lastComma > -1 && lastDot > -1) {
    // Both present: whichever comes last is the decimal separator.
    if (lastComma > lastDot) {
      s = s.replace(/\./g, '').replace(',', '.') // 1.234,56
    } else {
      s = s.replace(/,/g, '') // 1,234.56
    }
  } else if (lastComma > -1) {
    const digitsAfter = s.length - lastComma - 1
    s =
      digitsAfter > 0 && digitsAfter <= 2
        ? s.replace(',', '.') // 80,50 -> decimal
        : s.replace(/,/g, '') // 1,234 -> thousands
  }

  const n = parseFloat(s)
  return Number.isNaN(n) ? 0 : n
}
