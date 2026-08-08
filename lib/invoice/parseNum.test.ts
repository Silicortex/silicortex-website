import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseNum } from './parseNum.ts'

// The nine cases from the spec. This function is the single most common
// bug in German invoicing tools: type="number" discards "80,50" entirely.
const CASES: [string, number][] = [
  ['80', 80],
  ['80,50', 80.5],
  ['80.50', 80.5],
  ['1.234,56', 1234.56],
  ['1,234.56', 1234.56],
  ['1,5', 1.5],
  ['95 €', 95],
  ['', 0],
  ['abc', 0],
]

for (const [input, expected] of CASES) {
  test(`parses ${JSON.stringify(input)} as ${expected}`, () => {
    assert.equal(parseNum(input), expected)
  })
}

// A comma is always the decimal separator — never thousands.
test('treats any comma as the decimal separator', () => {
  assert.equal(parseNum('1,234'), 1.234)
  assert.equal(parseNum('0,005'), 0.005)
  assert.equal(parseNum('80,505'), 80.505)
})

// Regression: "1.234" previously parsed as 1.234, printing 1,23 € for an
// invoice line the owner meant as 1.234,00 € — a 1000x undercharge.
test('treats a lone dot grouping three digits as thousands', () => {
  assert.equal(parseNum('1.234'), 1234)
  assert.equal(parseNum('1.500'), 1500)
  assert.equal(parseNum('1.234.567'), 1234567)
})

// A grouping never starts with 0, so these stay decimals.
test('treats other lone dots as decimal points', () => {
  assert.equal(parseNum('0.005'), 0.005)
  assert.equal(parseNum('1.2345'), 1.2345)
  assert.equal(parseNum('0.5'), 0.5)
})

test('round-trips what formatQuantity prints', () => {
  // formatQuantity(0.005) renders "0,005"; re-parsing it must not change it.
  assert.equal(parseNum('0,005'), 0.005)
})

// Regression: a stray letter used to be stripped, fusing digits into a
// plausible but wrong price (8O,50 -> 8.5). It must be rejected instead.
test('rejects input containing unexpected characters', () => {
  assert.equal(parseNum('8O,50'), 0)
  assert.equal(parseNum('1e3'), 0)
  assert.equal(parseNum('NaN'), 0)
  assert.equal(parseNum('Infinity'), 0)
  assert.equal(parseNum('1.2.3'), 0)
  assert.equal(parseNum('80,50,60'), 0)
  assert.equal(parseNum('-'), 0)
})

test('strips currency noise only at the edges', () => {
  assert.equal(parseNum('€80,50'), 80.5)
  assert.equal(parseNum('80.50 EUR'), 80.5)
  assert.equal(parseNum('  80,50  '), 80.5)
  assert.equal(parseNum('1 234,56'), 1234.56)
  assert.equal(parseNum('8eur0'), 0)
})

test('handles null and undefined', () => {
  assert.equal(parseNum(null), 0)
  assert.equal(parseNum(undefined), 0)
})

test('handles a number passed straight through', () => {
  assert.equal(parseNum(80.5), 80.5)
  assert.equal(parseNum(Number.NaN), 0)
  assert.equal(parseNum(Number.POSITIVE_INFINITY), 0)
})

test('keeps a leading minus', () => {
  assert.equal(parseNum('-80,50'), -80.5)
})

test('tolerates a trailing or leading separator', () => {
  assert.equal(parseNum('80,'), 80)
  assert.equal(parseNum(',50'), 0.5)
})
