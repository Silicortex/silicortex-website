'use client'

import { useMemo, useState } from 'react'
import type { MasterData } from '@/lib/db/masterData.ts'
import { computeTotals } from '@/lib/invoice/totals.ts'
import { todayIso } from '@/lib/invoice/format.ts'
import { defaultPaymentTerms, emptyInvoice, type InvoiceDraft } from '@/lib/invoice/types.ts'
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
  nextNumber,
}: {
  masterData: MasterData
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

      {tab === 'invoice' && (
        <InvoiceSheet
          invoice={invoice}
          sender={masterData.invoiceVisible}
          totals={totals}
          readOnly={invoice.status === 'issued'}
          onChange={updateInvoice}
        />
      )}
      {tab === 'archive' && (
        <p className="p-6 text-sm text-gray-500">Wird in einem späteren Schritt ergänzt.</p>
      )}
      {tab === 'master' && (
        <MasterDataForm masterData={masterData} onChange={updateMasterData} />
      )}
    </>
  )
}
