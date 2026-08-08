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

// Decimal-string shift: Math.round(2.675 * 100) gives 267 because 2.675 is
// really 2.67499..., while Number('2.675e+2') is exactly 267.5.
//
// The two guards are not decoration. A value JavaScript stringifies in
// exponential form (1e-7, or anything >= 1e21) would make the template
// literal read "1e-7e+2", which is NaN — and a NaN silently poisons every
// total downstream. Non-finite input returns 0; exponential input falls back
// to plain multiplication, which is accurate enough at that magnitude.
export function round2(value: number): number {
  if (!Number.isFinite(value)) return 0
  const shifted = Number(`${value}e+2`)
  if (!Number.isFinite(shifted)) return Math.round(value * 100) / 100
  return Number(`${Math.round(shifted)}e-2`)
}

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
