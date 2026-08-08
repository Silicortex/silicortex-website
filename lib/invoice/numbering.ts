// German invoice numbers must be unique and gapless, so a number is only
// ever derived from the highest ISSUED one — drafts hold no number.
export function nextInvoiceNumber(highest: string | null, year: number): string {
  if (!highest) return `${year}-001`

  const match = /^(.*?)(\d+)$/.exec(highest)
  if (!match) return `${year}-001`

  const [, prefix, digits] = match
  const incremented = String(Number(digits) + 1)
  return `${prefix}${incremented.padStart(digits.length, '0')}`
}

export function compareInvoiceNumbers(a: string, b: string): number {
  return a.localeCompare(b, 'de', { numeric: true })
}
