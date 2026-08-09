import { test as teardown, expect } from '@playwright/test'
import { cleanupE2eRows, clearLoginAttempts, restoreMasterData } from './db.ts'
import { sql } from '../../lib/db/client.ts'

teardown('remove rows this suite created', async () => {
  await cleanupE2eRows()
  await clearLoginAttempts()
  await restoreMasterData()

  // Leaving a trigger disabled would silently remove the immutability
  // guarantee for real invoices, so assert both are present AND enabled —
  // an empty result (both dropped) must fail this just as loudly as one
  // left disabled would.
  const triggers = await sql`
    select tgname, tgenabled from pg_trigger
    where tgname in ('invoices_immutable_when_issued', 'invoice_items_immutable_when_issued')
    order by 1
  `
  expect(triggers).toHaveLength(2)
  for (const row of triggers) expect(row.tgenabled).toBe('O')
})
