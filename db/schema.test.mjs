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
    ['invoice_items', 'invoices', 'login_attempts', 'master_data']
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
     issued_at = now() where id = $1 and status = 'draft'`,
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
    `update invoices set status = 'issued', invoice_number = '2026-001'
     where id = $1 and status = 'draft'`,
    [a.rows[0].id]
  )
  await assert.rejects(
    () =>
      db.query(
        `update invoices set status = 'issued', invoice_number = '2026-001'
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
