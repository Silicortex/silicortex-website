import { test as setup, expect } from '@playwright/test'
import { sql } from '../../lib/db/client.ts'

// The suite disables both immutability triggers, deletes invoices, and
// overwrites master_data. Running it against the real invoicing database
// would be destructive, so this project runs before everything else and
// aborts the run unless the target database is demonstrably test data.
//
// It executes AFTER playwright.config.ts redirected DATABASE_URL to
// E2E_DATABASE_URL, so normally it checks the isolated database — where both
// assertions hold trivially. Its real job is the abnormal cases: the env var
// missing (suite falls through to the real database) or pointing somewhere
// wrong.
setup('refuse to run against real invoicing data', async () => {
  const issued = await sql`
    select count(*)::int as n from invoices
    where status = 'issued'
      and (invoice_number is null or invoice_number not like 'E2E-%')
  `
  expect(
    issued[0].n,
    'This database holds issued invoices that are not E2E test data. The ' +
      'suite disables the immutability triggers and overwrites master data — ' +
      'set E2E_DATABASE_URL to the isolated e2e database (see README).'
  ).toBe(0)

  // Real master data is the owner's IBAN and tax numbers. The suite's own
  // backup/restore protects it, but only against failures INSIDE a run — not
  // against pointing the whole suite at the wrong database. A filled-in
  // Steuer-IdNr. or Sozialversicherungsnummer means this is not a test
  // database, whatever the invoices table says.
  const [md] = await sql`
    select personal_tax_id, social_security_no from master_data where id = 1
  `
  expect(
    md.personal_tax_id === '' && md.social_security_no === '',
    'master_data holds real personal identifiers — this is not a test ' +
      'database. Set E2E_DATABASE_URL to the isolated e2e database.'
  ).toBe(true)
})

// The master_data column mapping exists in THREE places: db/schema.sql,
// lib/db/masterData.ts, and the raw-SQL mirror in tests/e2e/db.ts (which
// cannot import masterData.ts — its server-only marker throws outside Next).
// If a column is added and the mirror is not updated, backup/restore would
// silently restore the owner's row incompletely, which is worse than not
// restoring at all. This pin fails the whole run instead.
setup('the master_data mirror in db.ts has not drifted from the schema', async () => {
  const [c] = await sql`
    select count(*)::int as n from information_schema.columns
    where table_name = 'master_data'
  `
  expect(
    c.n,
    'master_data changed shape. Update the column mapping in ' +
      'tests/e2e/db.ts (and lib/db/masterData.ts), then update this pin.'
  ).toBe(28) // id + 26 mapped fields + updated_at
})
