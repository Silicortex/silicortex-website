import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  COMPANY_FILE_NAME,
  FORBIDDEN_IN_FILENAME,
  invoiceFileBase,
  invoiceFileName,
  slug,
} from './filename.ts'

test('German umlauts are transliterated, not stripped', () => {
  assert.equal(slug('Müller & Söhne KG'), 'Mueller-Soehne-KG')
  assert.equal(slug('Café Straße 17 e.K.'), 'Cafe-Strasse-17-e-K')
  assert.equal(slug('Groß & Weiß GmbH'), 'Gross-Weiss-GmbH')
  // Capitals transliterate too, and must never become LMHLE. Inside an all-caps
  // word German writes OELMUEHLE, not OeLMUeHLE.
  assert.equal(slug('ÖLMÜHLE Ähre'), 'OELMUEHLE-Aehre')
  assert.equal(slug('Öko GmbH'), 'Oeko-GmbH')
})

test('runs of punctuation collapse to one hyphen and never dangle', () => {
  assert.equal(slug('A -- B'), 'A-B')
  assert.equal(slug('...Anfang und Ende...'), 'Anfang-und-Ende')
  assert.equal(slug('   '), '')
  assert.equal(slug(''), '')
  assert.equal(slug(null), '')
  assert.equal(slug(undefined), '')
})

test('the full file name is number, ISO date, customer, company', () => {
  assert.equal(
    invoiceFileName({
      invoiceNumber: 'RE-2026-001',
      invoiceDate: '2026-08-10',
      customerName: 'Beispiel GmbH',
      companyName: 'Silicortex',
    }),
    'RE-2026-001_2026-08-10_Beispiel-GmbH_Silicortex.pdf'
  )
})

test('the invoice number stays one token, never split across the date', () => {
  // RE-2026-001 is the legal identifier under § 14 Abs. 4 Nr. 4 UStG. Splitting
  // it into RE_<date>_2026-001 would also stop the files sorting by number.
  const name = invoiceFileName({
    invoiceNumber: 'RE-2026-001',
    invoiceDate: '2026-08-11',
    customerName: 'Beispiel GmbH',
    companyName: COMPANY_FILE_NAME,
  })
  assert.match(name, /^RE-2026-001_/)
  assert.equal(name.split('_').length, 4)
  assert.equal(name.split('_')[0], 'RE-2026-001')
})

test('an empty customer collapses rather than doubling the underscore', () => {
  // With a company segment following it, an empty customer would otherwise
  // produce "…_2026-08-10__Silicortex".
  assert.equal(
    invoiceFileName({
      invoiceNumber: 'RE-2026-001',
      invoiceDate: '2026-08-10',
      customerName: '',
      companyName: 'Silicortex',
    }),
    'RE-2026-001_2026-08-10_Silicortex.pdf'
  )
  // Whitespace-only is the same case, and is what an accidentally spaced field
  // actually contains.
  assert.equal(
    invoiceFileName({
      invoiceNumber: 'RE-2026-001',
      invoiceDate: '2026-08-10',
      customerName: '  ',
      companyName: 'Silicortex',
    }),
    'RE-2026-001_2026-08-10_Silicortex.pdf'
  )
  // And with no company passed at all, the name simply ends at the customer.
  assert.equal(
    invoiceFileName({
      invoiceNumber: 'RE-2026-001',
      invoiceDate: '2026-08-10',
      customerName: 'Beispiel GmbH',
    }),
    'RE-2026-001_2026-08-10_Beispiel-GmbH.pdf'
  )
})

test('everything empty still yields a named file, not ".pdf"', () => {
  assert.equal(
    invoiceFileName({ invoiceNumber: '', invoiceDate: '', customerName: '' }),
    'Rechnung.pdf'
  )
})

test('a number containing a slash cannot turn the name into a path', () => {
  // The failure that loses the file rather than merely misnaming it.
  assert.equal(
    invoiceFileBase({
      invoiceNumber: 'RE/2026/001',
      invoiceDate: '2026-08-10',
      customerName: 'A',
    }),
    'RE-2026-001_2026-08-10_A'
  )
})

test('no forbidden character survives in any segment', () => {
  const hostile = 'a/b\\c:d*e?f"g<h>i|j k'
  const name = invoiceFileName({
    invoiceNumber: hostile,
    invoiceDate: hostile,
    customerName: hostile,
    companyName: hostile,
  })
  for (const character of FORBIDDEN_IN_FILENAME) {
    assert.ok(!name.includes(character), `file name contains ${JSON.stringify(character)}: ${name}`)
  }
  assert.match(name, /^[A-Za-z0-9_.-]+$/)
})

test('the printed title is the file name without the extension', () => {
  const args = {
    invoiceNumber: 'RE-2026-001',
    invoiceDate: '2026-08-10',
    customerName: 'Beispiel GmbH',
    companyName: COMPANY_FILE_NAME,
  }
  assert.equal(`${invoiceFileBase(args)}.pdf`, invoiceFileName(args))
})
