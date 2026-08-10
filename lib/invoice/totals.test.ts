import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeTotals, round1, round2, round3, type InvoiceItemInput } from './totals.ts'

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

// Discount lines ("Nachlass -50,00") are ordinary on a German invoice, so
// negative amounts must round like their positive mirror image.
test('rounds half away from zero for negative amounts too', () => {
  assert.equal(round2(-0.145), -0.15)
  assert.equal(round2(-2.675), -2.68)
  assert.equal(round2(-1.005), -1.01)
})

test('a discount line exactly cancels the line it reverses', () => {
  // With asymmetric rounding these two lines would print 0,15 and -0,14 and
  // leave a cent of VAT on a net-zero transaction.
  const totals = computeTotals([
    item({ quantity: 1, unitPrice: 0.145, vatRate: 19 }),
    item({ quantity: 1, unitPrice: -0.145, vatRate: 19 }),
  ])
  assert.deepEqual(totals.lineNets, [0.15, -0.15])
  assert.equal(totals.groups[0].net, 0)
  assert.equal(totals.groups[0].vat, 0)
  assert.equal(totals.grossTotal, 0)
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

// The printed document must be arithmetically consistent: the group net is
// the sum of the line nets AS PRINTED. Summing unrounded values instead would
// print lines of 0,15 + 0,15 under a subtotal of 0,29 — an invoice that
// visibly does not add up, which is worse than a one-cent rounding choice.
test('the group net is the sum of the rounded line nets, so the invoice adds up', () => {
  const totals = computeTotals([
    item({ quantity: 1, unitPrice: 0.145, vatRate: 19 }),
    item({ quantity: 1, unitPrice: 0.145, vatRate: 19 }),
  ])
  assert.deepEqual(totals.lineNets, [0.15, 0.15])
  assert.equal(totals.groups[0].net, 0.3)
  assert.equal(totals.netTotal, 0.3)
  assert.equal(totals.groups[0].vat, 0.06)
})

// This is the § 14 UStG requirement itself: VAT is owed on the summed net of
// each rate, not on each line separately.
test('computes VAT per rate group, not per line', () => {
  // Four lines of 0,03 net at 19 %. Per line the VAT rounds to 0,01 each,
  // i.e. 0,04 in total; on the summed net of 0,12 it is 0,02. The invoice
  // must show 0,02.
  const totals = computeTotals([
    item({ quantity: 1, unitPrice: 0.03, vatRate: 19 }),
    item({ quantity: 1, unitPrice: 0.03, vatRate: 19 }),
    item({ quantity: 1, unitPrice: 0.03, vatRate: 19 }),
    item({ quantity: 1, unitPrice: 0.03, vatRate: 19 }),
  ])
  assert.equal(totals.groups[0].net, 0.12)
  assert.equal(totals.groups[0].vat, 0.02)
})

test('an empty invoice is all zeros', () => {
  const totals = computeTotals([])
  assert.deepEqual(totals, { lineNets: [], groups: [], netTotal: 0, vatTotal: 0, grossTotal: 0 })
})

test('round3 quantizes quantities to the stored scale', () => {
  assert.equal(round3(0.0004), 0)
  assert.equal(round3(1.23456), 1.235)
  assert.equal(round3(-1.23456), -1.235)
  assert.equal(round3(1.0005), 1.001)
  assert.equal(round3(Number.NaN), 0)
  assert.equal(round3(Number.POSITIVE_INFINITY), 0)
  assert.equal(round3(2), 2)
})

// The defect this guards: the raw parsed value went into state while the print
// span and the numeric(12,2) column both rounded, so the printed line did not
// equal printed price x printed quantity. 8 x 0,125 EUR printed as
// "8 x 0,13 EUR = 1,00 EUR" while any reader computes 1,04 EUR.
test('a quantized price makes the printed line self-consistent', () => {
  const price = round2(0.125) // what the field shows and the column stores
  assert.equal(price, 0.13)
  const totals = computeTotals([
    { description: 'x', quantity: 8, unit: 'Std', unitPrice: price, vatRate: 19 },
  ])
  assert.equal(totals.lineNets[0], 1.04)
  assert.equal(totals.netTotal, 1.04)
})

test('a sub-cent price rounds to zero rather than storing an invisible value', () => {
  // 0,004 would store as 0.00 in numeric(12,2) while state held 0.004, so the
  // print validation's `unitPrice > 0` passed at issue time and failed on every
  // later reprint — an issued invoice that could never be printed again.
  assert.equal(round2(0.004), 0)
})

// A code review found round2 and round3 returning NaN for magnitudes around
// 1e18-1e21: the input guards passed, but the ROUNDED value stringified in
// exponential form, so the closing template literal read "1e+21e-2". Reachable
// from the UI — pasting a 20-digit price yields a finite 1.2e19 — and Postgres
// accepts NaN into a numeric column, so it would have been stored and
// reprinted rather than failing loudly.
test('the rounding helpers never return NaN, at any magnitude', () => {
  assert.equal(round2(1e19), 1e19)
  assert.equal(round3(1e18), 1e18)
  assert.equal(round2(-1e19), -1e19)

  // Every scale, across the whole double range that can reach these functions.
  for (let exponent = -12; exponent <= 25; exponent += 1) {
    for (const mantissa of [1, 1.5, 3.14159, 9.99]) {
      for (const value of [mantissa * 10 ** exponent, -mantissa * 10 ** exponent]) {
        for (const round of [round1, round2, round3]) {
          assert.ok(
            !Number.isNaN(round(value)),
            `NaN for ${value} at scale of ${round.name || 'roundTo'}`
          )
        }
      }
    }
  }
})

// Values that force exponential notation are already integers, so rounding is a
// no-op. Multiplying instead lost precision: 1e21 came back as
// 999999999999999900000.
test('huge magnitudes pass through exactly, not via lossy multiplication', () => {
  assert.equal(round2(1e21), 1e21)
  assert.equal(round3(1e21), 1e21)
  assert.equal(round2(-1e21), -1e21)
})

test('round1 quantizes VAT rates to the numeric(4,1) column scale', () => {
  // A rate the column cannot hold would print at 7,55 % and store as 7,6 % on
  // the same immutable document.
  assert.equal(round1(7.55), 7.6)
  assert.equal(round1(19), 19)
  assert.equal(round1(7), 7)
  assert.equal(round1(-7.55), -7.6)
  assert.equal(round1(Number.NaN), 0)
})
