import { test, expect } from '@playwright/test'

async function fillInvoice(page: import('@playwright/test').Page, customer: string) {
  await page.getByLabel('Kundenname').fill(customer)
  await page.getByLabel('Kundenstraße').fill('Teststr. 1')
  await page.getByLabel('Kunden-PLZ und Ort').fill('65195 Wiesbaden')
  await page.getByLabel('Leistungsdatum oder Leistungszeitraum').fill('Juli 2026')
  await page.getByLabel('Beschreibung Position 1').fill('Entwicklung')
  await page.getByLabel('Menge Position 1').fill('2')
  await page.getByLabel('Einzelpreis Position 1').fill('80,50')
  await page.getByLabel('Einzelpreis Position 1').blur()
}

// Rows surviving a killed run (the guard deliberately admits E2E- leftovers)
// would collide with strict-mode row locators, and `.first()` would silently
// assert against the PREVIOUS run's invoice. Invoice numbers already carry a
// per-run suffix; customer names now do too.
const RUN = Date.now()

/** Fills and saves the minimum Stammdaten § 14 UStG requires before an invoice
 *  can be issued: a name, a complete own address, and a Steuernummer (or a
 *  USt-IdNr., either satisfies the law). Without this, issuing is refused —
 *  which is deliberate: it would otherwise freeze a legally invalid invoice
 *  that is immutable and correctable only by voiding it. */
async function saveSender(page: import('@playwright/test').Page, name: string) {
  await page.getByRole('button', { name: 'Stammdaten' }).click()
  await page.getByLabel('Name / Firmenbezeichnung').fill(name)
  await page.getByLabel('Straße und Hausnummer').fill('Teststraße 1')
  await page.getByLabel('PLZ und Ort').fill('00000 Teststadt')
  await page.getByLabel('Steuernummer').fill('TEST-000/000/00000')
  await page.getByRole('button', { name: 'Stammdaten speichern' }).click()
  await expect(page.getByText('Gespeichert.')).toBeVisible()
}

async function issuedCount(page: import('@playwright/test').Page): Promise<number> {
  // A fresh table with no invoices renders an empty state with no counter at
  // all, so a plain waitFor would hang. Wait for EITHER, then read.
  const counter = page.getByText(/Festgeschriebene Rechnungen:/)
  const empty = page.getByText('Noch keine Rechnungen')
  await expect(counter.or(empty).first()).toBeVisible()
  if ((await counter.count()) === 0) return 0
  return Number((await counter.textContent())?.match(/\d+/)?.[0] ?? '0')
}

test('a German decimal price is not swallowed and totals compute per rate', async ({ page }) => {
  await page.goto('/admin')
  await fillInvoice(page, `Testkunde Totals ${RUN}`)

  // 2 × 80,50 = 161,00 net; 19 % = 30,59; gross 191,59
  await expect(page.getByText('161,00 €').first()).toBeVisible()
  await expect(page.getByText('30,59 €')).toBeVisible()
  await expect(page.getByText('191,59 €')).toBeVisible()

  // Add a 7 % line: both VAT blocks must appear separately.
  await page.getByRole('button', { name: '+ Position hinzufügen' }).click()
  await page.getByLabel('Beschreibung Position 2').fill('Buch')
  await page.getByLabel('Menge Position 2').fill('1')
  await page.getByLabel('Einzelpreis Position 2').fill('100')
  await page.getByLabel('Einzelpreis Position 2').blur()
  await page.getByLabel('Steuersatz Position 2').selectOption('7')

  await expect(page.getByText('zzgl. 19 % USt.')).toBeVisible()
  await expect(page.getByText('zzgl. 7 % USt.')).toBeVisible()
  await expect(page.getByText('298,59 €')).toBeVisible()
})

test('a master data edit shows up in the sheet immediately', async ({ page }) => {
  await page.goto('/admin')
  await page.getByRole('button', { name: 'Stammdaten' }).click()
  await page.getByLabel('Name / Firmenbezeichnung').fill('E2E Testname')
  await page.getByRole('button', { name: 'Rechnung erstellen' }).click()
  await expect(page.getByText('E2E Testname').first()).toBeVisible()
  // Not saved to the database — reloading restores the real value.
})

test('deleting the last line item creates a fresh empty one', async ({ page }) => {
  await page.goto('/admin')
  await page.getByLabel('Position 1 löschen').click()
  await expect(page.getByLabel('Beschreibung Position 1')).toHaveValue('')
})

test('archiving, copying and draft deletion work', async ({ page }) => {
  await page.goto('/admin')
  await fillInvoice(page, `Testkunde Archiv ${RUN}`)
  await page.getByRole('button', { name: 'Ins Archiv legen' }).click()
  await expect(page.getByText('Ins Archiv gelegt.')).toBeVisible()

  await page.getByRole('button', { name: 'Meine Rechnungen' }).click()
  const row = page.getByRole('row', { name: new RegExp(`Testkunde Archiv ${RUN}`) })
  await expect(row).toBeVisible()
  await expect(row.getByText('Entwurf')).toBeVisible()

  await row.getByRole('button', { name: 'Kopie' }).click()
  await expect(page.getByText('Kopie erstellt.')).toBeVisible()
  await expect(page.getByLabel('Kundenname')).toHaveValue(`Testkunde Archiv ${RUN}`)

  await page.getByRole('button', { name: 'Meine Rechnungen' }).click()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('row', { name: new RegExp(`Testkunde Archiv ${RUN}`) }).first()
    .getByRole('button', { name: /löschen/ }).click()
  await expect(page.getByText('Entwurf gelöscht.')).toBeVisible()
})

test('an issued invoice cannot be edited or deleted', async ({ page }) => {
  // Neutralise window.print() so a real print dialog can never hang the run.
  await page.addInitScript(() => {
    window.print = () => {}
  })

  await page.goto('/admin')
  // Issuing requires a § 14-complete sender, and this test runs before the
  // snapshot tests that save one, so master_data is still empty here.
  await saveSender(page, 'E2E Sender Immutable')

  await page.getByRole('button', { name: 'Meine Rechnungen' }).click()
  // A leftover row from an earlier run would already satisfy a bare "[1-9]"
  // match, so read the count before issuing and assert it grows by exactly one.
  const before = await issuedCount(page)

  await page.getByRole('button', { name: 'Rechnung erstellen' }).click()
  await fillInvoice(page, `Testkunde Festschreiben ${RUN}`)
  // Every invoice number the suite issues must carry the E2E- prefix, so
  // cleanup can never touch a real invoice.
  await page.getByLabel('Rechnungsnummer').fill(`E2E-${Date.now()}`)

  page.once('dialog', (dialog) => dialog.accept()) // festschreiben confirmation
  await page.getByRole('button', { name: 'Drucken / PDF' }).click()

  await expect(page.getByText(/Festgeschrieben als E2E-/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ins Archiv legen' })).toBeDisabled()
  await expect(page.getByLabel('Kundenname')).toHaveAttribute('readonly', '')

  await page.getByRole('button', { name: 'Meine Rechnungen' }).click()
  const row = page.getByRole('row', { name: new RegExp(`Testkunde Festschreiben ${RUN}`) })
  // toHaveCount(0) below also passes if the row itself vanished, so assert
  // the row exists first.
  await expect(row).toBeVisible()
  await expect(row.getByRole('button', { name: /löschen/ })).toHaveCount(0)
  // Anchored: a substring match for ': 1' also matches a rendered ': 10'.
  await expect(page.getByText(new RegExp(`Festgeschriebene Rechnungen:\\s*${before + 1}$`))).toBeVisible()
})

/** Empties the sender through the UI, so the § 14 refusal can be observed. The
 *  suite's teardown restores the real row from its backup afterwards. */
async function clearSender(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Stammdaten' }).click()
  for (const label of ['Name / Firmenbezeichnung', 'Straße und Hausnummer', 'PLZ und Ort', 'Steuernummer', 'USt-IdNr. (§ 27a UStG)']) {
    await page.getByLabel(label).fill('')
  }
  await page.getByRole('button', { name: 'Stammdaten speichern' }).click()
  await expect(page.getByText('Gespeichert.')).toBeVisible()
}

// Without this, the § 14 sender check had no e2e coverage at all: every issuing
// test pre-saves a complete sender, so deleting the enforceSender block — or
// flipping it to false — kept the entire suite green. Issuing with an empty
// sender freezes a legally invalid, immutable invoice, so the refusal is the
// behaviour that matters most here.
test('issuing is refused when the Stammdaten sender is incomplete', async ({ page }) => {
  let dialogOpened = false
  page.on('dialog', (dialog) => {
    dialogOpened = true
    void dialog.dismiss()
  })

  await page.goto('/admin')
  await clearSender(page)
  await page.getByRole('button', { name: 'Rechnung erstellen' }).click()
  await fillInvoice(page, `Testkunde Sender ${RUN}`)
  await page.getByLabel('Rechnungsnummer').fill(`E2E-SENDER-${RUN}`)

  await page.getByRole('button', { name: 'Drucken / PDF' }).click()

  const alert = page.getByText('Die Rechnung ist noch nicht vollständig:')
  await expect(alert).toBeVisible()
  await expect(page.getByText('Stammdaten: Name fehlt.')).toBeVisible()
  await expect(page.getByText('Stammdaten: eigene Adresse ist unvollständig.')).toBeVisible()
  await expect(page.getByText(/Steuernummer oder USt-IdNr\. fehlt/)).toBeVisible()

  // No festschreiben confirmation may appear: the invoice must be refused
  // before anything is claimed or frozen.
  expect(dialogOpened).toBe(false)
  await expect(page.getByText(/Festgeschrieben als/)).toHaveCount(0)
})

test('incomplete invoices are refused before printing', async ({ page }) => {
  await page.goto('/admin')
  await page.getByRole('button', { name: 'Drucken / PDF' }).click()
  // Next's dev overlay injects a second, empty role="alert" element, and the
  // real error banner also carries role="alert" — asserting on the role alone
  // is a strict-mode violation with two matches. Assert on the message text.
  await expect(page.getByText('Kundenname fehlt.')).toBeVisible()
  await expect(page.getByText('Mindestens eine Position', { exact: false })).toBeVisible()
})

test('an issued invoice keeps printing its frozen sender after Stammdaten changes', async ({ page }) => {
  // Neutralise window.print() so a real print dialog can never hang the run
  // (standing project convention — see the other tests in this file).
  await page.addInitScript(() => {
    window.print = () => {}
  })

  await page.goto('/admin')

  // Set a sender, then issue an invoice carrying it.
  await saveSender(page, 'SNAPSHOT Sender Alt')
  await expect(page.getByText('Gespeichert.')).toBeVisible()

  await page.getByRole('button', { name: 'Rechnung erstellen' }).click()
  await fillInvoice(page, `Testkunde Snapshot ${RUN}`)
  const number = `E2E-SNAP-${Date.now()}`
  await page.getByLabel('Rechnungsnummer').fill(number)
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Drucken / PDF' }).click()
  await expect(page.getByText(new RegExp(`Festgeschrieben als ${number}`))).toBeVisible()

  // Now change the sender. The issued invoice must not follow.
  await page.getByRole('button', { name: 'Stammdaten' }).click()
  await page.getByLabel('Name / Firmenbezeichnung').fill('SNAPSHOT Sender Neu')
  await page.getByRole('button', { name: 'Stammdaten speichern' }).click()
  await expect(page.getByText('Gespeichert.')).toBeVisible()
  await expect(page.getByText('Gespeichert.')).toBeVisible()

  // Reload it from the archive, so it comes back through loadInvoice.
  await page.getByRole('button', { name: 'Meine Rechnungen' }).click()
  await page.getByRole('row', { name: new RegExp(`Testkunde Snapshot ${RUN}`) }).getByRole('button', { name: 'Laden' }).click()

  const sheet = page.locator('article')
  await expect(sheet).toContainText('SNAPSHOT Sender Alt')
  await expect(sheet).not.toContainText('SNAPSHOT Sender Neu')
  // The VAT group line (2 x 80,50 at 19%) comes only from the stored
  // vat_breakdown -> groups mapping on reload, not from lineNets or the
  // gross total — this exercises that mapping specifically.
  await expect(sheet).toContainText('30,59 €')
})

test('an unsaved Stammdaten edit never reaches an issued invoice', async ({ page }) => {
  // Neutralise window.print() so a real print dialog can never hang the run —
  // same convention as the other two issuing tests.
  await page.addInitScript(() => {
    window.print = () => {}
  })

  await page.goto('/admin')

  // Save a known sender.
  await saveSender(page, 'SNAPSHOT Gespeichert')
  await expect(page.getByText('Gespeichert.')).toBeVisible()

  // Type a different one WITHOUT saving, then leave the tab.
  await page.getByLabel('Name / Firmenbezeichnung').fill('SNAPSHOT Ungespeichert')
  await page.getByRole('button', { name: 'Rechnung erstellen' }).click()

  await fillInvoice(page, `Testkunde Unsaved ${RUN}`)
  const number = `E2E-UNSAVED-${Date.now()}`
  await page.getByLabel('Rechnungsnummer').fill(number)
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Drucken / PDF' }).click()
  await expect(page.getByText(new RegExp(`Festgeschrieben als ${number}`))).toBeVisible()

  // The printed sender must match what the database froze — the SAVED value.
  const sheet = page.locator('article')
  await expect(sheet).toContainText('SNAPSHOT Gespeichert')
  await expect(sheet).not.toContainText('SNAPSHOT Ungespeichert')
})
