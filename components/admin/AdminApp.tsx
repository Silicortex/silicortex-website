'use client'

import { useEffect, useMemo, useState } from 'react'
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
  burnNumberAction,
  createStornoAction,
  deleteDraftAction,
  issueInvoiceAction,
  listInvoicesAction,
  loadInvoiceAction,
  nextNumberAction,
  euSalesAction,
  numberJournalAction,
  saveDraftAction,
} from '@/app/admin/(protected)/actions.ts'
import { validateForPrint } from '@/lib/invoice/validate.ts'
import { COMPANY_FILE_NAME, invoiceFileBase } from '@/lib/invoice/filename.ts'
// Aliased: `nextNumber` is already the name of this component's prop, and the
// shadowed import silently became a string.
import { nextNumber as nextNumberInRange, parseInvoiceNumber } from '@/lib/invoice/numbering.ts'
import { ArchiveTable } from './ArchiveTable.tsx'
import { NumberJournal, type JournalEntry } from './NumberJournal.tsx'
import { EuSalesReport } from './EuSalesReport.tsx'
import type { EuSaleMonthRow } from '@/lib/invoice/euSales.ts'
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
  journal: initialJournal,
  euSales: initialEuSales,
}: {
  masterData: MasterData
  invoices: InvoiceSummary[]
  nextNumber: string
  journal: JournalEntry[]
  euSales: EuSaleMonthRow[]
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
  const [journal, setJournal] = useState(initialJournal)
  const [euSales, setEuSales] = useState(initialEuSales)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [printErrors, setPrintErrors] = useState<string[]>([])

  // Chrome uses document.title as the default file name in its "Save as PDF"
  // dialog, and there is no other way to influence it. Note this sets only the
  // TITLE on beforeprint — the printed CONTENT is plain render (print twins), so
  // no DOM mutation races the print.
  const fileBase = useMemo(
    () =>
      invoiceFileBase({
        invoiceNumber: invoice.invoiceNumber ?? invoice.proposedNumber,
        invoiceDate: invoice.invoiceDate,
        customerName: invoice.customerName,
        companyName: COMPANY_FILE_NAME,
      }),
    [invoice.invoiceNumber, invoice.proposedNumber, invoice.invoiceDate, invoice.customerName]
  )

  useEffect(() => {
    // Captured after the previous cleanup has already restored it, so this is
    // always the real page title and never a file name left over from a
    // re-render during printing.
    const original = document.title
    const onBeforePrint = () => {
      document.title = fileBase
    }
    const onAfterPrint = () => {
      document.title = original
    }
    window.addEventListener('beforeprint', onBeforePrint)
    window.addEventListener('afterprint', onAfterPrint)
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint)
      window.removeEventListener('afterprint', onAfterPrint)
      document.title = original
    }
  }, [fileBase])

  /** Warns BEFORE the number is claimed if it jumps past the next free one.
   *
   *  Gaps are legal, but at a Betriebsprüfung a missing number is read as hidden
   *  revenue and has to be explained. It is far easier to explain a gap you chose
   *  than one you created by mistyping 100 for 010 — and once the number is
   *  claimed it cannot be taken back. Deliberately a warning, not a refusal:
   *  skipping ahead on purpose stays allowed. */
  function skipAheadWarning(): string {
    const typed = parseInvoiceNumber(invoice.proposedNumber)
    if (!typed) return ''

    const expected = nextNumberInRange(
      typed.prefix,
      typed.year,
      journal.map((entry) => entry.number)
    )
    const expectedSeq = parseInvoiceNumber(expected)?.seq
    if (expectedSeq === undefined || typed.seq <= expectedSeq) return ''

    const skipped = typed.seq - expectedSeq
    return (
      `Achtung: ${invoice.proposedNumber} überspringt ` +
      `${skipped === 1 ? 'eine Nummer' : `${skipped} Nummern`} ` +
      `(nächste freie Nummer wäre ${expected}). Die Lücke bleibt bestehen und ` +
      'muss bei einer Prüfung begründet werden.\n\n'
    )
  }

  /** Turning reverse charge ON rewrites every existing line to 0 %.
   *
   *  Three paths have to hold for a reverse-charge invoice to carry no German
   *  rate: this rewrite, the 0 % default for newly added lines, and the locked
   *  rate select. `validateForPrint` checks the result anyway — one of the three
   *  breaking would otherwise produce an invoice with a 19 % line AND the note,
   *  which is invalid, immutable, and correctable only by a Stornorechnung. */
  function toggleReverseCharge(on: boolean) {
    setPrintErrors([])
    setInvoice((current) => ({
      ...current,
      reverseCharge: on,
      items: on ? current.items.map((item) => ({ ...item, vatRate: 0 })) : current.items,
    }))
  }

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
    const [invoiceList, journalList, euSalesList] = await Promise.all([
      listInvoicesAction(),
      numberJournalAction(),
      euSalesAction(),
    ])
    setArchive(invoiceList)
    setJournal(journalList)
    setEuSales(euSalesList)
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
      // A copy is a new invoice, never a Storno: without this, copying a Storno
      // would print the STORNO heading and its reference line under a fresh RE-
      // number, claiming to cancel an invoice it has nothing to do with.
      stornoFor: '',
      stornoForDate: '',
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

  /** A Storno never edits or reuses the original's number: this opens a NEW
   *  document from the GS- range that points back at it. Nothing is written
   *  until the owner saves, so a misclick burns no number. */
  async function stornoFromArchive(id: string) {
    const storno = await createStornoAction(id)
    if (!storno) return setNotice('Nur festgeschriebene Rechnungen können storniert werden.')
    setInvoice(storno)
    setTermsTouched(true)
    setTab('invoice')
    setNotice(`Storno-Entwurf zu ${storno.stornoFor} erstellt. Nummer ${storno.proposedNumber}.`)
  }

  async function burnNumberFromJournal(number: string, reason: string) {
    const result = await burnNumberAction(number, reason)
    if (!result.ok) return setNotice(result.error ?? 'Fehler.')
    await refreshArchive()
    setNotice(`Nummer ${number.trim()} als vergeben vermerkt.`)
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
        `${skipAheadWarning()}Rechnung festschreiben? Danach ist sie nicht mehr änderbar. ` +
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
            {/* Screen only — the document itself carries the note, not a
                checkbox. */}
            <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                aria-label="Reverse Charge (EU-Kunde)"
                checked={invoice.reverseCharge}
                disabled={invoice.status === 'issued'}
                onChange={(e) => toggleReverseCharge(e.target.checked)}
              />
              Reverse Charge (EU-Kunde)
            </label>
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
        <>
          <ArchiveTable
            invoices={archive}
            onLoad={loadFromArchive}
            onCopy={copyFromArchive}
            onStorno={stornoFromArchive}
            onDelete={deleteFromArchive}
          />
          <NumberJournal
            journal={journal}
            year={Number(invoice.invoiceDate.slice(0, 4))}
            onBurn={burnNumberFromJournal}
          />
          <EuSalesReport rows={euSales} />
        </>
      )}
      {tab === 'master' && (
        <MasterDataForm masterData={masterData} onChange={updateMasterData} />
      )}
    </>
  )
}
