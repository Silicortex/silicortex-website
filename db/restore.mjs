// Restores a backup produced by /admin/export?format=json into an EMPTY database.
//
//   DATABASE_URL="…" node db/restore.mjs silicortex-backup_2026-08-11.json
//
// A backup nobody has restored is a guess, not a backup. The restore logic is
// exported so the schema test can round-trip it against a real Postgres.
import { readFile } from 'node:fs/promises'

/** Restores into an empty database.
 *
 *  `query(sql, params)` is whatever the caller has — the Neon driver's
 *  `sql.query` in the CLI below, PGlite's in the test. The two disagree about the
 *  result shape: PGlite returns `{ rows }`, the Neon HTTP driver returns the array
 *  directly. `rowsOf` normalises that, because getting it wrong made the restore
 *  read an undefined row count and abort before writing anything.
 *
 *  Refuses a non-empty database. Merging a backup into existing rows would
 *  reintroduce numbers the journal has already burned and leave two invoices
 *  claiming one number, which no later repair can untangle. */
const rowsOf = (result) => (Array.isArray(result) ? result : (result?.rows ?? []))

export async function restoreInto(query, backup) {
  if (backup?.app !== 'silicortex-invoices') {
    throw new Error('Not a Silicortex invoice backup (missing app marker).')
  }
  if (typeof backup.version !== 'number' || backup.version > 1) {
    throw new Error(
      `Backup version ${backup.version} is newer than this restore script understands.`
    )
  }

  const existing = await query(
    'select (select count(*) from invoices) as invoices,' +
      ' (select count(*) from issued_numbers) as numbers'
  )
  const counts = rowsOf(existing)[0] ?? { invoices: 0, numbers: 0 }
  if (Number(counts.invoices) > 0 || Number(counts.numbers) > 0) {
    throw new Error(
      `Refusing to restore: this database already holds ${counts.invoices} invoice(s) and ` +
        `${counts.numbers} journal entr(ies). Restore into an empty database.`
    )
  }

  const master = backup.masterData ?? {}
  const masterColumns = Object.keys(master).filter((c) => c !== 'id' && c !== 'updated_at')
  if (masterColumns.length > 0) {
    await query(
      `update master_data set ${masterColumns.map((c, i) => `${c} = $${i + 1}`).join(', ')} where id = 1`,
      masterColumns.map((c) => master[c])
    )
  }

  // The triggers exist to stop the APPLICATION editing issued documents. A restore
  // is writing them for the first time into an empty database, which the triggers
  // cannot distinguish from tampering — so they come off, and go back on in a
  // finally, because a database left with them disabled has silently lost the
  // immutability guarantee.
  await query('alter table invoices disable trigger invoices_immutable_when_issued')
  await query('alter table invoice_items disable trigger invoice_items_immutable_when_issued')
  await query('alter table issued_numbers disable trigger issued_numbers_immutable')
  try {
    for (const invoice of backup.invoices ?? []) {
      const { items = [], ...row } = invoice
      const columns = Object.keys(row)
      await query(
        `insert into invoices (${columns.join(', ')})
         values (${columns.map((_, i) => `$${i + 1}`).join(', ')})`,
        columns.map((c) => (c === 'vat_breakdown' || c === 'sender_snapshot'
          ? row[c] === null ? null : JSON.stringify(row[c])
          : row[c]))
      )
      for (const item of items) {
        const itemColumns = Object.keys(item)
        await query(
          `insert into invoice_items (${itemColumns.join(', ')})
           values (${itemColumns.map((_, i) => `$${i + 1}`).join(', ')})`,
          itemColumns.map((c) => item[c])
        )
      }
    }

    for (const entry of backup.issuedNumbers ?? []) {
      const columns = Object.keys(entry)
      await query(
        `insert into issued_numbers (${columns.join(', ')})
         values (${columns.map((_, i) => `$${i + 1}`).join(', ')})`,
        columns.map((c) => entry[c])
      )
    }
  } finally {
    await query('alter table invoices enable trigger invoices_immutable_when_issued')
    await query('alter table invoice_items enable trigger invoice_items_immutable_when_issued')
    await query('alter table issued_numbers enable trigger issued_numbers_immutable')
  }

  return {
    invoices: (backup.invoices ?? []).length,
    items: (backup.invoices ?? []).reduce((n, i) => n + (i.items?.length ?? 0), 0),
    numbers: (backup.issuedNumbers ?? []).length,
  }
}

// CLI. Skipped when this module is imported, so the test can use restoreInto
// without connecting to anything.
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const file = process.argv[2]
  const url = process.env.DATABASE_URL
  if (!file || !url) {
    console.error('Usage: DATABASE_URL="…" node db/restore.mjs <backup.json>')
    process.exit(1)
  }

  const { neon } = await import('@neondatabase/serverless')
  const sql = neon(url)
  const backup = JSON.parse(await readFile(file, 'utf8'))

  // Named so a restore into the wrong database is a decision, not an accident.
  const target = await sql`
    select current_database() as db,
           (select system_identifier::text from pg_control_system()) as cluster
  `
  const identity = `${target[0].cluster}/${target[0].db}`
  console.log(`backup taken from : ${backup.database}`)
  console.log(`restoring into    : ${identity}`)
  if (backup.database && backup.database !== identity) {
    console.log('NOTE: this is a different database than the backup came from.')
  }

  const result = await restoreInto((text, params) => sql.query(text, params ?? []), backup)
  console.log(
    `restored ${result.invoices} invoice(s), ${result.items} item(s), ${result.numbers} journal entr(ies)`
  )
}
