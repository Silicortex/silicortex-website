export function formatAmount(value: number): string {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatCurrency(value: number): string {
  return `${formatAmount(value)} €`
}

export function formatQuantity(value: number): string {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })
}

// Formatted here rather than left to the browser: a type="date" input
// prints in the visitor's locale, which is ambiguous on a German invoice.
export function formatDateDe(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return ''
  const [, year, month, day] = match
  return `${day}.${month}.${year}`
}

export function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
