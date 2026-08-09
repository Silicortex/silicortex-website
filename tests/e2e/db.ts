import { join } from 'node:path'
import { sql } from '../../lib/db/client.ts'
import type { MasterData } from '../../lib/db/masterData.ts'

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
 *  `E2E-` prefix, so this can never touch a real invoice. Issued rows need both
 *  immutability triggers stood down, which is re-enabled in a finally. */
export async function cleanupE2eRows(): Promise<void> {
  await sql`delete from invoices where status = 'draft' and customer_name like 'Testkunde%'`
  await sql`alter table invoices disable trigger invoices_immutable_when_issued`
  await sql`alter table invoice_items disable trigger invoice_items_immutable_when_issued`
  try {
    await sql`delete from invoices where status = 'issued' and invoice_number like 'E2E-%'`
  } finally {
    await sql`alter table invoices enable trigger invoices_immutable_when_issued`
    await sql`alter table invoice_items enable trigger invoice_items_immutable_when_issued`
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

/** Snapshot the owner's real master data before the suite touches it. */
export async function backupMasterData(): Promise<void> {
  const { writeFile } = await import('node:fs/promises')
  await writeFile(BACKUP, JSON.stringify(await readMasterDataRow()), 'utf8')
}

/** Replay it unconditionally, even if a test threw mid-edit. Only a missing
 *  backup file is benign (the suite never got far enough to edit anything) —
 *  any other failure must surface, or the owner's real data stays overwritten
 *  while this looks like it succeeded. */
export async function restoreMasterData(): Promise<void> {
  const { readFile, unlink } = await import('node:fs/promises')
  let saved: MasterData
  try {
    saved = JSON.parse(await readFile(BACKUP, 'utf8')) as MasterData
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
    throw error
  }
  await writeMasterDataRow(saved)
  await unlink(BACKUP)
}
