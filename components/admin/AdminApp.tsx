'use client'

import { useMemo, useState } from 'react'
import type { MasterData } from '@/lib/db/masterData.ts'
import { computeTotals } from '@/lib/invoice/totals.ts'
import { todayIso } from '@/lib/invoice/format.ts'
import {
  defaultPaymentTerms,
  emptyInvoice,
  newInvoiceId,
  type InvoiceDraft,
  type InvoiceSummary,
} from '@/lib/invoice/types.ts'
import {
  deleteDraftAction,
  issueInvoiceAction,
  listInvoicesAction,
  loadInvoiceAction,
  nextNumberAction,
  saveDraftAction,
} from '@/app/admin/(protected)/actions.ts'
import { validateForPrint } from '@/lib/invoice/validate.ts'
import { ArchiveTable } from './ArchiveTable.tsx'
import { InvoiceSheet } from './InvoiceSheet.tsx'
import { MasterDataForm } from './MasterDataForm.tsx'

type Tab = 'invoice' | 'archive' | 'master'

const TABS: { id: Tab; label: string }[] = [
  { id: 'invoice', label: 'Rechnung erstellen' },
  { id: 'archive', label: 'Meine Rechnungen' },
  { id: 'master', label: 'Stammdaten' },
]

export function AdminApp({
  masterData: initialMasterData,
  invoices,
  nextNumber,
}: {
  masterData: MasterData
  invoices: InvoiceSummary[]
  nextNumber: string
}) {
  const [tab, setTab] = useState<Tab>('invoice')
  const [masterData, setMasterData] = useState(initialMasterData)
  const [termsTouched, setTermsTouched] = useState(false)
  const [invoice, setInvoice] = useState<InvoiceDraft>(() =>
    emptyInvoice({
      proposedNumber: nextNumber,
      invoiceDate: todayIso(),
      paymentTerms: defaultPaymentTerms(initialMasterData.invoiceVisible.paymentTermsDays),
      vatRate: initialMasterData.invoiceVisible.defaultVatRate,
    })
  )

  const liveTotals = useMemo(() => computeTotals(invoice.items), [invoice.items])
  // An issued invoice prints the figures it was issued with; a draft
  // recomputes live so edits show up immediately.
  const totals = invoice.status === 'issued' && invoice.storedTotals ? invoice.storedTotals : liveTotals

  const [archive, setArchive] = useState(invoices)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [printErrors, setPrintErrors] = useState<string[]>([])

  function updateInvoice(next: InvoiceDraft) {
    if (next.paymentTerms !== invoice.paymentTerms) setTermsTouched(true)
    if (printErrors.length) setPrintErrors([])
    setInvoice(next)
  }

  // Master data drives payment terms until the owner edits them by hand.
  function updateMasterData(next: MasterData) {
    setMasterData(next)
    if (!termsTouched) {
      setInvoice((current) => ({
        ...current,
        paymentTerms: defaultPaymentTerms(next.invoiceVisible.paymentTermsDays),
      }))
    }
  }

  async function refreshArchive() {
    setArchive(await listInvoicesAction())
  }

  async function saveToArchive() {
    setBusy(true)
    const result = await saveDraftAction(invoice)
    setBusy(false)
    if (!result.ok) return setNotice(result.error)
    setInvoice({ ...invoice, id: result.id })
    await refreshArchive()
    setNotice('Ins Archiv gelegt.')
  }

  async function loadFromArchive(id: string) {
    const loaded = await loadInvoiceAction(id)
    if (!loaded) return setNotice('Rechnung nicht gefunden.')
    setInvoice(loaded)
    setTermsTouched(true) // never overwrite the terms of a stored invoice
    setTab('invoice')
    setNotice(loaded.status === 'issued' ? 'Festgeschriebene Rechnung — nur Ansicht.' : null)
  }

  async function copyFromArchive(id: string) {
    const loaded = await loadInvoiceAction(id)
    if (!loaded) return setNotice('Rechnung nicht gefunden.')
    setInvoice({
      ...loaded,
      // A fresh id: a copy is a NEW invoice, and minting it here keeps the
      // double-click protection that `emptyInvoice` relies on.
      id: newInvoiceId(),
      status: 'draft',
      invoiceNumber: null,
      // Asked of the server, not derived from the client's archive copy.
      proposedNumber: await nextNumberAction(),
      invoiceDate: todayIso(),
    })
    // A copy inherits the original's payment terms, which may have been edited
    // by hand. Without this, a later Zahlungsziel change in Stammdaten would
    // silently overwrite them.
    setTermsTouched(true)
    setTab('invoice')
    setNotice('Kopie erstellt.')
  }

  async function deleteFromArchive(id: string) {
    if (!confirm('Diesen Entwurf wirklich löschen?')) return
    const result = await deleteDraftAction(id)
    if (!result.ok) return setNotice(result.error ?? 'Fehler.')
    await refreshArchive()
    // A fresh id, not null: null would reopen the double-click duplication that
    // client-minted ids exist to prevent.
    if (invoice.id === id) setInvoice({ ...invoice, id: newInvoiceId() })
    setNotice('Entwurf gelöscht.')
  }

  async function printInvoice() {
    // Validate the sender that will ACTUALLY print: an issued invoice prints
    // its frozen snapshot, a draft prints live master data.
    const printedSender =
      invoice.status === 'issued' && invoice.senderSnapshot
        ? invoice.senderSnapshot
        : masterData.invoiceVisible
    const errors = validateForPrint(invoice, printedSender, {
      enforceSender: invoice.status === 'draft',
    })
    setPrintErrors(errors)
    if (errors.length) return

    if (invoice.status === 'draft') {
      const confirmed = confirm(
        'Rechnung festschreiben? Danach ist sie nicht mehr änderbar. ' +
          'Eine Korrektur erfolgt später über eine neue Rechnung.'
      )
      if (!confirmed) return

      setBusy(true)
      try {
        const saved = await saveDraftAction(invoice)
        if (!saved.ok) return setNotice(saved.error)

        const issued = await issueInvoiceAction(saved.id, invoice.proposedNumber)
        if (!issued.ok) {
          await refreshArchive() // the draft was saved, so the archive changed
          return setNotice(issued.error)
        }

        setInvoice({
          ...invoice,
          id: saved.id,
          status: 'issued',
          invoiceNumber: issued.invoiceNumber,
          senderSnapshot: issued.senderSnapshot,
          storedTotals: liveTotals,
        })
        await refreshArchive()
        setNotice(`Festgeschrieben als ${issued.invoiceNumber}.`)
      } catch {
        setNotice('Festschreiben fehlgeschlagen. Bitte Verbindung prüfen und erneut versuchen.')
        return
      } finally {
        setBusy(false)
      }
    }

    window.print()
  }

  return (
    <>
      <nav className="admin-no-print border-b border-black/8 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={
                tab === t.id
                  ? 'relative px-4 py-3 text-sm font-semibold text-slate-900'
                  : 'px-4 py-3 text-sm text-slate-500 transition hover:text-slate-900'
              }
            >
              {t.label}
              {tab === t.id && (
                // The site navbar's active marker: a hairline of brand blue.
                <span className="absolute inset-x-3 -bottom-px h-px bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {notice && (
        <p className="admin-no-print mx-auto max-w-[840px] px-6 pt-4 text-sm text-slate-600" role="status">
          {notice}
        </p>
      )}

      {tab === 'invoice' && (
        <>
          <div className="admin-no-print mx-auto flex max-w-[840px] items-center gap-3 px-6 pt-6">
            <button
              type="button"
              onClick={saveToArchive}
              disabled={busy || invoice.status === 'issued'}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-500 disabled:opacity-60"
            >
              {busy ? 'Speichere …' : 'Ins Archiv legen'}
            </button>
            <button
              type="button"
              onClick={printInvoice}
              disabled={busy}
              className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-500/50 hover:text-blue-600 disabled:opacity-60"
            >
              Drucken / PDF
            </button>
          </div>
          {printErrors.length > 0 && (
            <div
              role="alert"
              className="admin-no-print mx-auto mt-3 max-w-[840px] rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              <p className="mb-1 font-semibold">Die Rechnung ist noch nicht vollständig:</p>
              <ul className="list-inside list-disc">
                {printErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <InvoiceSheet
            invoice={invoice}
            // An issued invoice prints the sender frozen into it; a draft
            // follows live master data so Stammdaten edits show up immediately.
            sender={
              invoice.status === 'issued' && invoice.senderSnapshot
                ? invoice.senderSnapshot
                : masterData.invoiceVisible
            }
            totals={totals}
            readOnly={invoice.status === 'issued'}
            onChange={updateInvoice}
          />
        </>
      )}
      {tab === 'archive' && (
        <ArchiveTable
          invoices={archive}
          onLoad={loadFromArchive}
          onCopy={copyFromArchive}
          onDelete={deleteFromArchive}
        />
      )}
      {tab === 'master' && (
        <MasterDataForm masterData={masterData} onChange={updateMasterData} />
      )}
    </>
  )
}
