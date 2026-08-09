import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateForPrint } from './validate.ts'
import type { InvoiceDraft } from './types.ts'

function invoice(patch: Partial<InvoiceDraft> = {}): InvoiceDraft {
  return {
    id: null,
    status: 'draft',
    invoiceNumber: null,
    proposedNumber: '2026-001',
    invoiceDate: '2026-08-08',
    serviceDate: 'Juli 2026',
    customerNumber: '',
    customerName: 'Testkunde GmbH',
    customerStreet: 'Teststr. 1',
    customerZipCity: '65195 Wiesbaden',
    customerCountry: 'Deutschland',
    customerVatId: '',
    paymentTerms: 'Zahlbar in 14 Tagen.',
    items: [{ description: 'Entwicklung', quantity: 2, unit: 'Std', unitPrice: 80.5, vatRate: 19 }],
    senderSnapshot: null,
    storedTotals: null,
    ...patch,
  }
}

test('a complete invoice has no errors', () => {
  assert.deepEqual(validateForPrint(invoice()), [])
})

test('requires the customer name', () => {
  assert.ok(validateForPrint(invoice({ customerName: '  ' })).some((m) => m.includes('Kundenname')))
})

test('requires a customer address', () => {
  const errors = validateForPrint(invoice({ customerStreet: '', customerZipCity: '' }))
  assert.ok(errors.some((m) => m.includes('Adresse')))
})

test('requires an invoice number, invoice date and service date', () => {
  assert.ok(validateForPrint(invoice({ proposedNumber: '' })).some((m) => m.includes('Rechnungsnummer')))
  assert.ok(validateForPrint(invoice({ invoiceDate: '' })).some((m) => m.includes('Rechnungsdatum')))
  assert.ok(validateForPrint(invoice({ serviceDate: '' })).some((m) => m.includes('Leistung')))
})

test('requires at least one line item with a description and a price above zero', () => {
  const noItems = validateForPrint(invoice({ items: [] }))
  assert.ok(noItems.some((m) => m.includes('Position')))

  const emptyDescription = validateForPrint(
    invoice({ items: [{ description: '', quantity: 1, unit: 'Std', unitPrice: 80, vatRate: 19 }] })
  )
  assert.ok(emptyDescription.some((m) => m.includes('Position')))

  const zeroPrice = validateForPrint(
    invoice({ items: [{ description: 'Arbeit', quantity: 1, unit: 'Std', unitPrice: 0, vatRate: 19 }] })
  )
  assert.ok(zeroPrice.some((m) => m.includes('Position')))
})

test('an issued invoice validates on its assigned number', () => {
  const issued = invoice({ status: 'issued', invoiceNumber: '2026-001', proposedNumber: '' })
  assert.deepEqual(validateForPrint(issued), [])
})
