import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeTotals, round2, type InvoiceItemInput } from './totals.ts'

function item(partial: Partial<InvoiceItemInput>): InvoiceItemInput {
  return { description: 'Leistung', quantity: 1, unit: 'Std', unitPrice: 0, vatRate: 19, ...partial }
}

test('rounds half away from zero despite float representation', () => {
  assert.equal(round2(2.675), 2.68)
  assert.equal(round2(1.005), 1.01)
  assert.equal(round2(30.589999999999996), 30.59)
  assert.equal(round2(161), 161)
})

// A NaN here would silently poison every total on the invoice, so the
// guards must hold for values that stringify in exponential notation.
test('round2 never returns NaN', () => {
  assert.equal(round2(1e-7), 0)
  assert.equal(round2(Number.NaN), 0)
  assert.equal(round2(Number.POSITIVE_INFINITY), 0)
  assert.equal(round2(0), 0)
})

test('computes a single-rate invoice', () => {
  // 2 × 80,50 = 161,00 net; 19 % of 161,00 = 30,59; gross 191,59
  const totals = computeTotals([item({ quantity: 2, unitPrice: 80.5, vatRate: 19 })])
  assert.deepEqual(totals.lineNets, [161])
  assert.deepEqual(totals.groups, [{ rate: 19, net: 161, vat: 30.59 }])
  assert.equal(totals.netTotal, 161)
  assert.equal(totals.vatTotal, 30.59)
  assert.equal(totals.grossTotal, 191.59)
})

test('keeps 19 % and 7 % in separate groups, as § 14 UStG requires', () => {
  // 19 %: 2 × 80,50 = 161,00 -> VAT 30,59
  //  7 %: 1 × 100,00 = 100,00 -> VAT 7,00
  // net 261,00 | VAT 37,59 | gross 298,59
  const totals = computeTotals([
    item({ quantity: 2, unitPrice: 80.5, vatRate: 19 }),
    item({ quantity: 1, unitPrice: 100, vatRate: 7 }),
  ])
  assert.equal(totals.groups.length, 2)
  assert.deepEqual(totals.groups, [
    { rate: 7, net: 100, vat: 7 },
    { rate: 19, net: 161, vat: 30.59 },
  ])
  assert.equal(totals.netTotal, 261)
  assert.equal(totals.vatTotal, 37.59)
  assert.equal(totals.grossTotal, 298.59)
})

test('sums several lines that share a rate into one group', () => {
  const totals = computeTotals([
    item({ quantity: 1, unitPrice: 10, vatRate: 19 }),
    item({ quantity: 1, unitPrice: 20, vatRate: 19 }),
  ])
  assert.deepEqual(totals.groups, [{ rate: 19, net: 30, vat: 5.7 }])
})

test('includes a 0 % group with no VAT', () => {
  const totals = computeTotals([item({ quantity: 1, unitPrice: 50, vatRate: 0 })])
  assert.deepEqual(totals.groups, [{ rate: 0, net: 50, vat: 0 }])
  assert.equal(totals.vatTotal, 0)
  assert.equal(totals.grossTotal, 50)
})

test('groups VAT per rate rather than per line', () => {
  // Per line: round2(0.055) = 0.06 twice = 0.12
  // Per group (correct): round2(0.29 × 0.19) = 0.06
  const totals = computeTotals([
    item({ quantity: 1, unitPrice: 0.145, vatRate: 19 }),
    item({ quantity: 1, unitPrice: 0.145, vatRate: 19 }),
  ])
  assert.equal(totals.groups[0].net, 0.29)
  assert.equal(totals.groups[0].vat, 0.06)
})

test('an empty invoice is all zeros', () => {
  const totals = computeTotals([])
  assert.deepEqual(totals, { lineNets: [], groups: [], netTotal: 0, vatTotal: 0, grossTotal: 0 })
})
