import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aggregateEuSales, formatPeriodDe, quarterOf } from './euSales.ts'

test('months map to the right quarter, including the boundaries', () => {
  assert.equal(quarterOf('2026-01'), '2026-Q1')
  assert.equal(quarterOf('2026-03'), '2026-Q1')
  assert.equal(quarterOf('2026-04'), '2026-Q2')
  assert.equal(quarterOf('2026-06'), '2026-Q2')
  assert.equal(quarterOf('2026-07'), '2026-Q3')
  assert.equal(quarterOf('2026-09'), '2026-Q3')
  assert.equal(quarterOf('2026-10'), '2026-Q4')
  assert.equal(quarterOf('2026-12'), '2026-Q4')
})

test('a malformed period is passed through rather than mangled', () => {
  assert.equal(quarterOf('2026-Q3'), '2026-Q3')
  assert.equal(quarterOf(''), '')
})

test('months are labelled in German, quarters left alone', () => {
  assert.equal(formatPeriodDe('2026-07'), '2026-07 (Juli)')
  assert.equal(formatPeriodDe('2026-12'), '2026-12 (Dezember)')
  assert.equal(formatPeriodDe('2026-Q3'), '2026-Q3')
})

test('monthly grouping keeps the months apart', () => {
  const rows = [
    { month: '2026-07', customerVatId: 'ATU12345678', net: 100, count: 1 },
    { month: '2026-08', customerVatId: 'ATU12345678', net: 200, count: 1 },
  ]
  assert.deepEqual(aggregateEuSales(rows, 'month'), [
    { period: '2026-08', customerVatId: 'ATU12345678', net: 200, count: 1 },
    { period: '2026-07', customerVatId: 'ATU12345678', net: 100, count: 1 },
  ])
})

test('a quarter is exactly the sum of its months, per customer', () => {
  const rows = [
    { month: '2026-07', customerVatId: 'ATU12345678', net: 100, count: 1 },
    { month: '2026-08', customerVatId: 'ATU12345678', net: 200, count: 2 },
    { month: '2026-09', customerVatId: 'FR12345678901', net: 50, count: 1 },
    { month: '2026-10', customerVatId: 'ATU12345678', net: 5, count: 1 },
  ]
  assert.deepEqual(aggregateEuSales(rows, 'quarter'), [
    { period: '2026-Q4', customerVatId: 'ATU12345678', net: 5, count: 1 },
    { period: '2026-Q3', customerVatId: 'ATU12345678', net: 300, count: 3 },
    { period: '2026-Q3', customerVatId: 'FR12345678901', net: 50, count: 1 },
  ])
})

test('summed cents do not acquire a floating-point tail', () => {
  // 0.1 + 0.2 is 0.30000000000000004 in binary floating point, and a total like
  // that on a tax report is indefensible.
  const rows = [
    { month: '2026-07', customerVatId: 'ATU12345678', net: 0.1, count: 1 },
    { month: '2026-08', customerVatId: 'ATU12345678', net: 0.2, count: 1 },
  ]
  assert.deepEqual(aggregateEuSales(rows, 'quarter'), [
    { period: '2026-Q3', customerVatId: 'ATU12345678', net: 0.3, count: 2 },
  ])
})

test('a Storno reduces the period it falls in', () => {
  const rows = [
    { month: '2026-07', customerVatId: 'ATU12345678', net: 1000, count: 1 },
    { month: '2026-08', customerVatId: 'ATU12345678', net: -1000, count: 1 },
  ]
  assert.deepEqual(aggregateEuSales(rows, 'quarter'), [
    { period: '2026-Q3', customerVatId: 'ATU12345678', net: 0, count: 2 },
  ])
  // Monthly, the two stay visible separately — which is what makes a cancelled
  // month explainable rather than just netting to nothing.
  assert.deepEqual(aggregateEuSales(rows, 'month').map((r) => r.net), [-1000, 1000])
})

test('grouping an empty list is empty, not a period with no rows', () => {
  assert.deepEqual(aggregateEuSales([], 'month'), [])
  assert.deepEqual(aggregateEuSales([], 'quarter'), [])
})
