// Applies db/schema.sql to an in-process Postgres (PGlite, PostgreSQL 18 in
// WASM) and asserts the guarantees the invoicing design rests on:
//   - an issued invoice cannot be updated or deleted, at the DATABASE level
//   - a draft holds no invoice number, so deleting one leaves no gap
//   - invoice numbers are unique once issued
//   - the whole schema is idempotent
// No provisioning, credentials or network needed.
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PGlite } from '@electric-sql/pglite'
import { restoreInto } from './restore.mjs'

const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8')
const statements = schema
  .split(/^-- @@$/m)
  .map((s) => s.trim())
  .filter(Boolean)

async function freshDb() {
  const db = await PGlite.create()
  for (const statement of statements) await db.exec(statement)
  return db
}

test('the schema applies, and applies again unchanged', async () => {
  const db = await freshDb()
  for (const statement of statements) await db.exec(statement)
  const tables = await db.query(
    `select table_name from information_schema.tables
     where table_schema = 'public' order by 1`
  )
  assert.deepEqual(
    tables.rows.map((r) => r.table_name),
    ['invoice_items', 'invoices', 'issued_numbers', 'login_attempts', 'master_data']
  )
  const seeded = await db.query('select count(*)::int as n from master_data')
  assert.equal(seeded.rows[0].n, 1)
})

test('drafts hold no invoice number, so two may share a proposed number', async () => {
  const db = await freshDb()
  await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-001', '2026-08-08', 'A')`
  )
  await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-001', '2026-08-08', 'B')`
  )
  const drafts = await db.query(
    `select count(*)::int as n from invoices where invoice_number is null`
  )
  assert.equal(drafts.rows[0].n, 2)
})

test('an issued invoice cannot be updated or deleted', async () => {
  const db = await freshDb()
  const inserted = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-001', '2026-08-08', 'Kundin') returning id`
  )
  const id = inserted.rows[0].id

  // The one transition the trigger must permit: OLD.status is still 'draft'.
  await db.query(
    `update invoices set status = 'issued', invoice_number = '2026-001',
     issued_at = now(), sender_snapshot = '{"name":"X"}'::jsonb
     where id = $1 and status = 'draft'`,
    [id]
  )

  await assert.rejects(
    () => db.query(`update invoices set customer_name = 'TAMPERED' where id = $1`, [id]),
    /issued and immutable/
  )
  await assert.rejects(
    () => db.query(`delete from invoices where id = $1`, [id]),
    /issued and immutable/
  )

  const row = await db.query(`select customer_name from invoices where id = $1`, [id])
  assert.equal(row.rows[0].customer_name, 'Kundin')
})

test('an issued invoice number cannot be reused', async () => {
  const db = await freshDb()
  const a = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-001', '2026-08-08', 'A') returning id`
  )
  const b = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-001', '2026-08-08', 'B') returning id`
  )
  await db.query(
    `update invoices set status = 'issued', invoice_number = '2026-001',
     issued_at = now(), sender_snapshot = '{"name":"X"}'::jsonb
     where id = $1 and status = 'draft'`,
    [a.rows[0].id]
  )
  await assert.rejects(
    () =>
      db.query(
        `update invoices set status = 'issued', invoice_number = '2026-001',
         issued_at = now(), sender_snapshot = '{"name":"X"}'::jsonb
         where id = $1 and status = 'draft'`,
        [b.rows[0].id]
      ),
    /duplicate key|unique/i
  )
})

test('deleting a draft cascades to its line items', async () => {
  const db = await freshDb()
  const draft = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-002', '2026-08-08', 'A') returning id`
  )
  const id = draft.rows[0].id
  await db.query(
    `insert into invoice_items (invoice_id, line_no, description, unit_price, net_amount)
     values ($1, 1, 'Entwicklung', 80.50, 80.50)`,
    [id]
  )
  await db.query(`delete from invoices where id = $1 and status = 'draft'`, [id])
  const items = await db.query(
    `select count(*)::int as n from invoice_items where invoice_id = $1`,
    [id]
  )
  assert.equal(items.rows[0].n, 0)
})

// Documents the driver behaviour the repository modules must handle: money
// arrives as a STRING, so arithmetic on a raw column value would concatenate.
test('numeric columns are returned as strings, not numbers', async () => {
  const db = await freshDb()
  const invoice = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-003', '2026-08-08', 'A') returning id`
  )
  await db.query(
    `insert into invoice_items (invoice_id, line_no, description, quantity, unit_price, net_amount)
     values ($1, 1, 'Entwicklung', 2, 80.50, 161.00)`,
    [invoice.rows[0].id]
  )
  const items = await db.query(`select quantity, unit_price from invoice_items`)
  assert.equal(typeof items.rows[0].quantity, 'string')
  assert.equal(typeof items.rows[0].unit_price, 'string')
})

test('an issued invoice\'s line items cannot be changed, deleted or added to', async () => {
  const db = await freshDb()
  const invoice = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-010', '2026-08-08', 'Kundin') returning id`
  )
  const id = invoice.rows[0].id
  await db.query(
    `insert into invoice_items (invoice_id, line_no, description, quantity, unit_price, vat_rate, net_amount)
     values ($1, 1, 'Entwicklung', 2, 80.50, 19, 161.00)`,
    [id]
  )
  // Editable while the invoice is still a draft.
  await db.query(`update invoice_items set unit_price = 90.00 where invoice_id = $1`, [id])

  await db.query(
    `update invoices set status = 'issued', invoice_number = '2026-010',
     issued_at = now(), sender_snapshot = '{"name":"X"}'::jsonb
     where id = $1 and status = 'draft'`,
    [id]
  )

  await assert.rejects(
    () => db.query(`update invoice_items set unit_price = 1 where invoice_id = $1`, [id]),
    /line items are immutable/
  )
  await assert.rejects(
    () => db.query(`delete from invoice_items where invoice_id = $1`, [id]),
    /line items are immutable/
  )
  await assert.rejects(
    () =>
      db.query(
        `insert into invoice_items (invoice_id, line_no, description, unit_price, net_amount)
         values ($1, 2, 'Zusatz', 999, 999)`,
        [id]
      ),
    /line items are immutable/
  )

  const items = await db.query(
    `select unit_price from invoice_items where invoice_id = $1`,
    [id]
  )
  assert.equal(items.rows.length, 1)
  assert.equal(items.rows[0].unit_price, '90.00')
})

test('an invoice cannot be issued without a number, timestamp and snapshot', async () => {
  const db = await freshDb()
  const invoice = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-011', '2026-08-08', 'A') returning id`
  )
  await assert.rejects(
    () => db.query(`update invoices set status = 'issued' where id = $1`, [invoice.rows[0].id]),
    /invoices_issued_complete|check constraint/i
  )
})

test('the line-item guard does not block a draft cascade delete', async () => {
  const db = await freshDb()
  const draft = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-012', '2026-08-08', 'A') returning id`
  )
  const id = draft.rows[0].id
  await db.query(
    `insert into invoice_items (invoice_id, line_no, description, unit_price, net_amount)
     values ($1, 1, 'Entwicklung', 5, 5)`,
    [id]
  )
  await db.query(`delete from invoices where id = $1 and status = 'draft'`, [id])
  const items = await db.query(
    `select count(*)::int as n from invoice_items where invoice_id = $1`,
    [id]
  )
  assert.equal(items.rows[0].n, 0)
})

// § 14 Abs. 4 Nr. 4 UStG requires a number assigned EINMALIG — once, ever. The
// invoices table alone cannot promise that, because a row can go away.
test('a number stays used after its invoice is gone', async () => {
  const db = await freshDb()
  const invoice = await db.query(
    `insert into invoices (status, invoice_number, invoice_date, issued_at, sender_snapshot)
     values ('issued', 'RE-2026-001', '2026-08-10', now(), '{}'::jsonb) returning id`
  )
  const id = invoice.rows[0].id
  await db.query(
    `insert into issued_numbers (number, prefix, year, seq, invoice_id)
     values ('RE-2026-001', 'RE', 2026, 1, $1)`,
    [id]
  )

  // Remove the invoice the way only a direct operator could: the trigger blocks
  // the application from doing this at all.
  await db.exec('alter table invoices disable trigger invoices_immutable_when_issued')
  await db.query('delete from invoices where id = $1', [id])
  await db.exec('alter table invoices enable trigger invoices_immutable_when_issued')

  // The journal entry survives — no foreign key could have taken it along.
  const left = await db.query('select count(*)::int as n from issued_numbers')
  assert.equal(left.rows[0].n, 1)

  // And the number cannot come back.
  await assert.rejects(
    () =>
      db.query(
        `insert into issued_numbers (number, prefix, year, seq)
         values ('RE-2026-001', 'RE', 2026, 1)`
      ),
    /duplicate key|unique/i
  )
})

test('a journal entry cannot be edited or deleted', async () => {
  const db = await freshDb()
  await db.query(
    `insert into issued_numbers (number, prefix, year, seq, reason)
     values ('RE-2026-007', 'RE', 2026, 7, 'Entwurf verworfen')`
  )
  await assert.rejects(
    () => db.query(`update issued_numbers set reason = 'anders' where number = 'RE-2026-007'`),
    /permanent record/
  )
  await assert.rejects(
    () => db.query(`delete from issued_numbers where number = 'RE-2026-007'`),
    /permanent record/
  )
})

test('the same sequence cannot be reached twice in one range and year', async () => {
  const db = await freshDb()
  await db.query(
    `insert into issued_numbers (number, prefix, year, seq) values ('RE-2026-001', 'RE', 2026, 1)`
  )
  // A differently written number that resolves to the same position in the range
  // is still the same number, and the composite unique catches it.
  await assert.rejects(
    () =>
      db.query(
        `insert into issued_numbers (number, prefix, year, seq)
         values ('RE-2026-0001', 'RE', 2026, 1)`
      ),
    /duplicate key|unique/i
  )
  // Different range, same sequence: allowed, they are independent counters.
  await db.query(
    `insert into issued_numbers (number, prefix, year, seq) values ('ST-2026-001', 'ST', 2026, 1)`
  )
  // Different year, same sequence: allowed, the counter restarts in January.
  await db.query(
    `insert into issued_numbers (number, prefix, year, seq) values ('RE-2027-001', 'RE', 2027, 1)`
  )
})

test('a hand-typed number outside any managed range is still recorded and unique', async () => {
  const db = await freshDb()
  // prefix/year/seq are null, so the composite unique cannot apply — the primary
  // key on the number itself is what keeps these unique.
  await db.query(`insert into issued_numbers (number) values ('Sonderrechnung 1')`)
  await db.query(`insert into issued_numbers (number) values ('Sonderrechnung 2')`)
  await assert.rejects(
    () => db.query(`insert into issued_numbers (number) values ('Sonderrechnung 1')`),
    /duplicate key|unique/i
  )
})

test('a Stornorechnung is a separate invoice that points at the original', async () => {
  const db = await freshDb()
  await db.query(
    `insert into invoices (status, invoice_number, invoice_date, issued_at, sender_snapshot)
     values ('issued', 'RE-2026-001', '2026-08-10', now(), '{}'::jsonb)`
  )
  await db.query(
    `insert into invoices (status, invoice_number, invoice_date, issued_at, sender_snapshot,
                           doc_type, storno_for, storno_for_date)
     values ('issued', 'ST-2026-001', '2026-08-11', now(), '{}'::jsonb,
             'storno', 'RE-2026-001', '2026-08-10')`
  )
  const rows = await db.query(
    `select invoice_number, storno_for from invoices order by invoice_number`
  )
  // Ordered by number: ST- sorts after RE-, where the old GS- sorted before it.
  assert.deepEqual(rows.rows, [
    { invoice_number: 'RE-2026-001', storno_for: '' },
    { invoice_number: 'ST-2026-001', storno_for: 'RE-2026-001' },
  ])

  // The original is untouched by the correction — it is immutable, and the
  // correction is a new document, never an edit.
  await assert.rejects(
    () => db.query(`update invoices set customer_name = 'x' where invoice_number = 'RE-2026-001'`),
    /immutable|issued/i
  )
})

// Mirrors the single statement in lib/db/invoices.ts `issueInvoice`. It is
// reproduced here rather than imported because that module is server-only, and
// the guarantee is a property of the SQL: the journal insert reads from the
// UPDATE's own RETURNING rows, so no rows updated means no rows inserted.
//
// This exists because the obvious two-statement version was verified WRONG. With
// `insert … where exists (select 1 from invoices where id = $1 and status =
// 'issued')`, issuing the same invoice a second time under a different number
// left the update matching nothing while the guard still passed — satisfied by
// the FIRST issue — and burned the second number against an invoice that carries
// neither it nor any explanation.
async function issue(db, id, number) {
  const result = await db.query(
    `with issued as (
       update invoices set status = 'issued', invoice_number = $2,
              issued_at = now(), sender_snapshot = '{}'::jsonb, updated_at = now()
       where id = $1 and status = 'draft'
       returning id
     )
     insert into issued_numbers (number, prefix, year, seq, invoice_id, reason)
     select $2, 'RE', 2026, $3, issued.id, '' from issued
     returning number`,
    [id, number, Number(number.slice(-3))]
  )
  return result.rows.length > 0
}

test('issuing twice cannot burn a second number', async () => {
  const db = await freshDb()
  const draft = await db.query(
    `insert into invoices (invoice_date, customer_name) values ('2026-08-10', 'A') returning id`
  )
  const id = draft.rows[0].id

  assert.equal(await issue(db, id, 'RE-2026-001'), true)

  // The same invoice again, under a DIFFERENT number. The update matches nothing
  // because the row is no longer a draft, so nothing may be journalled.
  assert.equal(await issue(db, id, 'RE-2026-002'), false)

  const journal = await db.query('select number from issued_numbers order by number')
  assert.deepEqual(
    journal.rows.map((r) => r.number),
    ['RE-2026-001'],
    'RE-2026-002 was burned against an invoice that does not carry it'
  )
  // And the invoice still carries the number it was actually issued under.
  const invoice = await db.query('select invoice_number from invoices where id = $1', [id])
  assert.equal(invoice.rows[0].invoice_number, 'RE-2026-001')
})

test('a draft claiming an already-issued number is rejected whole', async () => {
  const db = await freshDb()
  const first = await db.query(
    `insert into invoices (invoice_date, customer_name) values ('2026-08-10', 'A') returning id`
  )
  const second = await db.query(
    `insert into invoices (invoice_date, customer_name) values ('2026-08-10', 'B') returning id`
  )
  assert.equal(await issue(db, first.rows[0].id, 'RE-2026-001'), true)

  await assert.rejects(
    () => issue(db, second.rows[0].id, 'RE-2026-001'),
    /duplicate key|unique/i
  )
  // Nothing partial survived: the loser is still a draft with no number.
  const loser = await db.query('select status, invoice_number from invoices where id = $1', [
    second.rows[0].id,
  ])
  assert.deepEqual(loser.rows[0], { status: 'draft', invoice_number: null })
})

test('the journal date is the German calendar date, not UTC', async () => {
  const db = await freshDb()
  // The session is pinned to UTC to mimic a Vercel Function, which is where the
  // bug showed: a number claimed just after midnight in Germany was logged under
  // the previous day.
  await db.exec("set time zone 'UTC'")
  await db.query(
    `insert into issued_numbers (number, prefix, year, seq, created_at)
     values ('RE-2026-001', 'RE', 2026, 1, '2026-08-10 22:17:00+00')`
  )
  const row = await db.query(
    `select created_at::date::text as utc_date,
            (created_at at time zone 'Europe/Berlin')::date::text as berlin_date
     from issued_numbers`
  )
  assert.equal(row.rows[0].utc_date, '2026-08-10', 'a bare cast gives the UTC day')
  assert.equal(
    row.rows[0].berlin_date,
    '2026-08-11',
    'the log must show the day the invoice itself is dated'
  )
})

test('reverse charge is stored per invoice and frozen once issued', async () => {
  const db = await freshDb()
  // Defaults to false: an existing invoice cannot silently become intra-EU.
  const draft = await db.query(
    `insert into invoices (invoice_date, customer_name) values ('2026-08-11', 'A')
     returning id, reverse_charge`
  )
  assert.equal(draft.rows[0].reverse_charge, false)

  await db.query(
    `update invoices set reverse_charge = true, customer_vat_id = 'ATU12345678',
            status = 'issued', invoice_number = 'RE-2026-001', issued_at = now(),
            sender_snapshot = '{}'::jsonb
     where id = $1`,
    [draft.rows[0].id]
  )
  // Frozen with the rest of the document — the flag decides what the invoice
  // says about who owes the tax, so it must not drift after issuing.
  await assert.rejects(
    () => db.query('update invoices set reverse_charge = false where id = $1', [draft.rows[0].id]),
    /immutable|issued/i
  )
})

/** Mirrors lib/db/backup.ts createBackup, against PGlite. Dates are cast to text
 *  for the same reason: the driver reads a `date` as LOCAL midnight, which
 *  serialises a stored 2026-08-08 as 2026-08-07 in CEST — one day early in the
 *  file that is supposed to BE the record. */
async function backupFrom(db) {
  const q = async (text) => (await db.query(text)).rows
  const invoices = await q(`select id, status, invoice_number, proposed_number,
      invoice_date::text as invoice_date, service_date, customer_number, customer_name,
      customer_street, customer_zip_city, customer_country, customer_vat_id, payment_terms,
      storno_for, storno_for_date, reverse_charge, net_total, vat_total, gross_total,
      vat_breakdown, sender_snapshot, issued_at::text as issued_at, created_at::text as created_at
    from invoices order by created_at`)
  const items = await q(`select invoice_id, line_no, description, quantity, unit,
      unit_price, vat_rate, net_amount from invoice_items order by invoice_id, line_no`)
  return {
    app: 'silicortex-invoices',
    version: 1,
    exportedAt: '2026-08-11T00:00:00Z',
    database: 'test/test',
    masterData: (await q('select * from master_data where id = 1'))[0] ?? {},
    invoices: invoices.map((i) => ({
      ...i,
      items: items.filter((it) => it.invoice_id === i.id),
    })),
    issuedNumbers: await q(`select number, prefix, year, seq, invoice_id, reason,
      created_at::text as created_at from issued_numbers order by created_at, number`),
  }
}

async function seed(db) {
  await db.query(`update master_data set name = 'Mohamad Muster', iban = 'DE00 1234', vat_id = 'DE1' where id = 1`)
  // Draft first, then items, then issue — the order the app uses. Inserting items
  // under an already-issued invoice is what the item trigger exists to reject.
  const inv = await db.query(
    `insert into invoices (invoice_date, customer_name, customer_vat_id, reverse_charge,
        net_total, vat_total, gross_total, vat_breakdown)
     values ('2026-08-08', 'Kunde GmbH', 'ATU12345678', true, 100, 0, 100,
        '[{"rate":0,"net":100,"vat":0}]'::jsonb)
     returning id`
  )
  await db.query(
    `insert into invoice_items (invoice_id, line_no, description, quantity, unit, unit_price, vat_rate, net_amount)
     values ($1, 1, 'Entwicklung', 2, 'Std', 50, 0, 100)`,
    [inv.rows[0].id]
  )
  await db.query(
    `update invoices set status = 'issued', invoice_number = 'RE-2026-001', issued_at = now(),
            sender_snapshot = '{"name":"Muster"}'::jsonb
     where id = $1`,
    [inv.rows[0].id]
  )
  await db.query(
    `insert into issued_numbers (number, prefix, year, seq, invoice_id) values ('RE-2026-001','RE',2026,1,$1)`,
    [inv.rows[0].id]
  )
  await db.query(
    `insert into issued_numbers (number, prefix, year, seq, reason) values ('RE-2026-002','RE',2026,2,'Entwurf verworfen')`
  )
}

test('a backup restores into an empty database, unchanged', async () => {
  const source = await freshDb()
  await seed(source)
  const backup = await backupFrom(source)

  const target = await freshDb()
  const result = await restoreInto((text, params) => target.query(text, params ?? []), backup)
  assert.deepEqual(result, { invoices: 1, items: 1, numbers: 2 })

  // Compared as a whole, not field by field: a column added later without being
  // added to the backup would slip through a hand-picked list of assertions.
  const restored = await backupFrom(target)
  assert.deepEqual(restored.invoices, backup.invoices)
  assert.deepEqual(restored.issuedNumbers, backup.issuedNumbers)
  assert.equal(restored.masterData.name, 'Mohamad Muster')
  assert.equal(restored.masterData.iban, 'DE00 1234')
  // The date survives as the date it was, not one day either side of it.
  assert.equal(restored.invoices[0].invoice_date, '2026-08-08')
})

test('a restore leaves the immutability triggers enabled', async () => {
  const source = await freshDb()
  await seed(source)
  const target = await freshDb()
  await restoreInto((text, params) => target.query(text, params ?? []), await backupFrom(source))

  // A database left with the triggers off has silently lost the guarantee.
  const enabled = await target.query(
    `select tgname from pg_trigger where tgenabled = 'O' and tgname like '%immutable%' order by 1`
  )
  assert.deepEqual(enabled.rows.map((r) => r.tgname), [
    'invoice_items_immutable_when_issued',
    'invoices_immutable_when_issued',
    'issued_numbers_immutable',
  ])
  // And the restored invoice is immutable again.
  await assert.rejects(
    () => target.query(`update invoices set customer_name = 'x' where invoice_number = 'RE-2026-001'`),
    /immutable|issued/i
  )
})

test('a restore refuses a database that already holds invoices', async () => {
  const source = await freshDb()
  await seed(source)
  const backup = await backupFrom(source)

  // Merging would reintroduce numbers the journal has already burned and leave
  // two invoices claiming one number — nothing later can untangle that.
  const target = await freshDb()
  await seed(target)
  await assert.rejects(
    () => restoreInto((text, params) => target.query(text, params ?? []), backup),
    /Refusing to restore/
  )
})

test('a restore refuses a file that is not one of our backups', async () => {
  const db = await freshDb()
  const run = (backup) => restoreInto((text, params) => db.query(text, params ?? []), backup)
  await assert.rejects(() => run({ invoices: [] }), /missing app marker/)
  await assert.rejects(() => run({ app: 'something-else', version: 1 }), /missing app marker/)
  // A file from a future version might rely on columns this script does not know
  // to write; a partial restore is worse than a refusal.
  await assert.rejects(
    () => run({ app: 'silicortex-invoices', version: 99 }),
    /newer than this restore script/
  )
})

test('doc_type and storno_for cannot disagree', async () => {
  const db = await freshDb()
  const base = `insert into invoices (invoice_date, customer_name, doc_type, storno_for) values ('2026-08-11','A'`
  // An invoice carrying a Storno reference would print RECHNUNG above "Storno zu".
  await assert.rejects(
    () => db.query(`${base}, 'invoice', 'RE-2026-001')`),
    /invoices_storno_consistent/
  )
  // A Storno with nothing to point at.
  await assert.rejects(() => db.query(`${base}, 'storno', '')`), /invoices_storno_consistent/)
  // Both consistent forms are accepted.
  await db.query(`${base}, 'storno', 'RE-2026-001')`)
  await db.query(`${base}, 'invoice', '')`)
  await db.query(`${base}, 'quote', '')`)
})

test('doc_type only accepts the three known kinds', async () => {
  const db = await freshDb()
  await assert.rejects(
    () =>
      db.query(
        `insert into invoices (invoice_date, customer_name, doc_type) values ('2026-08-11','A','rechnung')`
      ),
    /invoices_doc_type_valid/
  )
})

test('a reverse-charge Angebot is not reported as an EU sale', async () => {
  const db = await freshDb()
  // Mirrors the WHERE clause in lib/db/invoices.ts listEuSales. An Angebot is an
  // offer, not an intra-EU supply — reported to the BZSt it would be turnover that
  // never happened.
  for (const [type, number] of [['invoice', 'RE-2026-001'], ['quote', 'AN-2026-001']]) {
    await db.query(
      `insert into invoices (status, invoice_number, invoice_date, issued_at, sender_snapshot,
          customer_name, customer_vat_id, reverse_charge, doc_type, net_total, vat_total, gross_total)
       values ('issued', $1, '2026-08-11', now(), '{}'::jsonb, 'EU Kunde', 'ATU12345678', true, $2, 100, 0, 100)`,
      [number, type]
    )
  }
  const reported = await db.query(
    `select invoice_number from invoices
     where status = 'issued' and reverse_charge = true and doc_type <> 'quote'`
  )
  assert.deepEqual(reported.rows.map((r) => r.invoice_number), ['RE-2026-001'])

  // And the same exclusion keeps it out of the Steuerberater's CSV.
  const booked = await db.query(`select invoice_number from invoices where doc_type <> 'quote'`)
  assert.deepEqual(booked.rows.map((r) => r.invoice_number), ['RE-2026-001'])
})

test('the storno consistency constraint backfills doc_type for older rows', async () => {
  // A database migrated between 262c994 (storno_for) and 6b55a74 (doc_type) can hold
  // an issued Storno with doc_type at its 'invoice' default. Adding the constraint
  // against that row aborts the migration, and it cannot be repaired afterwards
  // either: forbid_issued_invoice_changes() raises on any UPDATE of an issued row.
  const db = await PGlite.create()
  const upTo = (marker) => {
    const index = statements.findIndex((s) => s.includes(marker))
    assert.ok(index > 0, `marker not found: ${marker}`)
    return statements.slice(0, index)
  }

  // Apply everything except the consistency block, then plant the row.
  for (const statement of upTo('invoices_storno_consistent')) await db.exec(statement)
  await db.query(
    `insert into invoices (status, invoice_number, invoice_date, issued_at, sender_snapshot,
        storno_for, storno_for_date)
     values ('issued', 'ST-2026-001', '2026-08-11', now(), '{}'::jsonb, 'RE-2026-001', '2026-08-10')`
  )
  const planted = await db.query(`select doc_type from invoices where invoice_number = 'ST-2026-001'`)
  assert.equal(planted.rows[0].doc_type, 'invoice', 'the column should have taken its default')

  // The rest of the schema must now apply rather than abort.
  const rest = statements.slice(upTo('invoices_storno_consistent').length)
  for (const statement of rest) await db.exec(statement)

  const fixed = await db.query(`select doc_type from invoices where invoice_number = 'ST-2026-001'`)
  assert.equal(fixed.rows[0].doc_type, 'storno', 'the backfill should have corrected it')
  // And the trigger it had to switch off is back on.
  const trigger = await db.query(
    `select tgenabled from pg_trigger where tgname = 'invoices_immutable_when_issued'`
  )
  assert.equal(trigger.rows[0].tgenabled, 'O')
})

test('a failed restore unwinds to an empty database so a retry works', async () => {
  const source = await freshDb()
  await seed(source)
  const backup = await backupFrom(source)

  const target = await freshDb()
  const before = await target.query('select name from master_data where id = 1')

  // A journal entry that cannot be inserted: the invoices go in first, so the
  // failure lands half way through.
  const broken = {
    ...backup,
    issuedNumbers: [...backup.issuedNumbers, { number: null }],
  }
  await assert.rejects(() =>
    restoreInto((text, params) => target.query(text, params ?? []), broken)
  )

  // Nothing left behind, and master data put back — so the emptiness guard does not
  // refuse the retry.
  for (const table of ['invoices', 'invoice_items', 'issued_numbers']) {
    const left = await target.query(`select count(*)::int as n from ${table}`)
    assert.equal(left.rows[0].n, 0, `${table} should be empty again`)
  }
  const after = await target.query('select name from master_data where id = 1')
  assert.equal(after.rows[0].name, before.rows[0].name)

  // And the retry succeeds.
  const result = await restoreInto((text, params) => target.query(text, params ?? []), backup)
  assert.deepEqual(result, { invoices: 1, items: 1, numbers: 2 })
})

test('a VAT id written with punctuation groups as one customer', async () => {
  const db = await freshDb()
  // upper(translate(id, ' .-', '')) must strip exactly what vatIdPrefix strips.
  // With the hyphen missing, "ATU-12345678" became its own ZM row beside
  // "ATU12345678", each understating the per-customer total sent to the BZSt.
  for (const [n, vat] of [['RE-2026-001', 'ATU12345678'], ['RE-2026-002', 'ATU-123 456.78']]) {
    await db.query(
      `insert into invoices (status, invoice_number, invoice_date, issued_at, sender_snapshot,
          customer_name, customer_vat_id, reverse_charge, net_total, vat_total, gross_total)
       values ('issued', $1, '2026-08-11', now(), '{}'::jsonb, 'EU', $2, true, 100, 0, 100)`,
      [n, vat]
    )
  }
  const grouped = await db.query(
    `select upper(translate(customer_vat_id, ' .-', '')) as vat_id, count(*)::int as n
     from invoices where reverse_charge = true group by 1`
  )
  assert.deepEqual(grouped.rows, [{ vat_id: 'ATU12345678', n: 2 }])
})
