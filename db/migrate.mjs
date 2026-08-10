// Applies db/schema.sql to the database in DATABASE_URL.
// Statements are separated by a line containing exactly "-- @@" because the
// Neon HTTP driver executes one statement per call.
import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set. Run: vercel env pull .env.local')
  process.exit(1)
}

const sql = neon(url)
const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8')
const statements = schema
  .split(/^-- @@$/m)
  .map((s) => s.trim())
  .filter(Boolean)

for (const [i, statement] of statements.entries()) {
  const label = statement.split('\n')[0].slice(0, 60)
  try {
    await sql.query(statement)
    console.log(`ok   ${i + 1}/${statements.length}  ${label}`)
  } catch (error) {
    console.error(`FAIL ${i + 1}/${statements.length}  ${label}`)
    console.error(error)
    process.exit(1)
  }
}

console.log('schema applied')
