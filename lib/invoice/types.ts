import type { InvoiceItemInput } from './totals.ts'

export type InvoiceStatus = 'draft' | 'issued'

export type InvoiceDraft = {
  id: string | null
  status: InvoiceStatus
  invoiceNumber: string | null // assigned only when issued
  proposedNumber: string // the editable field while still a draft
  invoiceDate: string // ISO yyyy-mm-dd
  serviceDate: string // free text: a date or a period ("Juli 2026")
  customerNumber: string
  customerName: string
  customerStreet: string
  customerZipCity: string
  customerCountry: string
  customerVatId: string
  paymentTerms: string
  items: InvoiceItemInput[]
}

export type InvoiceSummary = {
  id: string
  status: InvoiceStatus
  invoiceNumber: string | null
  proposedNumber: string
  invoiceDate: string
  customerName: string
  netTotal: number
  vatTotal: number
  grossTotal: number
}

export function emptyItem(vatRate: number): InvoiceItemInput {
  return { description: '', quantity: 1, unit: 'Std', unitPrice: 0, vatRate }
}

export function defaultPaymentTerms(days: number): string {
  return `Zahlbar innerhalb von ${days} Tagen ohne Abzug.`
}

export function emptyInvoice(args: {
  proposedNumber: string
  invoiceDate: string
  paymentTerms: string
  vatRate: number
}): InvoiceDraft {
  return {
    id: null,
    status: 'draft',
    invoiceNumber: null,
    proposedNumber: args.proposedNumber,
    invoiceDate: args.invoiceDate,
    serviceDate: '',
    customerNumber: '',
    customerName: '',
    customerStreet: '',
    customerZipCity: '',
    customerCountry: 'Deutschland',
    customerVatId: '',
    paymentTerms: args.paymentTerms,
    items: [emptyItem(args.vatRate)],
  }
}
