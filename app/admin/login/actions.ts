'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { passwordsMatch } from '@/lib/admin/password.ts'
import { createSessionCookie } from '@/lib/admin/session.ts'
import { isLockedOut, recordAttempt, WINDOW_MINUTES } from '@/lib/db/loginAttempts.ts'

export type LoginState = { error: string | null }

async function clientIp(): Promise<string> {
  const forwarded = (await headers()).get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const ip = await clientIp()

  if (await isLockedOut(ip)) {
    return {
      error: `Zu viele Fehlversuche. Bitte in ${WINDOW_MINUTES} Minuten erneut versuchen.`,
    }
  }

  // Fixed cost on every attempt, success or failure.
  await new Promise((resolve) => setTimeout(resolve, 300))

  const password = String(formData.get('password') ?? '')
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) throw new Error('ADMIN_PASSWORD is not set')

  if (!passwordsMatch(password, expected)) {
    await recordAttempt(ip, false)
    // Deliberately generic: no hint about what was wrong.
    return { error: 'Anmeldung fehlgeschlagen.' }
  }

  await recordAttempt(ip, true)
  await createSessionCookie()
  redirect('/admin')
}
