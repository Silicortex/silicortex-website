import 'server-only'
import { sql } from './client.ts'

export const MAX_FAILURES = 8
export const WINDOW_MINUTES = 15

// Database-backed on purpose: an in-memory counter does not survive or
// coordinate across serverless instances.
export async function isLockedOut(ip: string): Promise<boolean> {
  const rows = await sql`
    select count(*)::int as failures
    from login_attempts
    where ip = ${ip}
      and success = false
      and attempted_at > now() - make_interval(mins => ${WINDOW_MINUTES})
  `
  return (rows[0]?.failures ?? 0) >= MAX_FAILURES
}

export async function recordAttempt(ip: string, success: boolean): Promise<void> {
  await sql`insert into login_attempts (ip, success) values (${ip}, ${success})`
  // IP addresses are personal data: keep them only as long as the lockout
  // window needs them, with a day of slack for inspection.
  await sql`delete from login_attempts where attempted_at < now() - interval '24 hours'`
}
