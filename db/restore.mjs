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
  // No default. `?? { invoices: 0, numbers: 0 }` read as "assume it is empty" —
  // fail-open in the one check standing between a backup and someone's existing
  // invoices. A count query always returns a row, so if it did not, something is
  // wrong enough that refusing is the only safe answer.
  const counts = rowsOf(existing)[0]
  if (!counts) throw new Error('Could not read the target database; refusing to restore.')
  if (Number(counts.invoices) > 0 || Number(counts.numbers) > 0) {
    throw new Error(
      `Refusing to restore: this database already holds ${counts.invoices} invoice(s) and ` +
        `${counts.numbers} journal entr(ies). Restore into an empty database.`
    )
  }

  // Kept so a failure part-way through can put it back. Without this, a restore
  // that dies mid-flight leaves master data overwritten AND rows half-inserted,
  // and the emptiness guard above then refuses every retry — the operator has a
  // partly populated database and no supported path forward.
  const previousMaster = rowsOf(await query('select * from master_data where id = 1'))[0] ?? null

  const master = backup.masterData ?? {}
  const masterColumns = Object.keys(master).filter((c) => c !== 'id' && c !== 'updated_at')
  const writeMaster = async (values) => {
    if (masterColumns.length === 0) return
    await query(
      `update master_data set ${masterColumns.map((c, i) => `${c} = $${i + 1}`).join(', ')} where id = 1`,
      masterColumns.map((c) => values[c] ?? '')
    )
  }
  await writeMaster(master)

  // The triggers exist to stop the APPLICATION editing issued documents. A restore
  // is writing them for the first time into an empty database, which the triggers
  // cannot distinguish from tampering — so they come off, and go back on in a
  // finally, because a database left with them disabled has silently lost the
  // immutability guarantee.
  //
  // The disables are INSIDE the try. Outside it, a failure on the second or third
  // one — restoring into a database migrated before `issued_numbers` existed, say —
  // left the earlier triggers off with nothing to restore them, which is the exact
  // outcome the paragraph above says must not happen.
  try {
    await query('alter table invoices disable trigger invoices_immutable_when_issued')
    await query('alter table invoice_items disable trigger invoice_items_immutable_when_issued')
    await query('alter table issued_numbers disable trigger issued_numbers_immutable')

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
  } catch (error) {
    // No transaction is available: the Neon HTTP driver runs each statement in its
    // own, so BEGIN/COMMIT here would be a comforting no-op. This unwinds by hand
    // instead, back to the empty database the guard above expects, so the operator
    // can fix the cause and simply run the restore again.
    //
    // Best-effort, and deliberately swallowing its own errors: the original failure
    // is the one worth reporting, and a cleanup that also fails must not replace it.
    try {
      await query('delete from invoice_items')
      await query('delete from invoices')
      await query('delete from issued_numbers')
      if (previousMaster) await writeMaster(previousMaster)
    } catch {
      throw new Error(
        `Restore failed AND could not be rolled back: ${error.message}. The database ` +
          'is partly populated — empty invoices, invoice_items and issued_numbers ' +
          'before retrying.'
      )
    }
    throw error
  } finally {
    // `enable trigger` on an already-enabled trigger is a harmless no-op, so this
    // is safe even when the disables never ran.
    //
    // Each one is attempted independently. A single `await` sequence would skip the
    // rest on the first failure — and if a trigger is missing (the case that made
    // the disables fail in the first place), re-enabling it throws, which would
    // both leave the others disabled and replace the real error with a confusing
    // one. A failure here is reported, not thrown, so the original survives.
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
