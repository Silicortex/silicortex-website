import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cancelledInvoiceNumbers, isSettled, visibleInvoices } from './archive.ts'
import type { InvoiceSummary } from './types.ts'

// Only the fields the filtering reads are meaningful; the amounts are here because
// the type wants them.
function summary(overrides: Partial<InvoiceSummary>): InvoiceSummary {
  return {
    id: overrides.invoiceNumber ?? overrides.proposedNumber ?? 'id',
    status: 'issued',
    docType: 'invoice',
    invoiceNumber: null,
    proposedNumber: '',
    invoiceDate: '2026-08-11',
    customerName: 'Testkunde GmbH',
    stornoFor: '',
    reverseCharge: false,
    customerVatId: '',
    netTotal: 100,
    vatTotal: 19,
    grossTotal: 119,
    ...overrides,
  }
}

const invoice = summary({ invoiceNumber: 'RE-2026-001' })
const storno = summary({
  invoiceNumber: 'ST-2026-001',
  docType: 'storno',
  stornoFor: 'RE-2026-001',
  netTotal: -100,
  vatTotal: -19,
  grossTotal: -119,
})
const open = summary({ invoiceNumber: 'RE-2026-002' })

test('an invoice counts as cancelled once an issued Storno points at it', () => {
  const cancelled = cancelledInvoiceNumbers([invoice, storno, open])
  assert.deepEqual([...cancelled], ['RE-2026-001'])
  assert.equal(isSettled(invoice, cancelled), true)
  assert.equal(isSettled(storno, cancelled), true)
  assert.equal(isSettled(open, cancelled), false)
})

test('a DRAFT Storno cancels nothing yet', () => {
  // It can still be discarded. Treating it as a cancellation would strike through
  // and hide an invoice that is still owed — and would hide the button needed to
  // cancel it for real.
  const draftStorno = summary({
    ...storno,
    invoiceNumber: null,
    proposedNumber: 'ST-2026-001',
    status: 'draft',
  })
  const cancelled = cancelledInvoiceNumbers([invoice, draftStorno])
  assert.deepEqual([...cancelled], [])
  assert.equal(isSettled(invoice, cancelled), false)
})

test('hiding removes BOTH halves of a settled pair, and nothing else', () => {
  const visible = visibleInvoices([invoice, storno, open], true)
  assert.deepEqual(
    visible.map((i) => i.invoiceNumber),
    ['RE-2026-002']
  )
})

test('the unfiltered list is every document, in the order given', () => {
  // The default. A list that hid records without being asked is the GoBD problem.
  const visible = visibleInvoices([invoice, storno, open], false)
  assert.deepEqual(
    visible.map((i) => i.invoiceNumber),
    ['RE-2026-001', 'ST-2026-001', 'RE-2026-002']
  )
})

test('hiding never drops a draft, which holds no number and cancels nothing', () => {
  const draft = summary({ status: 'draft', proposedNumber: 'RE-2026-003' })
  const visible = visibleInvoices([invoice, storno, draft], true)
  assert.deepEqual(
    visible.map((i) => i.proposedNumber),
    ['RE-2026-003']
  )
})

test('a Storno whose original is missing is still recognised as settled', () => {
  // The original cannot actually vanish — the triggers forbid it — but the filter
  // must not depend on that to avoid leaving a stray negative line on screen.
  const cancelled = cancelledInvoiceNumbers([storno])
  assert.equal(isSettled(storno, cancelled), true)
  assert.deepEqual(visibleInvoices([storno], true), [])
})

test('an invoice with no number yet is never matched by an empty stornoFor', () => {
  // `stornoFor` defaults to '' and `invoiceNumber` is null on a draft. A careless
  // comparison would treat every draft as cancelled by every non-Storno.
  const draft = summary({ status: 'draft', proposedNumber: 'RE-2026-004' })
  const cancelled = cancelledInvoiceNumbers([draft, summary({ invoiceNumber: 'RE-2026-005' })])
  assert.deepEqual([...cancelled], [])
  assert.equal(isSettled(draft, cancelled), false)
})
