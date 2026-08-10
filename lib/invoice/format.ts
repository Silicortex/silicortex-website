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

  // Shape alone is not enough: "2026-02-30" matches the pattern but is not a
  // date, and must not print as 30.02.2026 on an invoice.
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`)
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() + 1 !== Number(month) ||
    date.getUTCDate() !== Number(day)
  ) {
    return ''
  }

  return `${day}.${month}.${year}`
}

// The invoice date must be the German calendar date. Vercel Functions run in
// UTC, so a naive local-time date would be one day behind for the first one
// to two hours after midnight in Germany — on a legally dated document.
// The `now` parameter exists so this is testable.
export function todayIso(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}
