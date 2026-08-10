import { neon } from '@neondatabase/serverless'

// Fails loudly at import time rather than silently querying nothing.
function databaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Locally: vercel env pull .env.local'
    )
  }
  return url
}

export const sql = neon(databaseUrl())
