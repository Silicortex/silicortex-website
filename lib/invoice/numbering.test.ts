import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  compareInvoiceNumbers,
  MAX_REPORTED_GAPS,
  findGaps,
  formatNumber,
  nextNumber,
  nextNumberFromMax,
  parseInvoiceNumber,
  stornoReference,
  widthFor,
} from './numbering.ts'

test('the counter increments and stays zero-padded', () => {
  assert.equal(nextNumber('RE', 2026, []), 'RE-2026-001')
  assert.equal(nextNumber('RE', 2026, ['RE-2026-001']), 'RE-2026-002')
  assert.equal(nextNumber('RE', 2026, ['RE-2026-009']), 'RE-2026-010')
  assert.equal(nextNumber('RE', 2026, ['RE-2026-099']), 'RE-2026-100')
})

test('the counter restarts at 001 when the year rolls over', () => {
  const issued = ['RE-2026-001', 'RE-2026-002', 'RE-2026-047']
  assert.equal(nextNumber('RE', 2027, issued), 'RE-2027-001')
  // And the old year still continues from its own highest, so a late invoice
  // dated in the previous year does not jump into the new one.
  assert.equal(nextNumber('RE', 2026, issued), 'RE-2026-048')
})

test('each range counts independently', () => {
  const issued = ['RE-2026-001', 'RE-2026-002', 'RE-2026-003', 'ST-2026-001']
  assert.equal(nextNumber('RE', 2026, issued), 'RE-2026-004')
  assert.equal(nextNumber('ST', 2026, issued), 'ST-2026-002')
  assert.equal(nextNumber('AN', 2026, issued), 'AN-2026-001')
})

test('the next number comes from the HIGHEST, not the last or the count', () => {
  // Deleted drafts make a count-based counter lag, and the most recently
  // created record is not the highest once a number has been typed by hand.
  const issued = ['RE-2026-001', 'RE-2026-050', 'RE-2026-002']
  assert.equal(nextNumber('RE', 2026, issued), 'RE-2026-051')
})

test('numbers outside a managed range are ignored by the counter', () => {
  // The old bare format and the e2e prefix must not be read as RE- numbers.
  const issued = ['2026-050', 'E2E-1770000000', 'RE-2026-003', 'nonsense']
  assert.equal(nextNumber('RE', 2026, issued), 'RE-2026-004')
})

test('a range widens to four digits only from the following January', () => {
  const overflowed = Array.from({ length: 3 }, (_, i) => `RE-2026-${1000 + i}`)
  // Mid-year the padding is unchanged; 1000 simply renders as four characters.
  assert.equal(widthFor('RE', 2026, overflowed), 3)
  assert.equal(nextNumber('RE', 2026, overflowed), 'RE-2026-1003')
  // From January the range is four wide, so the first number is 0001, not 001.
  assert.equal(widthFor('RE', 2027, overflowed), 4)
  assert.equal(nextNumber('RE', 2027, overflowed), 'RE-2027-0001')
  // Only the range that overflowed widens.
  assert.equal(nextNumber('ST', 2027, overflowed), 'ST-2027-001')
})

test('a widened range never narrows again in a quiet year', () => {
  const history = ['RE-2026-1200', 'RE-2027-0004']
  assert.equal(nextNumber('RE', 2028, history), 'RE-2028-0001')
  assert.equal(widthFor('RE', 2028, history), 4)
})

test('parsing accepts a managed number and rejects everything else', () => {
  assert.deepEqual(parseInvoiceNumber('RE-2026-001'), {
    prefix: 'RE',
    year: 2026,
    seq: 1,
    width: 3,
  })
  assert.deepEqual(parseInvoiceNumber('ST-2026-1234'), {
    prefix: 'ST',
    year: 2026,
    seq: 1234,
    width: 4,
  })
  assert.equal(parseInvoiceNumber('2026-001'), null) // the old bare format
  assert.equal(parseInvoiceNumber('XX-2026-001'), null) // unknown range
  assert.equal(parseInvoiceNumber('RE-2026-01'), null) // under-padded
  assert.equal(parseInvoiceNumber('RE-26-001'), null) // two-digit year
  assert.equal(parseInvoiceNumber('RE-2026-000'), null) // 0 is not a document
  assert.equal(parseInvoiceNumber('re-2026-001'), null) // lower case
  assert.equal(parseInvoiceNumber(''), null)
})

test('formatNumber never pads below three digits', () => {
  assert.equal(formatNumber('RE', 2026, 7), 'RE-2026-007')
  assert.equal(formatNumber('RE', 2026, 7, 1), 'RE-2026-007')
  assert.equal(formatNumber('RE', 2026, 7, 4), 'RE-2026-0007')
})

test('the database path agrees with the array path', () => {
  const issued = ['RE-2026-001', 'RE-2026-009']
  assert.equal(nextNumberFromMax('RE', 2026, 9, 0), nextNumber('RE', 2026, issued))
  assert.equal(nextNumberFromMax('RE', 2026, 0, 0), 'RE-2026-001')
  // No rows at all comes back from Postgres as null -> coerced to 0.
  assert.equal(nextNumberFromMax('RE', 2027, 0, 1200), 'RE-2027-0001')
})

test('interior gaps are reported, the unused tail is not', () => {
  assert.deepEqual(findGaps('RE', 2026, ['RE-2026-001', 'RE-2026-004']), [
    'RE-2026-002',
    'RE-2026-003',
  ])
  // Nothing above the highest issued number is a gap: it is simply not used yet.
  assert.deepEqual(findGaps('RE', 2026, ['RE-2026-001', 'RE-2026-002']), [])
  assert.deepEqual(findGaps('RE', 2026, []), [])
  // A gap in one range is not a gap in another.
  assert.deepEqual(findGaps('ST', 2026, ['RE-2026-001', 'RE-2026-003']), [])
})

test('display order is numeric, not lexicographic', () => {
  const sorted = ['RE-2026-010', 'RE-2026-009', 'RE-2026-002'].sort(compareInvoiceNumbers)
  assert.deepEqual(sorted, ['RE-2026-002', 'RE-2026-009', 'RE-2026-010'])
})

test('the Storno reference names the invoice it corrects', () => {
  assert.equal(
    stornoReference('RE-2026-001', '10.08.2026'),
    'Storno zu Rechnung RE-2026-001 vom 10.08.2026'
  )
})

test('the gap list is capped, so one typo cannot hang the page', () => {
  // RE-2026-100000 is accepted — the skip-ahead warning is dismissible and § 14
  // prescribes no format — and would otherwise build 99 999 formatted strings and
  // join them into a single table cell.
  const gaps = findGaps('RE', 2026, ['RE-2026-001', 'RE-2026-100000'])
  assert.equal(gaps.length, MAX_REPORTED_GAPS)
  assert.equal(gaps[0], 'RE-2026-002')
  // A normal run is unaffected.
  assert.deepEqual(findGaps('RE', 2026, ['RE-2026-001', 'RE-2026-004']), [
    'RE-2026-002',
    'RE-2026-003',
  ])
})
