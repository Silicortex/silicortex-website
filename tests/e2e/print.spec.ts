import { test, expect } from '@playwright/test'

test.describe('print output', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
    await page.getByLabel('Kundenname').fill('Druck Testkunde')
    await page.getByLabel('Kundenstraße').fill('Teststr. 1')
    await page.getByLabel('Kunden-PLZ und Ort').fill('65195 Wiesbaden')
    await page.getByLabel('Leistungsdatum oder Leistungszeitraum').fill('Juli 2026')
    await page.getByLabel('Rechnungsdatum').fill('2026-08-08')
    await page.getByLabel('Beschreibung Position 1').fill(
      'Sehr lange Leistungsbeschreibung, die in einem einzeiligen Eingabefeld abgeschnitten würde und daher im Druck als umbrechender Text erscheinen muss.'
    )
    await page.getByLabel('Menge Position 1').fill('2')
    await page.getByLabel('Einzelpreis Position 1').fill('80,50')
    await page.getByLabel('Einzelpreis Position 1').blur()
    // Print state is pure render, so no beforeprint hook has to fire first.
    await page.emulateMedia({ media: 'print' })
  })

  test('the date prints as DD.MM.YYYY', async ({ page }) => {
    await expect(page.getByText('08.08.2026')).toBeVisible()
  })

  test('the long description is fully present and wrapping', async ({ page }) => {
    const span = page.locator('.admin-print-only', { hasText: 'Sehr lange Leistungsbeschreibung' })
    await expect(span).toBeVisible()
    await expect(span).toContainText('erscheinen muss.')
    await expect(span).toHaveCSS('white-space', 'pre-wrap')
  })

  test('empty optional rows are removed entirely, not left with a bare label', async ({ page }) => {
    // A printed label with no value reads as an error on a customer's invoice.
    //
    // The count assertion comes FIRST and is not optional: `:visible` with
    // `toHaveCount(0)` is satisfied by zero matches, so deleting the
    // `.admin-optional` markup outright would pass too. Asserting the wrappers
    // exist, then that none is visible, is what makes this able to fail.
    await expect(page.locator('.admin-optional')).toHaveCount(2)
    await expect(page.locator('.admin-optional:visible')).toHaveCount(0)
    await expect(page.getByText('Kundennummer')).toBeHidden()
  })

  test('empty line items are hidden', async ({ page }) => {
    await page.emulateMedia({ media: 'screen' })
    await page.getByRole('button', { name: '+ Position hinzufügen' }).click()
    await page.emulateMedia({ media: 'print' })
    const emptyRow = page.locator('tr[data-empty="true"]')
    await expect(emptyRow).toHaveCount(1) // the attribute must still be produced
    await expect(emptyRow).toBeHidden() // and print CSS must still hide it
  })

  test('toolbar, tabs and inputs are hidden', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Drucken / PDF' })).toBeHidden()
    await expect(page.getByRole('button', { name: 'Meine Rechnungen' })).toBeHidden()
    await expect(page.getByLabel('Kundenname')).toBeHidden()
    await expect(page.getByLabel('Steuersatz Position 1')).toBeHidden()
  })
})
