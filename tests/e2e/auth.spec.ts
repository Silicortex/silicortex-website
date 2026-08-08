import { test, expect } from '@playwright/test'

test.describe('unauthenticated', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('/admin redirects to the login page', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login$/)
  })

  test('a wrong password is rejected without saying why', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel('Passwort').fill('definitely-not-the-password')
    await page.getByRole('button', { name: 'Anmelden' }).click()
    // Next's dev overlay injects a SECOND, empty role="alert" element, so
    // asserting on getByRole('alert') can match the wrong one. Assert on the
    // message text instead. A failed login takes ~1.3s (a fixed delay plus
    // two Neon round trips), so give this a generous timeout.
    await expect(page.getByText('Anmeldung fehlgeschlagen.')).toBeVisible({ timeout: 10_000 })
    await expect(page).toHaveURL(/\/admin\/login$/)
  })

  test('a Server Action is rejected without a session cookie', async ({ request }) => {
    // The boundary itself, not just the redirect: Server Actions are POST
    // endpoints reachable without ever loading the page.
    const response = await request.post('/admin', {
      headers: { 'Next-Action': 'probe', 'Content-Type': 'text/plain;charset=UTF-8' },
      data: '[]',
      maxRedirects: 0,
    })
    expect(response.status()).not.toBe(200)
  })
})

test('a signed-in owner visiting the login page is sent to /admin', async ({ page }) => {
  await page.goto('/admin/login')
  await expect(page).toHaveURL(/\/admin$/)
})

test('signing out re-gates the admin area', async ({ page }) => {
  await page.goto('/admin')
  await page.getByRole('button', { name: 'Abmelden' }).click()
  await expect(page).toHaveURL(/\/admin\/login$/)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login$/)
})
