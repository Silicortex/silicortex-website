// Export formats for retention and for the Steuerberater.
//
// § 147 AO requires invoices to be kept for ten years, readable and reproducible.
// The database can reprint any issued invoice, but a database is a single point of
// failure, so this produces files that can be stored off-platform.

import { formatAmount } from './format.ts'

export const BACKUP_VERSION = 1

/** Values Excel would evaluate as a formula rather than show as text.
 *
 *  A customer literally named "=SUM(A1)" is unlikely, but a CSV is opened by
 *  double-clicking and the cost of being wrong is code execution in the
 *  Steuerberater's spreadsheet. Applied to TEXT fields only — the numeric ones
 *  are produced by this module, not typed by anyone. */
function neutraliseFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
}

/** One CSV cell.
 *
 *  Semicolon-separated with comma decimals, because that is what a German Excel
 *  reads without an import dialog. */
function csvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'ja' : 'nein'
  // Money and quantities are formatted German-style by the caller; a raw number
  // here would print with a decimal point.
  const text = typeof value === 'number' ? formatAmount(value) : neutraliseFormula(value)
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(rows: readonly (readonly (string | number | boolean | null)[])[]): string {
  // A BOM, because Excel otherwise reads UTF-8 as the local codepage and every
  // umlaut in a customer name arrives broken. CRLF for the same reason.
  return '﻿' + rows.map((row) => row.map(csvCell).join(';')).join('\r\n') + '\r\n'
}

export type ExportInvoice = {
  invoiceNumber: string | null
  proposedNumber: string
  status: string
  invoiceDate: string
  serviceDate: string
  customerName: string
  customerStreet: string
  customerZipCity: string
  customerCountry: string
  customerVatId: string
  customerNumber: string
  reverseCharge: boolean
  stornoFor: string
  paymentTerms: string
  netTotal: number
  vatTotal: number
  grossTotal: number
  vatBreakdown: { rate: number; net: number; vat: number }[]
}

/** The rates broken out as their own columns, because that is how the figures get
 *  booked. A rate the invoice does not use is left empty rather than 0,00 €, so a
 *  glance down the column shows which invoices carried which rate. */
const CSV_RATES = [19, 7, 0] as const

export const CSV_HEADER = [
  'Rechnungsnummer',
  'Status',
  'Rechnungsdatum',
  'Leistungszeitraum',
  'Kundenname',
  'Straße',
  'PLZ und Ort',
  'Land',
  'USt-IdNr. Kunde',
  'Kundennummer',
  'Reverse Charge',
  'Storno zu',
  ...CSV_RATES.flatMap((rate) => [`Netto ${rate} %`, `USt. ${rate} %`]),
  'Netto gesamt',
  'USt. gesamt',
  'Brutto gesamt',
  'Zahlungsbedingungen',
]

export function invoicesCsv(invoices: readonly ExportInvoice[]): string {
  const rows: (string | number | boolean | null)[][] = [[...CSV_HEADER]]

  for (const invoice of invoices) {
    const group = (rate: number) => invoice.vatBreakdown.find((g) => g.rate === rate)
    rows.push([
      // A draft has no number yet; showing the proposed one keeps the row
      // identifiable without implying a number was assigned.
      invoice.invoiceNumber ?? `(Entwurf ${invoice.proposedNumber})`,
      invoice.status === 'issued' ? 'festgeschrieben' : 'Entwurf',
      invoice.invoiceDate,
      invoice.serviceDate,
      invoice.customerName,
      invoice.customerStreet,
      invoice.customerZipCity,
      invoice.customerCountry,
      invoice.customerVatId,
      invoice.customerNumber,
      invoice.reverseCharge,
      invoice.stornoFor,
      ...CSV_RATES.flatMap((rate) => {
        const found = group(rate)
        return [found ? found.net : null, found ? found.vat : null]
      }),
      invoice.netTotal,
      invoice.vatTotal,
      invoice.grossTotal,
      invoice.paymentTerms,
    ])
  }

  return toCsv(rows)
}

/** The file name of an export, dated so successive backups sort and never
 *  overwrite each other. */
export function exportFileName(kind: 'backup' | 'rechnungen', isoDate: string): string {
  const extension = kind === 'backup' ? 'json' : 'csv'
  return `silicortex-${kind}_${isoDate}.${extension}`
}
