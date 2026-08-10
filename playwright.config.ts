import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://localhost:3000'

// The suite must NEVER run against the real invoicing database: it disables
// both immutability triggers, deletes rows, and overwrites master_data. It
// therefore runs against E2E_DATABASE_URL — a separate database on the same
// Neon instance (see README). Redirecting DATABASE_URL here, at config load,
// points BOTH consumers at it: the test helpers in tests/e2e/db.ts (which
// import lib/db/client.ts in this process) and the dev server below (which
// inherits this process's environment).
if (process.env.E2E_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.E2E_DATABASE_URL
}
// With no E2E_DATABASE_URL the suite would hit the real database, so the
// guard project below is the only thing standing between a test run and the
// owner's invoices. It refuses to proceed if the target holds real data.

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
    { name: 'cleanup', testMatch: /global\.teardown\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/owner.json' },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    // Never reuse a server that is already running: it would have been started
    // by the owner against the REAL database, and every Server Action the
    // tests trigger would write there. A fresh server inherits the redirected
    // DATABASE_URL above.
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
