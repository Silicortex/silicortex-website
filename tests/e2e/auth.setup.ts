import { test as setup, expect } from '@playwright/test'
import { backupMasterData, clearLoginAttempts } from './db.ts'

const STORAGE = 'tests/e2e/.auth/owner.json'

setup('sign in through the real login form', async ({ page }) => {
  // The login gate rejects an IP after 8 failed attempts in 15 minutes, checked
  // before the password. auth.spec.ts's wrong-password test adds one failure
  // per run, so without this, the eighth run in 15 minutes locks out the real
  // login used right below.
  await clearLoginAttempts()
  // Snapshot the owner's real master data before anything touches it, so the
  // teardown can restore it even if a test throws mid-edit.
  await backupMasterData()

  const password = process.env.ADMIN_PASSWORD
  if (!password) throw new Error('ADMIN_PASSWORD is not set — run via npm run test:e2e')

  await page.goto('/admin/login')
  await page.getByLabel('Passwort').fill(password)
  await page.getByRole('button', { name: 'Anmelden' }).click()

  await expect(page.getByRole('button', { name: 'Rechnung erstellen' })).toBeVisible()
  await page.context().storageState({ path: STORAGE })
})
