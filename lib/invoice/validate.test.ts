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
    docType: 'invoice' as const,
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
    quoteRef: '',
    quoteRefDate: '',
    reverseCharge: false,
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

test('a negative line is accepted — a Stornorechnung has nothing else', () => {
  const storno = invoice({
    stornoFor: 'RE-2026-001',
    stornoForDate: '2026-08-10',
    items: [{ description: 'Entwicklung', quantity: 1, unit: 'Std', unitPrice: -100, vatRate: 19 }],
  })
  assert.deepEqual(check(storno), [])
})

test('a zero line is still refused', () => {
  // Non-zero is the rule, not "any sign": a 0 € line carries no amount at all.
  const zero = invoice({
    items: [{ description: 'Entwicklung', quantity: 1, unit: 'Std', unitPrice: 0, vatRate: 19 }],
  })
  assert.ok(check(zero).some((e) => e.includes('ungleich 0')))
})

/** An intra-EU invoice needs the SENDER's own USt-IdNr., which the default
 *  fixture deliberately leaves empty (§ 14 is satisfied by the Steuernummer
 *  alone for a domestic invoice). */
const euSender = () => sender({ vatId: 'DE464133329' })

/** A complete intra-EU invoice: EU customer VAT ID, every line at 0 %. */
function euInvoice(patch = {}) {
  return invoice({
    reverseCharge: true,
    customerVatId: 'ATU12345678',
    items: [{ description: 'Entwicklung', quantity: 1, unit: 'Std', unitPrice: 100, vatRate: 0 }],
    ...patch,
  })
}

test('a complete reverse-charge invoice passes', () => {
  assert.deepEqual(check(euInvoice(), euSender()), [])
})

test('reverse charge with a German rate on any line is refused', () => {
  // The guarantee, not the UI. Three UI paths keep the rate at 0 % — the toggle
  // rewrite, the 0 % default for new lines, the locked select — and only one has
  // to break to produce an invoice with a 19 % line AND the note.
  const mixed = euInvoice({
    items: [
      { description: 'A', quantity: 1, unit: 'Std', unitPrice: 100, vatRate: 0 },
      { description: 'B', quantity: 1, unit: 'Std', unitPrice: 50, vatRate: 19 },
    ],
  })
  assert.ok(check(mixed, euSender()).some((e) => e.includes('alle Positionen müssen 0 %')))
})

test('reverse charge without the customer VAT ID is refused', () => {
  assert.ok(
    check(euInvoice({ customerVatId: '' }), euSender()).some((e) =>
      e.includes('USt-IdNr. des Kunden ist zwingend')
    )
  )
})

test('reverse charge to a German customer is refused', () => {
  // A domestic sale carries German VAT; the note would be wrong.
  assert.ok(
    check(euInvoice({ customerVatId: 'DE464133329' }), euSender()).some((e) =>
      e.includes('nicht für deutsche Kunden')
    )
  )
})

test('reverse charge to a non-EU customer is refused', () => {
  assert.ok(
    check(euInvoice({ customerVatId: 'CH123456789' }), euSender()).some((e) =>
      e.includes('kein EU-Mitgliedstaat')
    )
  )
  // Only input that cannot be read as a VAT ID at all gets the format message.
  // A word like "nonsense" uppercases to NO + NSENSE and is caught one branch
  // later as a non-member state, which is also correct.
  assert.ok(
    check(euInvoice({ customerVatId: 'X1' }), euSender()).some((e) =>
      e.includes('keine gültige Nummer')
    )
  )
})

test('reverse charge requires the sender\'s own USt-IdNr., not just a Steuernummer', () => {
  const withoutVatId = sender({ vatId: '' })
  const errors = check(euInvoice(), withoutVatId)
  assert.ok(errors.some((e) => e.includes('eigene USt-IdNr. ist bei Reverse Charge zwingend')))
  // The plain § 14 rule is still satisfied by the Steuernummer alone.
  assert.ok(!errors.some((e) => e.includes('Steuernummer oder USt-IdNr. fehlt')))
})

test('an ISSUED reverse-charge invoice still reprints', () => {
  // Immutable: refusing to print it would leave a legal document that can never
  // be produced again, which is worse than any rule it breaks.
  const broken = euInvoice({
    status: 'issued',
    customerVatId: '',
    items: [{ description: 'A', quantity: 1, unit: 'Std', unitPrice: 100, vatRate: 19 }],
  })
  assert.deepEqual(check(broken, sender({ vatId: '' })), [])
})

/** An Angebot: § 14 does not apply to it, so the fields it prescribes are not
 *  demanded of an offer. */
function quote(patch = {}) {
  return invoice({ docType: 'quote', proposedNumber: 'AN-2026-001', ...patch })
}

test('an Angebot needs neither a Leistungszeitraum nor the customer address', () => {
  assert.deepEqual(check(quote({ serviceDate: '', customerStreet: '', customerZipCity: '' })), [])
})

test('an Angebot still needs a customer, a number, a date and a position', () => {
  const errors = check(
    quote({ customerName: '', proposedNumber: '', invoiceDate: '', items: [] })
  )
  assert.ok(errors.some((e) => e.includes('Kundenname fehlt')))
  // Named as an offer, not as an invoice.
  assert.ok(errors.some((e) => e === 'Angebotsnummer fehlt.'))
  assert.ok(errors.some((e) => e === 'Angebotsdatum fehlt.'))
  assert.ok(errors.some((e) => e.includes('Position')))
  assert.ok(!errors.some((e) => e.includes('Leistungsdatum')))
})

test('an invoice still demands what § 14 requires', () => {
  // The relaxation must not have leaked from the quote path to the invoice path.
  const errors = check(invoice({ serviceDate: '', customerStreet: '' }))
  assert.ok(errors.some((e) => e.includes('Leistungsdatum')))
  assert.ok(errors.some((e) => e.includes('Adresse des Kunden')))
})

test("an Angebot still needs the sender's own block", () => {
  // Frozen with an empty letterhead it would be useless.
  const errors = check(quote(), sender({ name: '', street: '' }))
  assert.ok(errors.some((e) => e.includes('Stammdaten: Name fehlt')))
})

test('reverse-charge rules still apply to an Angebot', () => {
  // A quote promising 0 % on a wrong basis misleads the client before any invoice
  // exists.
  const errors = check(
    quote({ reverseCharge: true, customerVatId: '' }),
    sender({ vatId: 'DE464133329' })
  )
  assert.ok(errors.some((e) => e.includes('USt-IdNr. des Kunden ist zwingend')))
})
