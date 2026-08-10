import { test } from 'node:test'
import assert from 'node:assert/strict'
import { passwordsMatch } from './password.ts'

test('accepts the exact password', () => {
  assert.equal(passwordsMatch('correct horse battery', 'correct horse battery'), true)
})

test('rejects a wrong password of the same length', () => {
  assert.equal(passwordsMatch('correct horse batteryX', 'correct horse batteryY'), false)
})

test('rejects a wrong password of a different length', () => {
  assert.equal(passwordsMatch('short', 'correct horse battery'), false)
})

test('rejects an empty input', () => {
  assert.equal(passwordsMatch('', 'correct horse battery'), false)
})

test('rejects everything when the expected password is empty', () => {
  // Guards against a missing ADMIN_PASSWORD turning into "any password works".
  assert.equal(passwordsMatch('', ''), false)
  assert.equal(passwordsMatch('anything', ''), false)
})
