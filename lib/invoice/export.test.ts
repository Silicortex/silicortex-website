import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CSV_HEADER, exportFileName, invoicesCsv, toCsv } from './export.ts'

const BOM = '﻿'

test('the CSV opens correctly in a German Excel', () => {
  const csv = toCsv([['a', 'b'], [1234.5, 'x']])
  assert.ok(csv.startsWith(BOM), 'without a BOM Excel reads UTF-8 as the local codepage')
  assert.ok(csv.includes('\r\n'), 'Excel expects CRLF')
  assert.ok(csv.includes('a;b'), 'semicolon separated')
  assert.ok(csv.includes('1.234,50'), 'German thousands and decimal separators')
})

test('separators and quotes inside a value cannot break the row apart', () => {
  const csv = toCsv([['Meier; Söhne', 'sagt "hallo"', 'zwei\nzeilen']])
  assert.ok(csv.includes('"Meier; Söhne"'))
  assert.ok(csv.includes('"sagt ""hallo"""'))
  assert.ok(csv.includes('"zwei\nzeilen"'))
})

test('a value Excel would evaluate as a formula is neutralised', () => {
  // A CSV gets opened by double-clicking, and the cost of being wrong is code
  // running in the Steuerberater's spreadsheet.
  assert.ok(toCsv([['=SUM(A1)']]).includes("'=SUM(A1)"))
  assert.ok(toCsv([['+1']]).includes("'+1"))
  assert.ok(toCsv([['@foo']]).includes("'@foo"))
  // Ordinary text is untouched.
  assert.ok(toCsv([['Müller & Söhne KG']]).includes('Müller & Söhne KG'))
  // Numbers come from this module, never from a text field, so they are not
  // prefixed even though a negative one starts with a minus.
  assert.ok(toCsv([[-161]]).includes('-161,00'))
})

test('booleans read as German, and empty cells stay empty', () => {
  const csv = toCsv([[true, false, null]])
  assert.ok(csv.includes('ja;nein;'))
})

const invoice = {
  invoiceNumber: 'RE-2026-001',
  proposedNumber: 'RE-2026-001',
  status: 'issued',
  invoiceDate: '2026-08-11',
  serviceDate: 'Juli 2026',
  customerName: 'Müller & Söhne KG',
  customerStreet: 'Beispielweg 12',
  customerZipCity: '60311 Frankfurt am Main',
  customerCountry: 'Deutschland',
  customerVatId: '',
  customerNumber: 'K-1001',
  reverseCharge: false,
  stornoFor: '',
  paymentTerms: 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
  netTotal: 2867.5,
  vatTotal: 544.83,
  grossTotal: 3412.33,
  vatBreakdown: [{ rate: 19, net: 2867.5, vat: 544.83 }],
}

test('each VAT rate gets its own column, and unused rates stay empty', () => {
  const [header, row] = invoicesCsv([invoice]).replace(BOM, '').trim().split('\r\n')
  assert.equal(header.split(';').length, CSV_HEADER.length)
  const cells = row.split(';')
  assert.equal(cells.length, CSV_HEADER.length, 'row and header must line up')
  // 19 % is used, 7 % and 0 % are not — empty, not 0,00 €, so a glance down the
  // column shows which invoices carried which rate.
  assert.equal(cells[CSV_HEADER.indexOf('Netto 19 %')], '2.867,50')
  assert.equal(cells[CSV_HEADER.indexOf('USt. 19 %')], '544,83')
  assert.equal(cells[CSV_HEADER.indexOf('Netto 7 %')], '')
  assert.equal(cells[CSV_HEADER.indexOf('USt. 7 %')], '')
  assert.equal(cells[CSV_HEADER.indexOf('Netto 0 %')], '')
})

test('a draft is identifiable without pretending it has a number', () => {
  const csv = invoicesCsv([{ ...invoice, status: 'draft', invoiceNumber: null }])
  assert.ok(csv.includes('(Entwurf RE-2026-001)'))
  assert.ok(csv.includes('Entwurf;'))
})

test('a reverse-charge invoice shows its 0 % net and the flag', () => {
  const csv = invoicesCsv([
    {
      ...invoice,
      reverseCharge: true,
      customerVatId: 'ATU12345678',
      vatBreakdown: [{ rate: 0, net: 2417.5, vat: 0 }],
      netTotal: 2417.5,
      vatTotal: 0,
      grossTotal: 2417.5,
    },
  ])
  assert.ok(csv.includes('ATU12345678'))
  assert.ok(csv.includes('ja'))
  assert.ok(csv.includes('2.417,50'))
})

test('export file names are dated so backups never overwrite each other', () => {
  assert.equal(exportFileName('backup', '2026-08-11'), 'silicortex-backup_2026-08-11.json')
  assert.equal(exportFileName('rechnungen', '2026-08-11'), 'silicortex-rechnungen_2026-08-11.csv')
})
