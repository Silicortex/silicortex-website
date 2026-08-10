import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateForPrint } from './validate.ts'
import type { InvoiceDraft } from './types.ts'
import type { MasterDataInvoiceVisible } from '../db/masterData.ts'

/** A sender complete enough to satisfy § 14 UStG. */
function sender(patch: Partial<MasterDataInvoiceVisible> = {}): MasterDataInvoiceVisible {
  return {
    name: 'TEST Freiberufler',
    statusLabel: 'Freiberufler',
    activity: 'TEST',
    street: 'Teststr. 1',
    zipCity: '00000 Teststadt',
    country: 'Deutschland',
    phone: '',
    email: '',
    website: '',
    taxNumber: 'TEST-000/000/00000',
    vatId: '',
    taxOffice: 'Finanzamt Teststadt',
    defaultVatRate: 19,
    paymentTermsDays: 14,
    accountHolder: 'TEST Freiberufler',
    iban: 'DE00 0000 0000 0000 0000 00',
    bankName: 'TEST Bank',
    bic: '',
    ...patch,
  }
}

/** Validates a draft with a complete sender, so existing cases keep testing
 *  exactly what they tested before the sender check existed. */
function check(inv: InvoiceDraft, snd = sender()): string[] {
  return validateForPrint(inv, snd, { enforceSender: inv.status === 'draft' })
}

function invoice(patch: Partial<InvoiceDraft> = {}): InvoiceDraft {
  return {
    id: null,
    status: 'draft',
    invoiceNumber: null,
    proposedNumber: 'RE-2026-001',
    invoiceDate: '2026-08-08',
    serviceDate: 'Juli 2026',
    customerNumber: '',
    customerName: 'Testkunde GmbH',
    customerStreet: 'Teststr. 1',
    customerZipCity: '65195 Wiesbaden',
    customerCountry: 'Deutschland',
    stornoFor: '',
    stornoForDate: '',
    customerVatId: '',
    paymentTerms: 'Zahlbar in 14 Tagen.',
    items: [{ description: 'Entwicklung', quantity: 2, unit: 'Std', unitPrice: 80.5, vatRate: 19 }],
    senderSnapshot: null,
    storedTotals: null,
    ...patch,
  }
}

test('a complete invoice has no errors', () => {
  assert.deepEqual(check(invoice()), [])
})

test('requires the customer name', () => {
  assert.ok(check(invoice({ customerName: '  ' })).some((m) => m.includes('Kundenname')))
})

test('requires a customer address', () => {
  const errors = check(invoice({ customerStreet: '', customerZipCity: '' }))
  assert.ok(errors.some((m) => m.includes('Adresse')))
})

test('requires an invoice number, invoice date and service date', () => {
  assert.ok(check(invoice({ proposedNumber: '' })).some((m) => m.includes('Rechnungsnummer')))
  assert.ok(check(invoice({ invoiceDate: '' })).some((m) => m.includes('Rechnungsdatum')))
  assert.ok(check(invoice({ serviceDate: '' })).some((m) => m.includes('Leistung')))
})

test('requires at least one line item with a description and a price above zero', () => {
  const noItems = check(invoice({ items: [] }))
  assert.ok(noItems.some((m) => m.includes('Position')))

  const emptyDescription = check(
    invoice({ items: [{ description: '', quantity: 1, unit: 'Std', unitPrice: 80, vatRate: 19 }] })
  )
  assert.ok(emptyDescription.some((m) => m.includes('Position')))

  const zeroPrice = check(
    invoice({ items: [{ description: 'Arbeit', quantity: 1, unit: 'Std', unitPrice: 0, vatRate: 19 }] })
  )
  assert.ok(zeroPrice.some((m) => m.includes('Position')))
})

test('an issued invoice validates on its assigned number', () => {
  const issued = invoice({ status: 'issued', invoiceNumber: '2026-001', proposedNumber: '' })
  assert.deepEqual(check(issued), [])
})

// The defect this guards: master_data starts entirely empty, so issuing before
// filling Stammdaten froze an invoice with a blank sender block and a footer
// reading "Steuernummer: · USt-IdNr.: ·" — invalid under § 14 UStG, immutable
// by design, and correctable only by voiding it with another invoice.
test('a draft cannot be issued without the sender name', () => {
  const errors = check(invoice(), sender({ name: '  ' }))
  assert.ok(errors.some((m) => m.includes('Stammdaten: Name fehlt.')), errors.join(' | '))
})

test('a draft cannot be issued with an incomplete own address', () => {
  assert.ok(check(invoice(), sender({ street: '' })).some((m) => m.includes('Adresse')))
  assert.ok(check(invoice(), sender({ zipCity: '' })).some((m) => m.includes('Adresse')))
})

test('§ 14 UStG is satisfied by EITHER the Steuernummer or the USt-IdNr.', () => {
  // Neither: an error.
  assert.ok(
    check(invoice(), sender({ taxNumber: '', vatId: '' })).some((m) => m.includes('§ 14 UStG'))
  )
  // Either one alone: no error. Requiring both would block a valid invoice.
  assert.deepEqual(check(invoice(), sender({ taxNumber: 'TEST-1', vatId: '' })), [])
  assert.deepEqual(check(invoice(), sender({ taxNumber: '', vatId: 'DE000000000' })), [])
})

test('an entirely empty sender produces every sender error at once', () => {
  const empty = sender({ name: '', street: '', zipCity: '', taxNumber: '', vatId: '' })
  const errors = check(invoice(), empty)
  assert.equal(errors.length, 3, errors.join(' | '))
})

// The safety valve: an invoice issued while Stammdaten were incomplete is
// immutable, so it must stay printable forever. Enforcing the sender on every
// print would leave a legal document that can never be produced again.
test('an ALREADY ISSUED invoice with an empty sender still validates', () => {
  const issued = invoice({ status: 'issued', invoiceNumber: '2026-001', proposedNumber: '' })
  const empty = sender({ name: '', street: '', zipCity: '', taxNumber: '', vatId: '' })
  assert.deepEqual(
    validateForPrint(issued, empty, { enforceSender: false }),
    [],
    'an issued invoice must remain reprintable'
  )
})
