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
    `insert into issued_numbers (number, prefix, year, seq) values ('GS-2026-001', 'GS', 2026, 1)`
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

test('a Storno is a separate invoice that points at the original', async () => {
  const db = await freshDb()
  await db.query(
    `insert into invoices (status, invoice_number, invoice_date, issued_at, sender_snapshot)
     values ('issued', 'RE-2026-001', '2026-08-10', now(), '{}'::jsonb)`
  )
  await db.query(
    `insert into invoices (status, invoice_number, invoice_date, issued_at, sender_snapshot,
                           storno_for, storno_for_date)
     values ('issued', 'GS-2026-001', '2026-08-11', now(), '{}'::jsonb,
             'RE-2026-001', '2026-08-10')`
  )
  const rows = await db.query(
    `select invoice_number, storno_for from invoices order by invoice_number`
  )
  assert.deepEqual(rows.rows, [
    { invoice_number: 'GS-2026-001', storno_for: 'RE-2026-001' },
    { invoice_number: 'RE-2026-001', storno_for: '' },
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
