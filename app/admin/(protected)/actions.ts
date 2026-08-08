'use server'

import { redirect } from 'next/navigation'
import { clearSessionCookie, requireSession } from '@/lib/admin/session.ts'

export async function logoutAction(): Promise<void> {
  await requireSession()
  await clearSessionCookie()
  redirect('/admin/login')
}
