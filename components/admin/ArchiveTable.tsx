'use client'

import { formatCurrency, formatDateDe } from '@/lib/invoice/format.ts'
import type { InvoiceSummary } from '@/lib/invoice/types.ts'

export function ArchiveTable({
  invoices,
  onLoad,
  onCopy,
  onStorno,
  onConvertQuote,
  onDelete,
}: {
  invoices: InvoiceSummary[]
  onLoad: (id: string) => void
  onCopy: (id: string) => void
  onStorno: (id: string) => void
  onConvertQuote: (id: string) => void
  onDelete: (id: string) => void
}) {
  // Drafts are not revenue: the strip counts issued invoices only.
  const issued = invoices.filter((i) => i.status === 'issued')
  const sum = (pick: (i: InvoiceSummary) => number) =>
    issued.reduce((total, invoice) => total + pick(invoice), 0)

  if (invoices.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <p className="text-sm text-slate-500">
          Noch keine Rechnungen. Erstelle im Tab „Rechnung erstellen“ eine Rechnung und
          speichere sie – sie erscheint dann hier.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h2 className="admin-accent mb-6 text-lg font-semibold tracking-tight">Meine Rechnungen</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <th className="py-2 font-medium">Nummer</th>
            <th className="py-2 font-medium">Datum</th>
            <th className="py-2 font-medium">Kunde</th>
            <th className="py-2 text-right font-medium">Netto</th>
            <th className="py-2 text-right font-medium">USt.</th>
            <th className="py-2 text-right font-medium">Brutto</th>
            <th className="py-2 text-right font-medium">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b border-black/5">
              <td className="py-2">
                {invoice.invoiceNumber ?? invoice.proposedNumber}
                {invoice.status === 'draft' && (
                  <span className="ml-2 rounded-full border border-black/8 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Entwurf
                  </span>
                )}
              </td>
              <td className="py-2">{formatDateDe(invoice.invoiceDate)}</td>
              <td className="py-2">{invoice.customerName}</td>
              <td className="py-2 text-right tabular-nums">{formatCurrency(invoice.netTotal)}</td>
              <td className="py-2 text-right tabular-nums">{formatCurrency(invoice.vatTotal)}</td>
              <td className="py-2 text-right tabular-nums">{formatCurrency(invoice.grossTotal)}</td>
              <td className="py-2 text-right">
                <button type="button" onClick={() => onLoad(invoice.id)} className="px-2 text-blue-600 underline decoration-blue-300 underline-offset-4 transition hover:text-blue-500">
                  Laden
                </button>
                <button type="button" onClick={() => onCopy(invoice.id)} className="px-2 text-blue-600 underline decoration-blue-300 underline-offset-4 transition hover:text-blue-500">
                  Kopie
                </button>
                {/* Only an issued ANGEBOT can be converted, and converting twice is
                    allowed — billing an accepted offer in two parts is ordinary. */}
                {invoice.status === 'issued' && invoice.docType === 'quote' && (
                  <button
                    type="button"
                    onClick={() => onConvertQuote(invoice.id)}
                    className="px-2 text-blue-600 underline decoration-blue-300 underline-offset-4 transition hover:text-blue-500"
                  >
                    In Rechnung umwandeln
                  </button>
                )}
                {/* Only an issued INVOICE can be cancelled: a draft is edited or
                    deleted, a Storno of a Storno is not a correction, and an
                    Angebot is not a receivable. */}
                {invoice.status === 'issued' && invoice.docType === 'invoice' && (
                  <button
                    type="button"
                    onClick={() => onStorno(invoice.id)}
                    className="px-2 text-blue-600 underline decoration-blue-300 underline-offset-4 transition hover:text-blue-500"
                  >
                    Storno
                  </button>
                )}
                {invoice.status === 'draft' && (
                  <button
                    type="button"
                    aria-label={`Entwurf ${invoice.proposedNumber} löschen`}
                    onClick={() => onDelete(invoice.id)}
                    className="px-2 text-slate-400 transition hover:text-red-600"
                  >
                    ✕
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 rounded-2xl border border-black/8 bg-white/85 p-4 text-sm shadow-sm shadow-slate-950/5">
        <span>
          Festgeschriebene Rechnungen: <strong>{issued.length}</strong>
        </span>
        <span>
          Gesamt netto: <strong>{formatCurrency(sum((i) => i.netTotal))}</strong>
        </span>
        <span>
          Gesamt USt.: <strong>{formatCurrency(sum((i) => i.vatTotal))}</strong>
        </span>
        <span>
          Gesamt brutto: <strong>{formatCurrency(sum((i) => i.grossTotal))}</strong>
        </span>
        {invoices.length !== issued.length && (
          <span className="text-slate-400">
            ({invoices.length - issued.length} Entwürfe nicht enthalten)
          </span>
        )}
      </div>
    </div>
  )
}
