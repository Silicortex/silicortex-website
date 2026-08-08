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
  listInvoicesAction,
  loadInvoiceAction,
  nextNumberAction,
  saveDraftAction,
} from '@/app/admin/(protected)/actions.ts'
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

  const totals = useMemo(() => computeTotals(invoice.items), [invoice.items])

  const [archive, setArchive] = useState(invoices)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function updateInvoice(next: InvoiceDraft) {
    if (next.paymentTerms !== invoice.paymentTerms) setTermsTouched(true)
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

  return (
    <>
      <nav className="admin-no-print flex gap-1 border-b border-gray-200 bg-white px-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={
              tab === t.id
                ? 'border-b-2 border-[#1f5f4f] px-4 py-3 text-sm font-semibold text-[#1f5f4f]'
                : 'px-4 py-3 text-sm text-gray-500'
            }
          >
            {t.label}
          </button>
        ))}
      </nav>

      {notice && (
        <p className="admin-no-print mx-auto max-w-[840px] px-6 pt-4 text-sm text-gray-600" role="status">
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
              className="rounded bg-[#1f5f4f] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {busy ? 'Speichere …' : 'Ins Archiv legen'}
            </button>
          </div>
          <InvoiceSheet
            invoice={invoice}
            sender={masterData.invoiceVisible}
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
