// Empties the invoice tables ONCE, before the first real invoice is issued.
//
//   DATABASE_URL="…" node db/reset-before-first-use.mjs \
//     --backup /path/to/silicortex-backup.json --yes RE-2026-001 ST-2026-001
//
// This exists for exactly one situation: documents were issued while setting the
// software up, nothing was ever sent to a customer, and the operator wants the
// first REAL invoice to be number 001. Because no document left the house and no
// Leistung was performed, there is no tax-relevant transaction to preserve.
//
// It is deliberately NOT a delete tool, and deliberately not reachable from the
// app:
//
//   * An invoice that reached a customer may never be deleted. Its correction is a
//     Stornorechnung, which the app already does.
//   * There is no "delete everything" mode and no way to name a subset. Every
//     issued document in the database must be listed on the command line, and the
//     named set must match it EXACTLY, or the script refuses. So it can only ever
//     do what its name says: reset a database that has not been used yet.
//   * It refuses if any number was burned with a reason, or if any invoice is
//     already cancelled by a Storno that the operator did not also name — both
//     mean the thing was in real use.
//
// Uniqueness under § 14 Abs. 4 Nr. 4 UStG survives this: after the reset there is
// no invoice claiming RE-2026-001 anywhere, so issuing it once afterwards still
// assigns that number exactly once.
import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'

const argv = process.argv.slice(2)
const flag = (name) => {
  const at = argv.indexOf(name)
  return at === -1 ? null : argv[at + 1]
}
const backupPath = flag('--backup')
const confirmed = argv.includes('--yes')
// Everything that is not a flag or a flag's value is a document number.
const flagValues = new Set([backupPath])
const named = argv.filter((a) => !a.startsWith('--') && !flagValues.has(a))

const url = process.env.DATABASE_URL
if (!url || !backupPath || named.length === 0) {
  console.error(
    'Usage: DATABASE_URL="…" node db/reset-before-first-use.mjs \\\n' +
      '         --backup <backup.json> --yes <NUMBER> [<NUMBER> …]\n\n' +
      'Every issued document in the database must be named. The backup must be a\n' +
      'JSON export of exactly those documents — take one at /admin/export?format=json.'
  )
  process.exit(1)
}

const sql = neon(url)
const die = (message) => {
  console.error(`REFUSING: ${message}`)
  process.exit(1)
}

// Named, so a reset of the wrong database is a decision rather than an accident.
const [target] = await sql`
  select current_database() as db,
         (select system_identifier::text from pg_control_system()) as cluster
`
console.log(`database: ${target.cluster}/${target.db}`)

const invoices = await sql`
  select id, status, invoice_number, proposed_number, doc_type, storno_for, customer_name
  from invoices
`
const journal = await sql`select number, reason from issued_numbers`

// A draft holds no number and is deleted in the app, on the row's ✕ button. Doing
// it here too would widen this script's blast radius for no reason.
const drafts = invoices.filter((i) => i.status === 'draft')
if (drafts.length > 0) {
  die(
    `${drafts.length} draft(s) present. Delete drafts in "Meine Rechnungen" first — ` +
      'this script only handles issued documents.'
  )
}

// A burned number with a reason means a document was discarded during real
// operation, which is not a database that has never been used.
const burned = journal.filter((n) => n.reason !== '')
if (burned.length > 0) {
  die(
    `the number journal records discarded numbers (${burned
      .map((n) => n.number)
      .join(', ')}), so this database has been in real use.`
  )
}

const inDatabase = new Set([
  ...invoices.map((i) => i.invoice_number),
  ...journal.map((n) => n.number),
])
const namedSet = new Set(named)
const missing = [...inDatabase].filter((n) => !namedSet.has(n)).sort()
const unknown = [...namedSet].filter((n) => !inDatabase.has(n)).sort()
// Both directions. Only checking that the named numbers exist would let a partial
// list through and empty the whole database anyway; only checking coverage would
// let a typo pass unnoticed.
if (missing.length > 0) {
  die(
    `not every document was named. Missing: ${missing.join(', ')}. ` +
      'This script resets a database that has never been used; it cannot delete a subset.'
  )
}
if (unknown.length > 0) die(`named but not in the database: ${unknown.join(', ')}.`)

const backup = JSON.parse(await readFile(backupPath, 'utf8'))
if (backup?.app !== 'silicortex-invoices') {
  die(`${backupPath} is not a Silicortex invoice backup (missing app marker).`)
}
// Every journal number belongs to a document here: entries without one were
// rejected above, since they carry a reason. So the backup's invoice numbers must
// cover the whole set.
const backedUp = new Set((backup.invoices ?? []).map((i) => i.invoice_number))
const notBackedUp = [...inDatabase].filter((n) => !backedUp.has(n)).sort()
if (notBackedUp.length > 0) {
  die(
    `the backup does not contain ${notBackedUp.join(', ')}. Take a fresh backup of the ` +
      'documents you are about to destroy before running this.'
  )
}

console.log(`backup  : ${backupPath} (${(backup.invoices ?? []).length} document(s))`)
console.log('about to permanently destroy:')
for (const invoice of invoices) {
  console.log(
    `  ${invoice.invoice_number}  ${invoice.doc_type}` +
      `${invoice.storno_for ? ` → ${invoice.storno_for}` : ''}  ${invoice.customer_name}`
  )
}
console.log(`  and ${journal.length} number journal entr(ies)`)

if (!confirmed) {
  console.log('\nNothing was changed. Re-run with --yes to carry this out.')
  process.exit(0)
}

const query = (text, params) => sql.query(text, params ?? [])

// The triggers exist so that no code path can alter an issued document. Turning
// them off is the whole reason this script is a separate, hand-run file and not a
// feature. Disables go INSIDE the try and each re-enable is attempted
// independently, because a database left with them off has silently lost the
// immutability guarantee — the same discipline as db/restore.mjs.
try {
  await query('alter table invoices disable trigger invoices_immutable_when_issued')
  await query('alter table invoice_items disable trigger invoice_items_immutable_when_issued')
  await query('alter table issued_numbers disable trigger issued_numbers_immutable')

  await query('delete from invoice_items')
  await query('delete from invoices')
  await query('delete from issued_numbers')
} finally {
  for (const statement of [
    'alter table invoices enable trigger invoices_immutable_when_issued',
    'alter table invoice_items enable trigger invoice_items_immutable_when_issued',
    'alter table issued_numbers enable trigger issued_numbers_immutable',
  ]) {
    try {
      await query(statement)
    } catch (error) {
      console.error(`WARNING: could not re-enable a trigger — ${statement}: ${error.message}`)
    }
  }
}

const [after] = await sql`
  select (select count(*) from invoices) as invoices,
         (select count(*) from invoice_items) as items,
         (select count(*) from issued_numbers) as numbers
`
console.log(
  `\ndone. invoices: ${after.invoices}, items: ${after.items}, journal: ${after.numbers}`
)
if (Number(after.invoices) > 0 || Number(after.numbers) > 0) {
  console.error('WARNING: the database is not empty — inspect it before issuing anything.')
  process.exit(1)
}
