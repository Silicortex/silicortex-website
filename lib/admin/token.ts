import { SignJWT, jwtVerify } from 'jose'

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export type SessionPayload = { sub: 'owner'; exp: number }

// Read per call so a rotated secret takes effect without a redeploy, and so tests
// can set the env var before importing this module.
function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function signSessionToken(): Promise<string> {
  return new SignJWT({ sub: 'owner' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey())
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ['HS256'], // pinned: rejects alg:none and algorithm confusion
    })
    if (payload.sub !== 'owner' || typeof payload.exp !== 'number') return null
    return { sub: 'owner', exp: payload.exp }
  } catch {
    return null
  }
}
