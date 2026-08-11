import { defineConfig, devices } from '@playwright/test'

// Overridable because port 3000 is not always free — another project's dev server
// on it aborts the whole run ("http://localhost:3000 is already used"), and the
// answer must not be to kill someone else's server or to reuse whatever answers
// there. E2E_PORT=3100 npm run test:e2e starts this suite's OWN server elsewhere;
// reuseExistingServer stays false either way.
const port = process.env.E2E_PORT?.trim() || '3000'
const baseURL = `http://localhost:${port}`

// The suite must NEVER run against the real invoicing database: it disables
// both immutability triggers, deletes rows, and overwrites master_data. It
// therefore runs against E2E_DATABASE_URL — a separate database on the same
// Neon instance (see README). Redirecting DATABASE_URL here, at config load,
// points BOTH consumers at it: the test helpers in tests/e2e/db.ts (which
// import lib/db/client.ts in this process) and the dev server below (which
// inherits this process's environment).
// Absent or empty, this is refused outright rather than falling back to
// DATABASE_URL. A silent fallback made the real invoicing database the target,
// leaving only a heuristic guard between a test run and the owner's invoices —
// and `E2E_DATABASE_URL=` from a scaffolded .env line reads as the empty
// string, which a truthiness check would also skip.
if (!process.env.E2E_DATABASE_URL?.trim()) {
  throw new Error(
    'E2E_DATABASE_URL is not set. The suite disables the invoice immutability ' +
      'triggers, deletes rows and overwrites master data, so it must never run ' +
      'against the invoicing database. See the README for creating the isolated ' +
      'e2e database.'
  )
}
process.env.DATABASE_URL = process.env.E2E_DATABASE_URL

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // one database, shared state
  workers: 1,
  use: { baseURL },
  projects: [
    // Runs before everything and aborts the run if DATABASE_URL points at a
    // database containing non-E2E issued invoices or filled-in master data.
    { name: 'guard', testMatch: /guard\.setup\.ts/ },
    { name: 'setup', testMatch: /auth\.setup\.ts/, dependencies: ['guard'], teardown: 'cleanup' },
    // This teardown CANNOT be gated with `dependencies: ['guard']` — Playwright
    // rejects the config outright ("Teardown project cleanup must not have
    // dependencies"). And it runs even when the guard project failed, which was
    // verified by planting a marker row and watching the teardown wipe it.
    //
    // So the gate lives in the code instead: global.teardown.ts asserts the
    // database is free of real invoices before touching anything, and
    // cleanupE2eRows() re-asserts for any other caller.
    { name: 'cleanup', testMatch: /global\.teardown\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/owner.json' },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: baseURL,
    // Never reuse a server that is already running: it would have been started
    // by the owner against the REAL database, and every Server Action the
    // tests trigger would write there. A fresh server inherits the redirected
    // DATABASE_URL above.
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
