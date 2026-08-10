import { test as teardown, expect } from '@playwright/test'
import { sql } from '../../lib/db/client.ts'
import { assertNoRealInvoices, cleanupE2eRows, clearLoginAttempts, restoreMasterData } from './db.ts'

teardown('remove rows this suite created', async () => {
  // FIRST, and deliberately outside the try below.
  //
  // Playwright runs a teardown project even when the guard project failed, and
  // it refuses `dependencies` on a teardown project, so this is the only place
  // the check can live. Verified: before this existed, a failing guard still let
  // the teardown disable the real immutability triggers and wipe the real
  // rate-limit ledger.
  //
  // Throwing here also skips restoreMasterData in the finally — correct, since
  // replaying a snapshot into the wrong database is the worst outcome available.
  await assertNoRealInvoices()

  // The restore MUST run even if cleanup throws. Without this finally, a failure
  // above skips it, and the next run's backup overwrites the surviving file with
  // the polluted state — losing the owner's real IBAN and tax numbers
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
  // which is the same tautology this suite exists to remove.
  const triggers = await sql`
    select tgname, tgenabled from pg_trigger where not tgisinternal order by 1
  `
  const state = new Map(triggers.map((r) => [r.tgname as string, r.tgenabled as string]))
  expect(state.get('invoices_immutable_when_issued')).toBe('O')
  expect(state.get('invoice_items_immutable_when_issued')).toBe('O')
})
