'use server'

import { refresh } from 'next/cache'
import { redirect } from 'next/navigation'
import { clearSessionCookie, requireSession } from '@/lib/admin/session.ts'
import {
  loadMasterData,
  saveMasterData,
  type MasterData,
  type MasterDataInvoiceVisible,
} from '@/lib/db/masterData.ts'
import {
  buildInvoiceFromQuote,
  buildStornoDraft,
  burnNumber,
  listEuSales,
  deleteDraft,
  issueInvoice,
  listInvoices,
  listNumberJournal,
  loadInvoice,
  nextNumberFor,
  saveDraft,
} from '@/lib/db/invoices.ts'
import { todayIso } from '@/lib/invoice/format.ts'
import type { RangePrefix } from '@/lib/invoice/numbering.ts'
import { validateForPrint } from '@/lib/invoice/validate.ts'
import type { InvoiceDraft, InvoiceSummary } from '@/lib/invoice/types.ts'

export async function logoutAction(): Promise<void> {
  await requireSession()
  await clearSessionCookie()
  redirect('/admin/login')
}

export async function saveMasterDataAction(
  data: MasterData
): Promise<{ ok: boolean; error?: string }> {
  await requireSession() // first statement: actions are directly reachable POST endpoints
  try {
    await saveMasterData(data)
    refresh()
    return { ok: true }
  } catch (error) {
    console.error('saveMasterData failed', error)
    return { ok: false, error: 'Speichern fehlgeschlagen.' }
  }
}

export async function saveDraftAction(
  draft: InvoiceDraft
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireSession()
  try {
    const id = await saveDraft(draft)
    refresh()
    return { ok: true, id }
  } catch (error) {
    console.error('saveDraft failed', error)
    return { ok: false, error: 'Speichern fehlgeschlagen. Festgeschriebene Rechnungen sind unveränderbar.' }
  }
}

export async function loadInvoiceAction(id: string): Promise<InvoiceDraft | null> {
  await requireSession()
  return loadInvoice(id)
}

export async function deleteDraftAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireSession()
  try {
    await deleteDraft(id)
    refresh()
    return { ok: true }
  } catch (error) {
    console.error('deleteDraft failed', error)
    return { ok: false, error: 'Löschen fehlgeschlagen.' }
  }
}

export async function listInvoicesAction(): Promise<InvoiceSummary[]> {
  await requireSession()
  return listInvoices()
}

// Single source of truth for numbering: the client never derives the next
// number from its own copy of the archive.
export async function nextNumberAction(prefix: RangePrefix = 'RE'): Promise<string> {
  await requireSession()
  return nextNumberFor(prefix, currentYear())
}

// From the German calendar date, not the host clock — see page.tsx.
function currentYear(): number {
  return Number(todayIso().slice(0, 4))
}

export async function numberJournalAction() {
  await requireSession()
  return listNumberJournal()
}

export async function euSalesAction() {
  await requireSession()
  return listEuSales()
}

/** Records a number as used with no invoice behind it. The reason is required:
 *  an unexplained gap is the thing that invites a Schätzung. */
export async function burnNumberAction(
  number: string,
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  await requireSession()
  if (!number.trim()) return { ok: false, error: 'Keine Nummer angegeben.' }

  const result = await burnNumber(number.trim(), reason)
  if (result.ok) {
    refresh()
    return { ok: true }
  }
  return {
    ok: false,
    error:
      result.error === 'no_reason'
        ? 'Bitte einen Grund angeben, warum die Nummer nicht verwendet wurde.'
        : `Die Nummer ${number.trim()} ist bereits vergeben.`,
  }
}

/** Builds the invoice for an accepted Angebot. Nothing is written until the owner
 *  saves it, so an accidental click burns no number. */
export async function convertQuoteAction(quoteId: string): Promise<InvoiceDraft | null> {
  await requireSession()
  return buildInvoiceFromQuote(quoteId)
}

/** Builds the Storno for an issued invoice. Nothing is written until the owner
 *  saves it, so an accidental click leaves no trace and burns no number. */
export async function createStornoAction(originalId: string): Promise<InvoiceDraft | null> {
  await requireSession()
  return buildStornoDraft(originalId)
}

export async function issueInvoiceAction(
  id: string,
  proposedNumber: string
): Promise<
  | { ok: true; invoiceNumber: string; senderSnapshot: MasterDataInvoiceVisible }
  | { ok: false; error: string }
> {
  await requireSession()

  // The number is claimed here, never by a draft: that is what keeps the
  // sequence gapless when a draft is deleted.
  const invoiceForRange = await loadInvoice(id)
  const range: RangePrefix = invoiceForRange?.stornoFor ? 'ST' : 'RE'
  const number = proposedNumber.trim() || (await nextNumberFor(range, currentYear()))

  const masterData = await loadMasterData()

  // The § 14 sender check must happen HERE, against the row the database is
  // about to freeze — not only in the client.
  //
  // The Stammdaten form pushes every keystroke into client state, independent
  // of its save button. So typing a name and address without saving, then
  // issuing, passed the client-side check on values that were never persisted
  // while this action froze the still-empty saved row. The result was exactly
  // the defect the client check was added to prevent: an immutable, § 14-invalid
  // invoice, correctable only by voiding it.
  //
  // validateForPrint is a pure function, so the same rule runs on both sides.
  // Server-side is the authoritative one: it is the only check a caller cannot
  // bypass, since Server Actions are directly reachable POST endpoints.
  const invoice = await loadInvoice(id)
  if (!invoice) return { ok: false, error: 'Rechnung nicht gefunden.' }

  const senderErrors = validateForPrint(invoice, masterData.invoiceVisible, {
    enforceSender: true,
  })
  if (senderErrors.length > 0) {
    return {
      ok: false,
      error: `Festschreiben nicht möglich: ${senderErrors.join(' ')}`,
    }
  }

  // Only the invoice-visible half is frozen into the snapshot.
  const result = await issueInvoice(id, number, masterData.invoiceVisible)

  if (!result.ok) {
    refresh()
    return {
      ok: false,
      error:
        result.error === 'number_taken'
          ? `Die Rechnungsnummer ${number} ist bereits vergeben. Bitte eine andere Nummer wählen.`
          : 'Diese Rechnung ist bereits festgeschrieben.',
    }
  }

  refresh()
  // The snapshot the DATABASE froze, so the client cannot render a sender that
  // differs from the record — an unsaved Stammdaten edit lives only in client
  // state and must not reach the printed document.
  return { ok: true, invoiceNumber: number, senderSnapshot: masterData.invoiceVisible }
}
