import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from './token.ts'

export const SESSION_COOKIE = 'sc_admin_session'

// Memoized for the render pass: many components may ask, one verification.
export const verifySession = cache(async (): Promise<SessionPayload | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  return token ? verifySessionToken(token) : null
})

// THE security boundary. Called by the protected layout AND as the first
// statement of every Server Action — actions are directly reachable POST
// endpoints, so a layout gate alone protects nothing.
export async function requireSession(): Promise<SessionPayload> {
  const session = await verifySession()
  if (!session) redirect('/admin/login')
  return session
}

export async function createSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, await signSessionToken(), {
    httpOnly: true,
    // Unconditional `secure` silently breaks http://localhost.
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export async function clearSessionCookie(): Promise<void> {
  ;(await cookies()).delete(SESSION_COOKIE)
}
