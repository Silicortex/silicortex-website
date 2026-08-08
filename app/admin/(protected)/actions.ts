'use server'

import { refresh } from 'next/cache'
import { redirect } from 'next/navigation'
import { clearSessionCookie, requireSession } from '@/lib/admin/session.ts'
import { saveMasterData, type MasterData } from '@/lib/db/masterData.ts'
import {
  deleteDraft,
  highestIssuedNumber,
  listInvoices,
  loadInvoice,
  saveDraft,
} from '@/lib/db/invoices.ts'
import { nextInvoiceNumber } from '@/lib/invoice/numbering.ts'
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
export async function nextNumberAction(): Promise<string> {
  await requireSession()
  return nextInvoiceNumber(await highestIssuedNumber(), new Date().getFullYear())
}
