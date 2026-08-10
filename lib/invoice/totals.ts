export type InvoiceItemInput = {
  description: string
  quantity: number
  unit: string
  unitPrice: number
  vatRate: number
}

export type VatGroup = { rate: number; net: number; vat: number }

export type InvoiceTotals = {
  lineNets: number[]
  groups: VatGroup[]
  netTotal: number
  vatTotal: number
  grossTotal: number
}

/**
 * Rounds to `scale` decimals, half away from zero, via a decimal-string shift.
 *
 * The shift exists because `Math.round(2.675 * 100)` gives 267: 2.675 is really
 * 2.67499…, while `Number('2.675e+2')` is exactly 267.5.
 *
 * Half away from zero in BOTH directions matters: `Math.round(-14.5)` is -14,
 * so a naive version rounds +0,145 to 0,15 but -0,145 to -0,14 — and a discount
 * line would then not cancel the line it reverses. German commercial rounding
 * (kaufmännisches Runden) is symmetric.
 *
 * THREE guards, none of them decoration. The template literals break whenever a
 * number stringifies in exponential form, and `Number('1e+21e-2')` is NaN — a
 * value Postgres accepts into a `numeric` column, so it would be stored and
 * reprinted forever rather than failing loudly.
 *
 *   1. non-finite input            -> 0
 *   2. input shifts out of range   -> plain multiplication, exact enough there
 *   3. OUTPUT stringifies as 1e+21 -> plain division
 *
 * Guard 3 was missing and reachable from the UI: pasting a 20-digit price gives
 * a finite 1.2e19, `round2` shifted it to 1e21, and `${1e21}` renders "1e+21",
 * so the result was NaN. `round3` broke a thousand-fold earlier, at 1e18.
 */
function roundTo(scale: number): (value: number) => number {
  const factor = 10 ** scale
  const away = (n: number) => (n < 0 ? -Math.round(-n) : Math.round(n))

  return (value: number): number => {
    if (!Number.isFinite(value)) return 0

    const shifted = Number(`${value}e+${scale}`)
    if (!Number.isFinite(shifted)) {
      // Two very different values land here, because both ends of the range
      // stringify in exponential form. A magnitude at or above 1e21 is already
      // an integer — doubles that large have no fractional part — so rounding
      // to a positive scale is a no-op, and multiplying would only lose
      // precision (1e21 came back as 999999999999999900000). Tiny values like
      // 1e-7 genuinely need the multiplication to reach 0.
      if (Math.abs(value) >= 1e21) return value
      return away(value * factor) / factor
    }

    const rounded = away(shifted)
    const result = Number(`${rounded}e-${scale}`)
    if (!Number.isFinite(result)) return rounded / factor
    return result
  }
}

/** Money: `numeric(12,2)` in Postgres and 2 decimals on paper. */
export const round2 = roundTo(2)

/** Quantities: `numeric(12,3)` and at most 3 decimals on paper. */
export const round3 = roundTo(3)

/** VAT rates: `numeric(4,1)`. A rate the column cannot hold would print at one
 *  value and store at another on the same immutable document. */
export const round1 = roundTo(1)

// VAT is computed per rate group, never per line: § 14 UStG requires the
// net subtotal and the VAT owed to be shown for each rate.
//
// The order matters and is deliberate: round each line first, then sum the
// ROUNDED line nets per rate, then round the VAT of each group. Grouping
// unrounded values would leave the printed line amounts not summing to the
// printed subtotal — an invoice that visibly does not add up.
export function computeTotals(items: InvoiceItemInput[]): InvoiceTotals {
  const lineNets = items.map((i) => round2(i.quantity * i.unitPrice))

  const netByRate = new Map<number, number>()
  items.forEach((item, index) => {
    netByRate.set(item.vatRate, round2((netByRate.get(item.vatRate) ?? 0) + lineNets[index]))
  })

  const groups: VatGroup[] = [...netByRate.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([rate, net]) => ({ rate, net, vat: round2((net * rate) / 100) }))

  const netTotal = round2(groups.reduce((sum, g) => sum + g.net, 0))
  const vatTotal = round2(groups.reduce((sum, g) => sum + g.vat, 0))

  return { lineNets, groups, netTotal, vatTotal, grossTotal: round2(netTotal + vatTotal) }
}
