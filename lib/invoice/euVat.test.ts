import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  EU_VAT_PREFIXES,
  isEuVatId,
  isOtherEuMemberState,
  REVERSE_CHARGE_NOTE,
  vatIdPrefix,
} from './euVat.ts'

test('Greece is EL, not GR', () => {
  // Greece's VAT prefix differs from its ISO country code. A list written from
  // country codes silently rejects every Greek customer.
  assert.ok(isOtherEuMemberState('EL123456789'))
  assert.equal(isEuVatId('GR123456789'), false)
})

test('all 27 member states are present and Northern Ireland is not', () => {
  assert.equal(EU_VAT_PREFIXES.length, 27)
  // XI is a valid VAT prefix and part of the EU VAT area for GOODS, but not for
  // services — and this tool invoices services.
  assert.equal(isEuVatId('XI123456789'), false)
  assert.equal(isEuVatId('GB123456789'), false)
  assert.equal(isEuVatId('CH123456789'), false)
  assert.equal(isEuVatId('US123456789'), false)
})

test('a German customer is not a reverse-charge case', () => {
  // Domestic sale: it carries German VAT, not a reverse-charge note.
  assert.ok(isEuVatId('DE464133329'))
  assert.equal(isOtherEuMemberState('DE464133329'), false)
})

test('spacing and punctuation on input are tolerated', () => {
  assert.equal(vatIdPrefix('ATU 123 456 78'), 'AT')
  assert.equal(vatIdPrefix('at.12345678'), 'AT')
  assert.ok(isOtherEuMemberState('  FR 12 345678901  '))
})

test('nonsense is rejected rather than guessed at', () => {
  assert.equal(vatIdPrefix(''), null)
  assert.equal(vatIdPrefix('123456789'), null) // no country prefix
  assert.equal(vatIdPrefix('A1'), null) // too short to be a VAT ID
  assert.equal(vatIdPrefix('DE'), null) // prefix only, no number
  assert.equal(isEuVatId('Rechnung'), false)
})

test('the printed note carries no statutory citation', () => {
  assert.equal(REVERSE_CHARGE_NOTE, 'Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge)')
  // § 13b would be plainly wrong (that is reverse charge on services RECEIVED in
  // Germany), and § 14a requires an indication, not a cite.
  assert.doesNotMatch(REVERSE_CHARGE_NOTE, /§|Art\./)
})
