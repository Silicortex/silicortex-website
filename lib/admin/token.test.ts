import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.SESSION_SECRET = 'test-secret-at-least-32-bytes-long!!'

const { signSessionToken, verifySessionToken, SESSION_MAX_AGE_SECONDS } =
  await import('./token.ts')

test('a freshly signed token verifies', async () => {
  const token = await signSessionToken()
  const payload = await verifySessionToken(token)
  assert.equal(payload?.sub, 'owner')
})

test('the token expires seven days out', async () => {
  const token = await signSessionToken()
  const payload = await verifySessionToken(token)
  const secondsFromNow = payload!.exp - Math.floor(Date.now() / 1000)
  assert.ok(Math.abs(secondsFromNow - SESSION_MAX_AGE_SECONDS) <= 5)
})

test('garbage is rejected', async () => {
  assert.equal(await verifySessionToken('not-a-token'), null)
  assert.equal(await verifySessionToken(''), null)
})

test('a token signed with a different secret is rejected', async () => {
  const token = await signSessionToken()
  process.env.SESSION_SECRET = 'a-completely-different-secret-value!!'
  assert.equal(await verifySessionToken(token), null)
  process.env.SESSION_SECRET = 'test-secret-at-least-32-bytes-long!!'
})

test('an unsigned "alg: none" token is rejected', async () => {
  // Classic JWT downgrade attack.
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify({ sub: 'owner', exp: 9999999999 })).toString('base64url')
  assert.equal(await verifySessionToken(`${header}.${body}.`), null)
})
