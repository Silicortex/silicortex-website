import { test, expect, request as playwrightRequest } from '@playwright/test'

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
async function saveSender(
  page: import('@playwright/test').Page,
  name: string,
  // An intra-EU invoice is the one case where the Steuernummer is not enough:
  // the supplier's own USt-IdNr. must be on it. Off by default, so the domestic
  // tests keep exercising the Steuernummer-only path § 14 allows.
  options: { vatId?: string } = {}
) {
  await page.getByRole('button', { name: 'Stammdaten' }).click()
  await page.getByLabel('Name / Firmenbezeichnung').fill(name)
  await page.getByLabel('Straße und Hausnummer').fill('Teststraße 1')
  await page.getByLabel('PLZ und Ort').fill('00000 Teststadt')
  await page.getByLabel('Steuernummer').fill('TEST-000/000/00000')
  if (options.vatId) await page.getByLabel('USt-IdNr. (§ 27a UStG)').fill(options.vatId)
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

test('a number already issued cannot be claimed by another invoice', async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => {}
  })
  await page.goto('/admin')
  await saveSender(page, 'E2E Sender Duplicate')

  const taken = `E2E-DUP-${RUN}`
  await page.getByRole('button', { name: 'Rechnung erstellen' }).click()
  await fillInvoice(page, `Testkunde Dup A ${RUN}`)
  await page.getByLabel('Rechnungsnummer').fill(taken)
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Drucken / PDF' }).click()
  await expect(page.getByText(`Festgeschrieben als ${taken}.`)).toBeVisible()

  // A second invoice typed with the same number must be refused outright.
  await page.reload()
  await fillInvoice(page, `Testkunde Dup B ${RUN}`)
  await page.getByLabel('Rechnungsnummer').fill(taken)
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Drucken / PDF' }).click()

  await expect(page.getByText(`Die Rechnungsnummer ${taken} ist bereits vergeben.`)).toBeVisible()
  // Rejected WHOLE: it is still an editable draft, not a half-issued document.
  await expect(page.getByLabel('Kundenname')).not.toHaveAttribute('readonly', '')
  await expect(page.getByRole('button', { name: 'Ins Archiv legen' })).toBeEnabled()
})

test('a Stornorechnung is a new ST- document with negated amounts', async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => {}
  })
  await page.goto('/admin')
  await saveSender(page, 'E2E Sender Storno')

  await page.getByRole('button', { name: 'Rechnung erstellen' }).click()
  await fillInvoice(page, `Testkunde Storno ${RUN}`)
  const original = `E2E-STORNO-${RUN}`
  await page.getByLabel('Rechnungsnummer').fill(original)
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Drucken / PDF' }).click()
  await expect(page.getByText(`Festgeschrieben als ${original}.`)).toBeVisible()

  await page.getByRole('button', { name: 'Meine Rechnungen' }).click()
  // The number the invoice was issued under is now in the journal.
  await expect(
    page.getByRole('row', { name: new RegExp(original) }).filter({ hasText: 'Rechnung' }).first()
  ).toBeVisible()

  const row = page.getByRole('row', { name: new RegExp(`Testkunde Storno ${RUN}`) })
  await row.getByRole('button', { name: 'Storno' }).click()

  // Its own number from the ST- range — never the original's, and never an edit
  // of it.
  await expect(page.getByText(/Storno-Entwurf zu E2E-STORNO-/)).toBeVisible()
  await expect(page.getByLabel('Rechnungsnummer')).toHaveValue(/^ST-\d{4}-\d{3,}$/)
  // STORNORECHNUNG, never GUTSCHRIFT: a Gutschrift is self-billing under German
  // VAT law and the word can trigger an unintended VAT liability.
  await expect(page.locator('.admin-sheet h2')).toHaveText('STORNORECHNUNG')
  await expect(page.locator('.admin-sheet')).not.toContainText('Gutschrift')
  await expect(page.getByText(`Storno zu Rechnung ${original} vom`)).toBeVisible()

  // Negated, so it zeroes the original out in the books rather than reading as a
  // second charge. The sign sits on the price; the quantity stays physical.
  await expect(page.getByLabel('Einzelpreis Position 1')).toHaveValue('-80,50')
  await expect(page.getByLabel('Menge Position 1')).toHaveValue('2')
  // 2 × -80,50 = -161,00 net, and the VAT and gross follow the same sign.
  await expect(page.locator('.admin-sheet')).toContainText('-161,00 €')
  await expect(page.locator('.admin-sheet')).toContainText('-30,59 €') // 19 % of -161,00
  await expect(page.locator('.admin-sheet')).toContainText('-191,59 €')
  // And nothing tells the customer to pay a document nobody pays.
  await expect(page.getByLabel('Zahlungsbedingungen')).toHaveValue(
    /Bitte überweisen Sie keinen Betrag/
  )

  // Deliberately NOT issued. An ST- number carries no E2E- prefix, so cleanup
  // could not remove it and the next run's guard would refuse to start.
})

test('skipping ahead warns before the number is claimed', async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => {}
  })
  await page.goto('/admin')
  await saveSender(page, 'E2E Sender Skip') // leaves the Stammdaten tab open
  await page.getByRole('button', { name: 'Rechnung erstellen' }).click()
  await fillInvoice(page, `Testkunde Skip ${RUN}`)

  // A managed number far past the next free one — the mistyped-100-for-010 case.
  await page.getByLabel('Rechnungsnummer').fill('RE-2026-100')
  let message = ''
  page.once('dialog', (dialog) => {
    message = dialog.message()
    void dialog.dismiss() // declined, so nothing is claimed
  })
  await page.getByRole('button', { name: 'Drucken / PDF' }).click()
  await expect.poll(() => message).toContain('überspringt')
  expect(message).toContain('RE-2026-001')

  // Declining leaves the invoice a draft, and no number is burned.
  await expect(page.getByLabel('Kundenname')).not.toHaveAttribute('readonly', '')
  await page.getByRole('button', { name: 'Meine Rechnungen' }).click()
  await expect(page.getByRole('row', { name: /RE-2026-100/ })).toHaveCount(0)
})

test('reverse charge forces 0 %, prints the note and refuses a bad VAT ID', async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => {}
  })
  await page.goto('/admin')
  await saveSender(page, 'E2E Sender Reverse', { vatId: 'DE999999999' })
  await page.getByRole('button', { name: 'Rechnung erstellen' }).click()
  await fillInvoice(page, `Testkunde EU ${RUN}`)

  // Line 1 is at 19 % from the Stammdaten default before the switch is flipped.
  await expect(page.getByLabel('Steuersatz Position 1')).toHaveValue('19')
  await page.getByLabel('Reverse Charge (EU-Kunde)').check()

  // Path 1: existing lines are rewritten to 0 %.
  await expect(page.getByLabel('Steuersatz Position 1')).toHaveValue('0')
  // Path 2: the select is locked, so no German rate can be chosen back.
  await expect(page.getByLabel('Steuersatz Position 1')).toBeDisabled()
  // Path 3: a newly added line starts at 0 %, not at the Stammdaten default.
  await page.getByRole('button', { name: '+ Position hinzufügen' }).click()
  await expect(page.getByLabel('Steuersatz Position 2')).toHaveValue('0')

  // Without a customer VAT ID the invoice is refused before anything is claimed.
  await page.getByRole('button', { name: 'Drucken / PDF' }).click()
  await expect(page.getByText('Reverse Charge: USt-IdNr. des Kunden ist zwingend.')).toBeVisible()

  // A German customer is a domestic sale, not a reverse-charge case.
  await page.getByLabel('USt-IdNr. des Kunden').fill('DE464133329')
  await page.getByRole('button', { name: 'Drucken / PDF' }).click()
  await expect(page.getByText(/Reverse Charge gilt nicht für deutsche Kunden/)).toBeVisible()

  // Nor is a non-EU one.
  await page.getByLabel('USt-IdNr. des Kunden').fill('CH123456789')
  await page.getByRole('button', { name: 'Drucken / PDF' }).click()
  await expect(page.getByText(/CH ist kein EU-Mitgliedstaat/)).toBeVisible()

  // An Austrian customer is valid, and the note must print.
  await page.getByLabel('USt-IdNr. des Kunden').fill('ATU12345678')
  await page.emulateMedia({ media: 'print' })
  const sheet = await page.locator('.admin-sheet').innerText()
  expect(sheet).toContain('Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge)')
  // No German rate row may survive: "Nettobetrag 0 % USt." would read as though
  // a German zero rate applied.
  expect(sheet).not.toContain('Nettobetrag')
  expect(sheet).not.toContain('zzgl.')
  // Net equals gross, because no VAT is charged here.
  expect(sheet).toContain('161,00')
  await page.emulateMedia({ media: 'screen' })
})

test('an issued reverse-charge invoice appears in the EU sales report', async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => {}
  })
  await page.goto('/admin')
  await saveSender(page, 'E2E Sender ZM', { vatId: 'DE999999999' })
  await page.getByRole('button', { name: 'Rechnung erstellen' }).click()
  await fillInvoice(page, `Testkunde ZM ${RUN}`)
  await page.getByLabel('Reverse Charge (EU-Kunde)').check()
  await page.getByLabel('USt-IdNr. des Kunden').fill('ATU12345678')
  await page.getByLabel('Rechnungsnummer').fill(`E2E-RC-${RUN}`)

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Drucken / PDF' }).click()
  await expect(page.getByText(`Festgeschrieben als E2E-RC-${RUN}.`)).toBeVisible()

  await page.getByRole('button', { name: 'Meine Rechnungen' }).click()
  const report = page.locator('section', { hasText: 'Zusammenfassende Meldung' })
  const row = report.getByRole('row', { name: /ATU12345678/ })
  await expect(row).toBeVisible()
  await expect(row).toContainText('161,00')

  // Quarterly is the default view.
  //
  // The month comes from the invoice's OWN date field, not from the host clock:
  // `toISOString()` is UTC, and just after midnight in Germany on the 1st of a
  // month that is still the previous month — which would fail only on those few
  // hours, a few times a year.
  await page.getByRole('button', { name: 'Rechnung erstellen' }).click()
  const invoiceMonth = (await page.getByLabel('Rechnungsdatum').inputValue()).slice(0, 7)
  await page.getByRole('button', { name: 'Meine Rechnungen' }).click()
  const quarter = `${invoiceMonth.slice(0, 4)}-Q${Math.floor((Number(invoiceMonth.slice(5, 7)) - 1) / 3) + 1}`
  await expect(report.getByRole('button', { name: 'Quartalsweise' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await expect(row).toContainText(quarter)

  // The monthly view reports the same invoice under its own month, with the sum
  // unchanged — a quarter is exactly the sum of its months.
  await report.getByRole('button', { name: 'Monatlich' }).click()
  await expect(report.getByRole('button', { name: 'Monatlich' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  const monthlyRow = report.getByRole('row', { name: /ATU12345678/ })
  await expect(monthlyRow).toContainText(invoiceMonth)
  await expect(monthlyRow).toContainText('161,00')
  await expect(monthlyRow).not.toContainText(quarter)
})

test('the export downloads as a file and refuses an unauthenticated request', async ({ page }) => {
  await page.goto('/admin')
  const origin = new URL(page.url()).origin

  // page.request carries the page's cookies, so this is the authenticated case.
  const backupResponse = await page.request.get('/admin/export?format=json')
  expect(backupResponse.status()).toBe(200)
  expect(backupResponse.headers()['content-disposition']).toContain('silicortex-backup_')
  // A snapshot of live data behind a login must never be cached.
  expect(backupResponse.headers()['cache-control']).toContain('no-store')
  const backup = await backupResponse.json()
  expect(backup.app).toBe('silicortex-invoices')
  expect(Array.isArray(backup.invoices)).toBe(true)
  expect(backup.masterData).toBeTruthy()

  const csvResponse = await page.request.get('/admin/export?format=csv')
  expect(csvResponse.headers()['content-type']).toContain('text/csv')
  expect(csvResponse.headers()['content-disposition']).toContain('.csv')
  expect(await csvResponse.text()).toContain('Rechnungsnummer;')

  // A context with no session cookie. This route hands out the IBAN and every tax
  // identifier in one response, so the check is not optional.
  //
  // storageState is passed EXPLICITLY empty: without it, newContext inherits the
  // project's saved signed-in state, the "anonymous" request arrives
  // authenticated, and the test passes while proving nothing.
  const anonymous = await playwrightRequest.newContext({
    baseURL: origin,
    storageState: { cookies: [], origins: [] },
  })
  try {
    const denied = await anonymous.get('/admin/export?format=json', { maxRedirects: 0 })
    expect(denied.status(), 'unauthenticated export must redirect, not serve').toBe(307)
    // The status alone is not the guarantee — the body is.
    const body = await denied.text()
    expect(body).not.toContain('silicortex-invoices')
    expect(body).not.toContain('iban')
  } finally {
    await anonymous.dispose()
  }
})

test('a number can be recorded as used with no invoice behind it', async ({ page }) => {
  await page.goto('/admin')
  await page.getByRole('button', { name: 'Meine Rechnungen' }).click()

  const burned = `E2E-BURN-${RUN}`
  await page.getByLabel('Zu verbrauchende Nummer').fill(burned)
  await page.getByLabel('Grund').fill('Entwurf verworfen')
  await page.getByRole('button', { name: 'Nummer verbrauchen' }).click()

  await expect(page.getByText(`Nummer ${burned} als vergeben vermerkt.`)).toBeVisible()
  // The point of the log: the gap is visible AND carries its reason.
  await expect(
    page.getByRole('row', { name: new RegExp(burned) }).getByText('Ohne Rechnung — Entwurf verworfen')
  ).toBeVisible()

  // And it can never be handed out again.
  await page.getByLabel('Zu verbrauchende Nummer').fill(burned)
  await page.getByLabel('Grund').fill('nochmal')
  await page.getByRole('button', { name: 'Nummer verbrauchen' }).click()
  await expect(page.getByText(`Die Nummer ${burned} ist bereits vergeben.`)).toBeVisible()
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
