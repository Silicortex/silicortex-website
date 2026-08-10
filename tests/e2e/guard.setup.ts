import { test as setup, expect } from '@playwright/test'
import { sql } from '../../lib/db/client.ts'
import { assertNoRealInvoices } from './db.ts'

// The suite disables both immutability triggers, deletes invoices, and
// overwrites master_data. Running it against the real invoicing database would
// be destructive, so this project runs before everything else and aborts the
// run unless the target database is demonstrably test data.
//
// It executes AFTER playwright.config.ts redirected DATABASE_URL to
// E2E_DATABASE_URL, so normally it checks the isolated database — where every
// assertion holds trivially. Its job is the abnormal case: the variable
// pointing somewhere it should not.
setup('refuse to run against real invoicing data', async () => {
  // Shared with the destructive helpers themselves, so the check cannot be
  // bypassed by invoking a teardown project directly.
  await assertNoRealInvoices()

  // Every master-data field the suite overwrites, not just the two optional
  // personal identifiers. Checking only those left the realistic early case
  // unguarded: a real name, IBAN and Steuernummer entered, no invoice issued
  // yet, and no personal identifiers — which passed, and the suite then
  // overwrote the row.
  //
  // Valid only here, before any test has written to master_data. The teardown
  // legitimately runs with test values in place, which is why it uses the
  // narrower invoice check plus the backup's own database identity.
  const rows = await sql`
    select name, street, zip_city, tax_number, vat_id, iban, account_holder,
           personal_tax_id, social_security_no, birth_date
    from master_data where id = 1
  `
  const row = rows[0]
  expect(
    row,
    'master_data row 1 is missing — run npm run db:migrate against this database'
  ).toBeTruthy()

  const filled = Object.entries(row)
    .filter(([, value]) => String(value ?? '').trim() !== '')
    .map(([column]) => column)
  expect(
    filled,
    `master_data holds real values (${filled.join(', ')}) — this is not a test ` +
      'database. Point E2E_DATABASE_URL at the isolated e2e database.'
  ).toEqual([])
})

// The master_data column mapping exists in THREE places: db/schema.sql,
// lib/db/masterData.ts, and the raw-SQL mirror in tests/e2e/db.ts (which cannot
// import masterData.ts — its server-only marker throws outside Next). If a
// column is added, renamed or dropped and the mirror is not updated, the
// backup/restore would silently restore the owner's row incompletely, which is
// worse than not restoring at all. This pin fails the whole run instead.
// A network address is not an identity: `localhost` resolves to 127.0.0.1 or
// ::1 depending on the run, so an address-derived identity made the same
// database look like two, and the restore was refused as a cross-database
// replay — leaving master data overwritten.
setup('the database identity is stable, not derived from a network address', async () => {
  const { databaseIdentity } = await import('./db.ts')
  const identity = await databaseIdentity()
  expect(identity, 'identity looks like an IP address').not.toMatch(/\d+\.\d+\.\d+\.\d+|::/)
  expect(await databaseIdentity(), 'identity is not stable').toBe(identity)
})

setup('the master_data mirror in db.ts has not drifted from the schema', async () => {
  const rows = await sql`
    select column_name from information_schema.columns
    where table_schema = 'public' and table_name = 'master_data'
    order by column_name
  `
  // A bare count could not catch a RENAME, and without the schema filter a
  // second master_data in any other schema double-counted and aborted every run
  // with a misleading drift message.
  const actual = rows.map((r) => r.column_name as string)
  const mirrored = [
    'account_holder', 'activity', 'activity_start', 'bank_name', 'bic',
    'birth_date', 'business_id', 'country', 'default_vat_rate', 'email', 'iban',
    'id', 'name', 'payment_terms_days', 'personal_tax_id', 'phone',
    'profit_determination', 'social_security_no', 'status_label', 'street',
    'tax_number', 'tax_office', 'taxation_type', 'updated_at', 'vat_id',
    'vat_scheme', 'website', 'zip_city',
  ]
  expect(
    actual,
    'master_data changed shape. Update the column mapping in tests/e2e/db.ts ' +
      '(and lib/db/masterData.ts), then update this list.'
  ).toEqual(mirrored)
})
