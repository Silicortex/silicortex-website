'use client'

import { useMemo, useState } from 'react'
import { formatCurrency, formatDateDe } from '@/lib/invoice/format.ts'
import type { InvoiceSummary } from '@/lib/invoice/types.ts'
import { cancelledInvoiceNumbers, isSettled, visibleInvoices } from '@/lib/invoice/archive.ts'
import { InfoHint } from './InfoHint.tsx'

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
  // Off by default. A list that hides records the moment it loads is the thing
  // GoBD objects to; one the operator collapses himself, with the control right
  // there showing it is collapsed, is not. Nothing is deleted either way.
  const [hideSettled, setHideSettled] = useState(false)
  const cancelled = useMemo(() => cancelledInvoiceNumbers(invoices), [invoices])
  const rows = useMemo(() => visibleInvoices(invoices, hideSettled), [invoices, hideSettled])
  const settledCount = invoices.length - visibleInvoices(invoices, true).length

  // Drafts are not revenue: the strip counts issued invoices only.
  //
  // Deliberately over ALL invoices, never over the filtered rows: a cancelled
  // invoice and its Storno sum to zero, so the totals do not move when they are
  // hidden — and a total that changed depending on a display checkbox would be
  // the kind of figure nobody can reconcile against a tax return.
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
    // `admin-archive` is a test hook, like `admin-sheet`: the Nummernjournal below
    // lists the same invoice numbers in its own table, so a row locator that is not
    // scoped to this table matches two rows and silently asserts against the wrong
    // one.
    <div className="admin-archive mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="admin-accent text-lg font-semibold tracking-tight">Meine Rechnungen</h2>
        {settledCount > 0 && (
          <span className="flex items-center gap-2 text-sm text-slate-600">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={hideSettled}
                onChange={(event) => setHideSettled(event.target.checked)}
                className="cursor-pointer"
              />
              Stornierte ausblenden ({settledCount})
            </label>
            {/* A sibling of the label, never inside it: everything inside a label
                becomes part of the checkbox's accessible name. */}
            <InfoHint hint="Blendet stornierte Rechnungen und die zugehörigen Stornorechnungen aus dieser Liste aus, damit nur noch die offenen Dokumente zu sehen sind. Gelöscht wird dabei nichts: die Dokumente bleiben unverändert gespeichert, zählen weiter in den Summen mit und stehen im Nummernjournal. Zum Anzeigen einfach wieder abwählen." />
          </span>
        )}
      </div>

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
          {rows.map((invoice) => {
            const isCancelled =
              invoice.invoiceNumber !== null && cancelled.has(invoice.invoiceNumber)
            return (
            <tr
              key={invoice.id}
              data-settled={isSettled(invoice, cancelled) ? 'true' : undefined}
              className={
                isSettled(invoice, cancelled)
                  ? 'border-b border-black/5 text-slate-400'
                  : 'border-b border-black/5'
              }
            >
              <td className="py-2">
                {/* Struck through, not hidden: the number is still assigned to this
                    document forever, and seeing it struck is what tells the owner
                    at a glance that it no longer stands. */}
                <span className={isCancelled ? 'line-through' : undefined}>
                  {invoice.invoiceNumber ?? invoice.proposedNumber}
                </span>
                {invoice.status === 'draft' && (
                  <span className="ml-2 rounded-full border border-black/8 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Entwurf
                  </span>
                )}
                {isCancelled && (
                  <span className="ml-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                    Storniert
                  </span>
                )}
                {invoice.docType === 'storno' && invoice.stornoFor !== '' && (
                  <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Storno zu {invoice.stornoFor}
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
                    Angebot is not a receivable.

                    And only ONCE. A second Storno would issue a second negating
                    document, deducting the same invoice twice. The server refuses
                    it too — this only keeps the offer off screen. */}
                {invoice.status === 'issued' && invoice.docType === 'invoice' && !isCancelled && (
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
            )
          })}
        </tbody>
      </table>

      {rows.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500">
          Alle Dokumente sind storniert und ausgeblendet. Häkchen entfernen, um sie
          wieder anzuzeigen.
        </p>
      )}

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
        {/* Said out loud, because a filtered list that does not admit it is filtered
            is how a document gets believed to be missing. The totals above still
            include the hidden pairs — they net to zero. */}
        {hideSettled && settledCount > 0 && (
          <span className="text-slate-400">
            ({settledCount} stornierte Dokumente ausgeblendet, in den Summen weiterhin
            enthalten)
          </span>
        )}
      </div>
    </div>
  )
}
