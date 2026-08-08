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

test('treats a three-digit group after a comma as a thousands separator', () => {
  assert.equal(parseNum('1,234'), 1234)
})

test('handles null and undefined', () => {
  assert.equal(parseNum(null), 0)
  assert.equal(parseNum(undefined), 0)
})

test('handles a number passed straight through', () => {
  assert.equal(parseNum(80.5), 80.5)
})

test('keeps a leading minus', () => {
  assert.equal(parseNum('-80,50'), -80.5)
})
