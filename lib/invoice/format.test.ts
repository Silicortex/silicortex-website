import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatAmount, formatCurrency, formatDateDe, formatQuantity, todayIso } from './format.ts'

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

// Regression: shape-only validation printed impossible dates on invoices.
test('rejects dates that match the shape but do not exist', () => {
  assert.equal(formatDateDe('2026-02-30'), '')
  assert.equal(formatDateDe('2026-13-01'), '')
  assert.equal(formatDateDe('2026-00-10'), '')
  assert.equal(formatDateDe('2026-04-31'), '')
})

test('accepts a real leap day', () => {
  assert.equal(formatDateDe('2028-02-29'), '29.02.2028')
})

// Regression: the invoice date must follow Europe/Berlin, not the server's
// clock. On Vercel (UTC) a naive date is a day behind just after midnight.
test('todayIso follows the German calendar date, not UTC', () => {
  // 22:30 UTC in August is 00:30 the next day in Berlin (UTC+2).
  assert.equal(todayIso(new Date('2026-08-08T22:30:00Z')), '2026-08-09')
  // 23:30 UTC on New Year's Eve is 00:30 on 1 January in Berlin (UTC+1).
  assert.equal(todayIso(new Date('2025-12-31T23:30:00Z')), '2026-01-01')
  // Midday is unambiguous in either zone.
  assert.equal(todayIso(new Date('2026-08-08T12:00:00Z')), '2026-08-08')
})
