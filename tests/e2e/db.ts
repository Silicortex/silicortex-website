import { join } from 'node:path'
import { sql } from '../../lib/db/client.ts'
import type { MasterData } from '../../lib/db/masterData.ts'

/** The identity of the database we are connected to, for the backup file to
 *  record. Cluster plus database name is enough to tell the e2e database from
 *  the real one without ever writing a credential to disk.
 *
 *  NOT the server address. `inet_server_addr()` reports the address THIS
 *  connection happened to reach the server on, and `localhost` resolves to
 *  either 127.0.0.1 or ::1 from one run to the next. The same database
 *  therefore produced two different identities, and the restore was refused as
 *  a cross-database replay — leaving master data overwritten, which is the exact
 *  outcome the check exists to prevent.
 *
 *  `system_identifier` is fixed when the cluster is initialised, so it is stable
 *  across connections. It does NOT distinguish the two databases on its own —
 *  the e2e database is a separate database in the SAME cluster as the real one,
 *  so both report the same value and the database name is what separates them. */
export async function databaseIdentity(): Promise<string> {
  let rows
  try {
    rows = await sql`
      select current_database() as db,
             (select system_identifier::text from pg_control_system()) as cluster
    `
  } catch (error) {
    // Fail closed. A guessed identity would either refuse every restore or
    // wave a genuine cross-database replay through.
    throw new Error(
      'Cannot determine the database identity, so the master-data backup ' +
        'cannot be guarded against a cross-database restore. ' +
        `Underlying error: ${(error as Error).message}`
    )
  }
  return `${rows[0].cluster}/${rows[0].db}`
}

/** Refuses to proceed unless this database is free of real invoices.
 *
 *  Shared by the guard project and by the destructive helpers themselves, so a
 *  direct `--project=cleanup` (or any future caller) cannot bypass the check by
 *  skipping the guard. Deliberately does NOT look at master_data: the suite's
 *  own tests legitimately fill it, so the teardown runs with test values in
 *  place. The guard project checks master_data separately, before any test has
 *  written to it. */
export async function assertNoRealInvoices(): Promise<void> {
  const rows = await sql`
    select count(*)::int as n from invoices
    where status = 'issued'
      and (invoice_number is null or invoice_number not like 'E2E-%')
  `
  if (rows[0].n > 0) {
    throw new Error(
      `Refusing to touch this database: it holds ${rows[0].n} issued invoice(s) ` +
        'that are not E2E test data. Point E2E_DATABASE_URL at the isolated ' +
        'e2e database (see README).'
    )
  }

  // The journal outlives the invoices by design, so a database whose invoices
  // were cleared can still be the real one. Checking only `invoices` would look
  // clean and then let the suite delete the owner's permanent number record —
  // the one thing here that cannot be reconstructed.
  const journal = await sql`
    select count(*)::int as n from issued_numbers where number not like 'E2E-%'
  `
  if (journal[0].n > 0) {
    throw new Error(
      `Refusing to touch this database: its number journal holds ${journal[0].n} ` +
        'entr(ies) that are not E2E test data. Point E2E_DATABASE_URL at the ' +
        'isolated e2e database (see README).'
    )
  }
}

/** Attempt records are a rate-limit ledger with 24h retention; clearing them in
 *  a test environment is harmless, and leaving them lets the suite lock itself
 *  out after eight runs in fifteen minutes. */
export async function clearLoginAttempts(): Promise<void> {
  await sql`delete from login_attempts`
}

export async function countInvoices(): Promise<number> {
  const rows = await sql`select count(*)::int as n from invoices`
  return rows[0].n as number
}

/** Removes only rows this suite created. Every issued E2E invoice carries the
 *  `E2E-` prefix, so this can never touch a real invoice.
 *
 *  The disable statements sit INSIDE the try. Outside it, a failure on the
 *  second disable would leave the first trigger off with nothing to restore
 *  it — and a disabled trigger silently removes the immutability guarantee
 *  from the owner's real invoices. `enable trigger` on an already-enabled
 *  trigger is a harmless no-op, so an unconditional finally is safe. */
export async function cleanupE2eRows(): Promise<void> {
  // Defence in depth: Playwright runs a teardown project even when the guard
  // that should have stopped the run failed, so this cannot rely on the guard
  // having passed.
  await assertNoRealInvoices()

  await sql`delete from invoices where status = 'draft' and customer_name like 'Testkunde%'`

  try {
    await sql`alter table invoices disable trigger invoices_immutable_when_issued`
    await sql`alter table invoice_items disable trigger invoice_items_immutable_when_issued`
    // The journal is append-only for the application; only the suite's own
    // rows are removed, and only with the trigger off.
    await sql`alter table issued_numbers disable trigger issued_numbers_immutable`
    await sql`delete from invoices where status = 'issued' and invoice_number like 'E2E-%'`
    await sql`delete from issued_numbers where number like 'E2E-%'`
  } finally {
    await sql`alter table invoices enable trigger invoices_immutable_when_issued`
    await sql`alter table invoice_items enable trigger invoice_items_immutable_when_issued`
    await sql`alter table issued_numbers enable trigger issued_numbers_immutable`
  }
}

// Playwright transpiles this file as CommonJS (no "type": "module" in
// package.json), where `import.meta.url` is unavailable — __dirname is the
// equivalent that actually works under that transform.
const BACKUP = join(__dirname, '.auth', 'master-data-backup.json')

// lib/db/masterData.ts starts with `import 'server-only'`, which throws when
// the module is loaded outside Next's server bundle — including right here,
// under the Playwright/Node runner. `import type` below is erased at build
// time and never triggers that guard, but a value import of loadMasterData /
// saveMasterData would execute the whole module and throw. So this file talks
// to master_data directly; the column mapping mirrors loadMasterData /
// saveMasterData exactly and will drift if a column is added there without a
// matching update here.
async function readMasterDataRow(): Promise<MasterData> {
  const rows = await sql`select * from master_data where id = 1`
  const r = rows[0]
  if (!r) throw new Error('master_data row 1 is missing — run npm run db:migrate')

  return {
    invoiceVisible: {
      name: r.name,
      statusLabel: r.status_label,
      activity: r.activity,
      street: r.street,
      zipCity: r.zip_city,
      country: r.country,
      phone: r.phone,
      email: r.email,
      website: r.website,
      taxNumber: r.tax_number,
      vatId: r.vat_id,
      taxOffice: r.tax_office,
      // numeric columns arrive as strings from the driver
      defaultVatRate: Number(r.default_vat_rate),
      paymentTermsDays: Number(r.payment_terms_days),
      accountHolder: r.account_holder,
      iban: r.iban,
      bankName: r.bank_name,
      bic: r.bic,
    },
    internal: {
      businessId: r.business_id,
      personalTaxId: r.personal_tax_id,
      socialSecurityNo: r.social_security_no,
      birthDate: r.birth_date,
      activityStart: r.activity_start,
      vatScheme: r.vat_scheme,
      taxationType: r.taxation_type,
      profitDetermination: r.profit_determination,
    },
  }
}

async function writeMasterDataRow(data: MasterData): Promise<void> {
  const v = data.invoiceVisible
  const i = data.internal
  await sql`
    update master_data set
      name = ${v.name},
      status_label = ${v.statusLabel},
      activity = ${v.activity},
      street = ${v.street},
      zip_city = ${v.zipCity},
      country = ${v.country},
      phone = ${v.phone},
      email = ${v.email},
      website = ${v.website},
      tax_number = ${v.taxNumber},
      vat_id = ${v.vatId},
      tax_office = ${v.taxOffice},
      default_vat_rate = ${v.defaultVatRate},
      payment_terms_days = ${v.paymentTermsDays},
      account_holder = ${v.accountHolder},
      iban = ${v.iban},
      bank_name = ${v.bankName},
      bic = ${v.bic},
      business_id = ${i.businessId},
      personal_tax_id = ${i.personalTaxId},
      social_security_no = ${i.socialSecurityNo},
      birth_date = ${i.birthDate},
      activity_start = ${i.activityStart},
      vat_scheme = ${i.vatScheme},
      taxation_type = ${i.taxationType},
      profit_determination = ${i.profitDetermination},
      updated_at = now()
    where id = 1
  `
}

/** Snapshot the owner's real master data before the suite touches it.
 *
 *  A surviving backup file means a previous run failed to restore. Overwriting
 *  it would replace the owner's real values with the polluted test state and
 *  lose them permanently across two runs — so restore from it first, which
 *  removes it, and only then take a fresh snapshot. */
export async function backupMasterData(): Promise<void> {
  const { writeFile } = await import('node:fs/promises')
  const { existsSync } = await import('node:fs')
  if (existsSync(BACKUP)) await restoreMasterData()
  // The target database varies run to run (playwright.config.ts redirects
  // DATABASE_URL), so the snapshot records where it came from. Without that, a
  // backup taken from the e2e database could be replayed over the real one.
  const payload = { database: await databaseIdentity(), data: await readMasterDataRow() }
  await writeFile(BACKUP, JSON.stringify(payload), 'utf8')
}

/** Replay it unconditionally, even if a test threw mid-edit. Only a missing
 *  backup file is benign (the suite never got far enough to edit anything) —
 *  any other failure must surface, or the owner's real data stays overwritten
 *  while this looks like it succeeded. */
export async function restoreMasterData(): Promise<void> {
  const { readFile, unlink } = await import('node:fs/promises')
  let payload: { database?: string; data: MasterData }
  try {
    payload = JSON.parse(await readFile(BACKUP, 'utf8')) as typeof payload
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
    throw error
  }

  // Replaying a snapshot into a different database would silently overwrite one
  // database's master data with another's — the owner's IBAN and tax numbers
  // replaced by test values, with nothing left to detect it.
  const current = await databaseIdentity()
  if (payload.database && payload.database !== current) {
    throw new Error(
      `Refusing to restore master data: the backup was taken from ` +
        `${payload.database} but this connection is ${current}. Delete ` +
        `tests/e2e/.auth/master-data-backup.json only if you are certain it is stale.`
    )
  }

  await writeMasterDataRow(payload.data)
  await unlink(BACKUP)
}
