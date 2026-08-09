import { test as teardown, expect } from '@playwright/test'
import { cleanupE2eRows, clearLoginAttempts, restoreMasterData } from './db.ts'
import { sql } from '../../lib/db/client.ts'

teardown('remove rows this suite created', async () => {
  // The restore MUST run even if cleanup throws. Without this finally, a
  // failure above skips it, and the next run's backup overwrites the surviving
  // file with the polluted state — losing the owner's real IBAN and tax numbers
  // permanently, across two runs, with nothing to notice.
  try {
    await cleanupE2eRows()
    await clearLoginAttempts()
  } finally {
    await restoreMasterData()
  }

  // Leaving a trigger disabled would silently remove the immutability guarantee
  // for real invoices. Assert both by NAME and that they are enabled — a loop
  // over the result set would pass vacuously if the query returned nothing,
  // which is the same tautology this task exists to remove.
  const triggers = await sql`
    select tgname, tgenabled from pg_trigger where not tgisinternal order by 1
  `
  const state = new Map(triggers.map((r) => [r.tgname as string, r.tgenabled as string]))
  expect(state.get('invoices_immutable_when_issued')).toBe('O')
  expect(state.get('invoice_items_immutable_when_issued')).toBe('O')
})
