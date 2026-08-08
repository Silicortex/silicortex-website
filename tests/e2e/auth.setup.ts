import { test as setup, expect } from '@playwright/test'

const STORAGE = 'tests/e2e/.auth/owner.json'

setup('sign in through the real login form', async ({ page }) => {
  const password = process.env.ADMIN_PASSWORD
  if (!password) throw new Error('ADMIN_PASSWORD is not set — run via npm run test:e2e')

  await page.goto('/admin/login')
  await page.getByLabel('Passwort').fill(password)
  await page.getByRole('button', { name: 'Anmelden' }).click()

  await expect(page.getByRole('button', { name: 'Rechnung erstellen' })).toBeVisible()
  await page.context().storageState({ path: STORAGE })
})
