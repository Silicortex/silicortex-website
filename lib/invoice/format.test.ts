import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatAmount, formatCurrency, formatDateDe, formatQuantity } from './format.ts'

test('formats amounts with German separators', () => {
  assert.equal(formatAmount(1234.5), '1.234,50')
  assert.equal(formatAmount(80.5), '80,50')
  assert.equal(formatAmount(0), '0,00')
})

test('formats currency with a trailing euro sign', () => {
  assert.equal(formatCurrency(1234.5), '1.234,50 €')
})

test('formats quantities without forcing decimals', () => {
  assert.equal(formatQuantity(2), '2')
  assert.equal(formatQuantity(1.5), '1,5')
  assert.equal(formatQuantity(0.125), '0,125')
})

test('formats an ISO date as DD.MM.YYYY', () => {
  // A type="date" input renders per browser locale — "08/07/2026" is
  // ambiguous on a German invoice, so print output is formatted here.
  assert.equal(formatDateDe('2026-08-08'), '08.08.2026')
  assert.equal(formatDateDe('2026-12-31'), '31.12.2026')
})

test('returns an empty string for empty or malformed dates', () => {
  assert.equal(formatDateDe(''), '')
  assert.equal(formatDateDe('nonsense'), '')
})
