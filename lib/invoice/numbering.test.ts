import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compareInvoiceNumbers, nextInvoiceNumber } from './numbering.ts'

test('starts at 001 for the current year when nothing is issued yet', () => {
  assert.equal(nextInvoiceNumber(null, 2026), '2026-001')
})

test('increments the trailing digit block and keeps its width', () => {
  assert.equal(nextInvoiceNumber('2026-001', 2026), '2026-002')
  assert.equal(nextInvoiceNumber('2026-009', 2026), '2026-010')
  assert.equal(nextInvoiceNumber('R-2026-099', 2026), 'R-2026-100')
})

test('grows the width when the digits overflow', () => {
  assert.equal(nextInvoiceNumber('2026-999', 2026), '2026-1000')
})

test('falls back to the year pattern when there is no trailing digit block', () => {
  assert.equal(nextInvoiceNumber('RECHNUNG', 2026), '2026-001')
})

test('sorts numerically per German collation, not lexically', () => {
  const sorted = ['2026-010', '2026-002', '2026-009'].sort(compareInvoiceNumbers)
  assert.deepEqual(sorted, ['2026-002', '2026-009', '2026-010'])
})
