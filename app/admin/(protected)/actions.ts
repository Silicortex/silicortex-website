'use server'

import { refresh } from 'next/cache'
import { redirect } from 'next/navigation'
import { clearSessionCookie, requireSession } from '@/lib/admin/session.ts'
import { saveMasterData, type MasterData } from '@/lib/db/masterData.ts'

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
