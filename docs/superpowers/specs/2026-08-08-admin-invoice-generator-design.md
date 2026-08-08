# Admin Area + German Invoice Generator — Design

**Date:** 2026-08-08
**Scope:** A single-user private area at `/admin` containing a § 14 UStG compliant invoice generator, backed by Postgres
**Stack additions:** `jose` (session JWT), `@neondatabase/serverless` (Postgres), `@playwright/test` (E2E)

> **This document contains no master data values.** Tax numbers, IBAN, personal tax ID, social-security
> number and birth date are entered once through the Stammdaten UI and live only in the database.
> This repository is public — no such value may ever be committed, in code, in a spec, or in a test fixture.

---

## Section 1: Scope

**In scope**

- Single-user login (owner only), no user table, no auth provider
- `/admin` area with three tabs: *Rechnung erstellen*, *Meine Rechnungen*, *Stammdaten*
- Durable storage of master data and invoices in Neon Postgres
- German invoice sheet with per-VAT-rate totals, printable to PDF via the browser print dialog

**Non-goals** (explicitly excluded)

| Excluded | Reason |
|----------|--------|
| Second user, roles, registration, password reset flow | Exactly one user; a secret in an env var is sufficient |
| JSON export / import, in-memory archive | Artefact-only constraints; Postgres replaces them |
| Kleinunternehmer toggle, "keine USt. nach § 19 UStG" notice | Owner has waived § 19 (binding to 2030) and is under standard taxation |
| Server-side PDF rendering service | Browser print produces the same document with zero infrastructure |
| Certified GoBD archiving (journal, audit trail, tamper-proof storage) | Own product category. We provide durable storage, unique numbering and locked issued invoices — not certification |
| Saved customer list / CRM | The archive's *Kopie* action covers repeat customers (YAGNI) |
| i18n of the admin UI | Invoice terminology is legally German; strings are hard-coded German and are **not** added to `lib/dictionaries` |

**UI language:** German. **Code, comments, commit messages:** English.

**Tax disclaimer:** the mandatory-field set and the VAT arithmetic implement the owner's stated
requirements. One printed test invoice should be reviewed by the owner's Steuerberater before the
first real invoice is sent.

---

## Section 2: Route structure

The current root layout wraps every route in navbar, footer, `ThemeProvider`, `LangProvider`,
`SpeedInsights` and `Analytics`. The admin area must not inherit any of that, so the site chrome moves
down one level into a route group.

```
app/
  layout.tsx                     html/body, font variables, metadataBase ONLY
  (site)/
    layout.tsx                   navbar, footer, ThemeProvider, LangProvider, SpeedInsights, Analytics
    page.tsx                     ← moved from app/page.tsx
    contact/ experience/ network/ work/   ← moved unchanged
  admin/
    layout.tsx                   minimal light-only shell, robots: { index: false, follow: false }
    admin.css                    admin-scoped styles incl. @media print
    login/page.tsx               PUBLIC — login form
    (protected)/
      layout.tsx                 requireSession() gate
      page.tsx                   server component: loads master data + archive, renders <AdminApp>
      actions.ts                 Server Actions (every one calls requireSession() first)
```

`(site)` and `(protected)` are route groups — parentheses are stripped from URLs. **No public URL
changes**, therefore no SEO or link impact. `app/work/sales-dashboard/layout.tsx` moves with its page
and keeps working.

**Verification for this phase:** every existing route renders identically before any admin code is
written (`/`, `/contact`, `/experience`, `/network`, `/work`, `/work/sales-dashboard`).

---

## Section 3: Authentication

### Secrets (Vercel env vars, all three environments)

| Variable | Purpose |
|----------|---------|
| `ADMIN_PASSWORD` | The single password. Long and unique; never in git |
| `SESSION_SECRET` | ≥32 random bytes, HS256 signing key. Rotating it invalidates all sessions |
| `DATABASE_URL` | Provisioned by the Neon Marketplace integration |

The app must fail loudly at startup if `ADMIN_PASSWORD` or `SESSION_SECRET` is missing, rather than
silently accepting an empty password.

### Flow

1. `POST` via Server Action from `/admin/login`.
2. Compare with `crypto.timingSafeEqual` over equal-length SHA-256 digests of submitted and expected
   password — **not** `===`, which leaks length and prefix through timing.
3. On success: `jose` `SignJWT`, HS256, 7-day expiry, payload `{ sub: 'owner', iat, exp }` and nothing
   else. Set cookie `sc_admin_session`: `httpOnly`, `sameSite: 'lax'`, `path: '/'`,
   `secure: process.env.NODE_ENV === 'production'` (an unconditional `Secure` flag is a well-known
   time-sink on `http://localhost`), `expires` = token expiry.
4. On failure: record the attempt, generic message ("Anmeldung fehlgeschlagen"), no hint about which
   part was wrong.
5. Logout: Server Action deletes the cookie and redirects to `/admin/login`.
6. Visiting `/admin/login` while holding a valid session redirects to `/admin` — no staring at a login
   form you are already past.

`cookies()` must be awaited in Next 16.

### The security boundary

`lib/admin/session.ts` (marked `import 'server-only'`):

- `verifySession()` — reads and verifies the cookie, memoized with React `cache` so one render pass
  verifies once. Returns `null` when absent or invalid.
- `requireSession()` — calls `verifySession()`, `redirect('/admin/login')` when null.

`requireSession()` is called in `app/admin/(protected)/layout.tsx` **and as the first statement of
every Server Action**. A layout gate alone does not protect Server Actions — they are independently
addressable POST endpoints.

**No `proxy.ts`.** Per the shipped Next 16 docs, request-level interception is an *optimistic* check
only and "should not be your only line of defense"; every admin page reads cookies and is therefore
dynamic, so nothing is statically exposed. Adding one would look like protection without being it.

### Brute-force protection

`login_attempts` table (an in-memory counter is unreliable across serverless instances):

- Every attempt inserts a row with the client IP (`x-forwarded-for`, first entry) and outcome.
- ≥8 failures from one IP within 15 minutes → reject further attempts from that IP for 15 minutes.
- Fixed ~300 ms delay on every attempt, success or failure.
- Rows older than 24 h are pruned on each insert (IP addresses are personal data — no long retention).

---

## Section 4: Data model

```sql
-- Master data: exactly one row, enforced by the check constraint
create table master_data (
  id                    smallint primary key default 1 check (id = 1),
  -- invoice-visible
  name                  text not null default '',
  status_label          text not null default '',   -- "Freiberufler"
  activity              text not null default '',
  street                text not null default '',
  zip_city              text not null default '',
  country               text not null default '',
  phone                 text not null default '',
  email                 text not null default '',
  website               text not null default '',
  tax_number            text not null default '',   -- Steuernummer
  vat_id                text not null default '',   -- USt-IdNr., § 27a UStG
  tax_office            text not null default '',   -- Finanzamt
  default_vat_rate      numeric(4,1) not null default 19,
  payment_terms_days    integer not null default 14,
  account_holder        text not null default '',
  iban                  text not null default '',
  bank_name             text not null default '',
  bic                   text not null default '',
  -- internal only: "Nur zur Ablage — erscheint nie auf einer Rechnung"
  business_id           text not null default '',   -- Wirtschafts-IdNr.
  personal_tax_id       text not null default '',   -- Steuer-IdNr.
  social_security_no    text not null default '',   -- Sozialversicherungsnummer
  birth_date            text not null default '',
  activity_start        text not null default '',
  vat_scheme            text not null default '',   -- Umsatzsteuer-Regelung
  taxation_type         text not null default '',   -- Besteuerungsart
  profit_determination  text not null default '',   -- Gewinnermittlung
  updated_at            timestamptz not null default now()
);

create table invoices (
  id               uuid primary key default gen_random_uuid(),
  status           text not null default 'draft' check (status in ('draft','issued')),
  invoice_number   text unique,                  -- NULL while draft; assigned at festschreiben
  proposed_number  text not null default '',     -- the draft's editable field, no constraint
  invoice_date     date not null,
  service_date     text not null,          -- free text: a date or a period ("Juli 2026")
  customer_number  text not null default '',
  customer_name    text not null,
  customer_street  text not null default '',
  customer_zip_city text not null default '',
  customer_country text not null default '',
  customer_vat_id  text not null default '',
  payment_terms    text not null default '',
  net_total        numeric(12,2) not null default 0,
  vat_total        numeric(12,2) not null default 0,
  gross_total      numeric(12,2) not null default 0,
  vat_breakdown    jsonb not null default '[]',  -- [{ rate, net, vat }] per rate group, frozen
  sender_snapshot  jsonb,                        -- invoice-visible master data at issue time; null while draft
  issued_at        timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references invoices(id) on delete cascade,
  line_no     integer not null,             -- not "position": a Postgres function name
  description text not null default '',
  quantity    numeric(12,3) not null default 1,
  unit        text not null default '',
  unit_price  numeric(12,2) not null default 0,
  vat_rate    numeric(4,1) not null default 19,
  net_amount  numeric(12,2) not null default 0,
  unique (invoice_id, line_no)
);

create table login_attempts (
  id           bigserial primary key,
  ip           text not null,
  success      boolean not null default false,
  attempted_at timestamptz not null default now()
);
create index login_attempts_ip_time_idx on login_attempts (ip, attempted_at desc);
```

**Money is `numeric`, never floating point.** The Neon driver returns `numeric` columns as **strings**,
so every read parses explicitly — no arithmetic on a driver-returned value without conversion.

### `sender_snapshot` — why it exists

An issued invoice must keep printing with the address, tax numbers and bank details that were on it
when it was sent. Editing master data next year must not retroactively alter last year's invoices, so
issuing freezes a copy. **Only invoice-visible fields are copied.** The eight internal fields are never
part of the snapshot.

### Draft vs. issued

| Status | Edit | Overwrite on save | Delete |
|--------|------|-------------------|--------|
| `draft` | yes | yes | yes (with confirmation) |
| `issued` | no | no | no |

**A draft does not own an invoice number.** If it did, the gap would return: draft A takes `2026-002`,
draft B takes `2026-003` and is issued, then A is deleted — and `2026-002` is missing forever. So
`invoice_number` is `NULL` while a draft; the number the owner sees and can edit lives in
`proposed_number`, which carries no constraint. The number is claimed in the festschreiben transaction,
where uniqueness is checked and a collision produces a readable German error. Two drafts may therefore
show the same proposed number; only the first one issued keeps it.

**Exactly when a draft becomes issued:** the *Drucken / PDF* button validates first (Section 7). If the
invoice is still a draft, it then asks for confirmation — *"Rechnung festschreiben? Danach ist sie nicht
mehr änderbar."* On confirm, one transaction sets `status = 'issued'`, `issued_at` and
`sender_snapshot`, and the print dialog opens afterwards. Cancelling leaves the draft untouched and does
not print. Printing an already-issued invoice prints immediately with no further prompt. A correction to an issued invoice
is a **new document** (Storno / Korrekturrechnung), never an edit — this is what makes the numbering
gapless claim true rather than aspirational.

Enforced in two places: the Server Action rejects mutations of issued rows, **and** a Postgres trigger
raises on `UPDATE`/`DELETE` of a row whose stored `status` is `'issued'`. Code alone would leave the
guarantee to a future refactor.

---

## Section 5: Invoice arithmetic

### `lib/invoice/parseNum.ts`

German decimal input is the single most common bug in tools of this kind. `<input type="number">` is
**forbidden** for quantity and price: it accepts only `.` as a decimal separator, so typing `80,50`
makes `.value` return an empty string and the price silently becomes 0.

Instead: `<input type="text" inputmode="decimal">` with a **German-first** parser:

| Input shape | Rule | Example |
|-------------|------|---------|
| Comma present | A comma is **always** the decimal separator | `0,005` → 0.005, `80,505` → 80.505 |
| Lone dot grouping exactly 3 digits, leading group not starting with `0` | Thousands separator | `1.234` → 1234, `1.234.567` → 1234567 |
| Any other lone dot | Decimal point | `80.50` → 80.5, `0.005` → 0.005 |
| Both present | Whichever appears **last** is the decimal separator | `1.234,56` → 1234.56, `1,234.56` → 1234.56 |
| Unexpected characters, or two commas | Rejected as `0` — never silently reinterpreted | `8O,50` → 0, `80,50,60` → 0 |

Currency noise (`€`, `$`, `EUR`, whitespace) is stripped only at the start or end of the input.

This replaces the original artefact rule ("1–2 digits after a comma is decimal, 3 digits is thousands"),
which was verified to produce three silent money errors: `1.234` became 1.23 €, quantity `0,005` became
5 (a 1000× error, and inconsistent with `formatQuantity`, which prints three decimals), and `8O,50`
with a letter O became 8.50 € instead of being rejected. All nine of the originally specified cases
still hold under the new rule.

Required behaviour, each a unit test:

| Input | Result | | Input | Result |
|-------|--------|-|-------|--------|
| `80` | 80 | | `1,234.56` | 1234.56 |
| `80,50` | 80.5 | | `1,5` | 1.5 |
| `80.50` | 80.5 | | `95 €` | 95 |
| `1.234,56` | 1234.56 | | `` (empty) | 0 |
| | | | `abc` | 0 |

On blur the field is rewritten in German formatting. All currency renders through
`toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` + `" €"`.

### `lib/invoice/totals.ts` — rounding, stated explicitly

1. Per line: `net = round2(quantity × unit_price)`.
2. Group lines by `vat_rate`.
3. Per group: `group_net = sum(line nets)`, `group_vat = round2(group_net × rate / 100)`.
4. `net_total = sum(group_net)`, `vat_total = sum(group_vat)`, `gross_total = net_total + vat_total`.

VAT is computed **per rate group, not per line**. An invoice mixing 19 % and 7 % shows a separate net
subtotal and VAT amount for each rate — § 14 UStG requires this. A 0 % group shows a net subtotal and
no VAT amount.

### `lib/invoice/numbering.ts`

Next number derives from the highest **issued** invoice number (drafts are ignored — they hold no
number): `/^(.*?)(\d+)$/` increments the trailing
digit block and `padStart` preserves its width, so `2026-001` → `2026-002` and `R-2026-099` →
`R-2026-100`. The archive sorts with `localeCompare(…, 'de', { numeric: true })` so `2026-010` follows
`2026-009`. Uniqueness is enforced by the `unique` constraint at festschreiben time; the Server Action
catches the violation and returns a readable German error instead of a 500. When no invoice has been
issued yet, the first proposed number is `<current year>-001`.

---

## Section 6: UI

Restrained and businesslike, light-only: light grey page, white ~840 px invoice sheet with a subtle
border and soft shadow, muted dark green `#1f5f4f` accent, system sans-serif. Editable fields read as
plain text and reveal a faint background tint on hover. Amounts right-aligned. No Framer Motion, no
dark mode, no marketing chrome — a white paper document and a theme toggle are a bad combination, and
print CSS gets harder for nothing.

| Component | Responsibility |
|-----------|----------------|
| `AdminApp` | Tab state, holds invoice + master data in React state |
| `EditableField` | One field: screen input **and** print-only span (Section 7) |
| `InvoiceSheet` | Sender block, `RECHNUNG` title, recipient, meta block, footer |
| `ItemsTable` | Rows, add/delete, renumbering, per-row VAT select |
| `TotalsBlock` | Per-rate groups, net total, emphasised gross total |
| `ArchiveTable` | List, summary strip, *Laden* / *Kopie* / `✕`, empty state |
| `MasterDataForm` | Grouped fields; internal group carries the `intern` badge |

**Archive actions by status.** *Laden* opens a draft for editing, and opens an issued invoice
**read-only** for viewing and re-printing. *Kopie* always produces a new editable draft with the same
customer and line items, a fresh number and today's date. `✕` is offered **only for drafts**, with a
confirmation; on an issued row it is absent, not merely disabled-looking.

**Summary strip** (count, total net, total VAT, total gross) sums **issued invoices only** — a draft is
not revenue. Drafts appear in the table with a visible *Entwurf* marker and are counted separately.

There is no "reset master data to defaults" button. Defaults are now empty, so such a button would only
erase the owner's real data with nothing to restore — a footgun with no upside. Individual fields remain
freely editable.

Editing master data propagates to the invoice sheet immediately (sender block, bank details, footer)
because both read the same React state. Payment terms are pre-filled from `payment_terms_days`; once
manually edited, auto-overwriting stops (a `touched` flag).

Deleting the last remaining line item immediately creates a fresh empty one. Line numbers renumber
after every add or delete.

**Structural separation of internal fields:** master data is split into two objects, `invoiceVisible`
and `internal`. `InvoiceSheet` and the print path receive only `invoiceVisible`. The internal fields
cannot reach the invoice or the print output because they are never passed to the components that
render it — not merely hidden with CSS.

---

## Section 7: Print (deviates from the original artefact prompt)

The artefact handled print traps with `beforeprint`/`afterprint` DOM mutation. React knows the state at
render time, so the same problems are solved by rendering, which is simpler and testable:

**`EditableField` renders two children from one value** — an `<input>` (`@media print { display: none }`)
and a `<span>` (hidden on screen, shown in print). This resolves four traps uniformly:

| Trap | Resolution |
|------|-----------|
| `type="date"` prints in the browser's locale (`08/07/2026` — ambiguous on a German invoice) | Print span renders self-formatted `DD.MM.YYYY` |
| Empty optional fields print their grey placeholder text | Print span is empty; its wrapper is hidden via `:has()` when the value is empty |
| A long *Beschreibung* in an `<input>` does not wrap and is **clipped** on paper | Print span wraps (`white-space: pre-wrap`) — trap not present in the original prompt |
| The VAT `select` shows a dropdown arrow | Rendered as a print span; `appearance: none` as belt and braces |

Empty line-item rows (no description and price 0) get `data-empty="true"` from state; print CSS hides
them. Payment terms print as a wrapping span, not a clipped textarea.

`@media print` additionally hides the toolbar, tab bar, notices, the save bar, the *Position
hinzufügen* button and the delete column, printing only the invoice sheet, borderless, with
`@page { margin: 16mm 14mm; }`.

**Validation happens on the button, not in `beforeprint`** — a `beforeprint` handler cannot reliably
cancel a print. The *Drucken / PDF* button checks customer name, customer address, invoice number,
invoice date, service date, and at least one line item with a description and price > 0. On failure it
lists the missing fields in German and does not call `window.print()`. On a draft, validation is followed
by the festschreiben confirmation described in Section 4 before the dialog opens.

Because print state is pure render, Playwright tests it with `emulateMedia({ media: 'print' })` and
plain assertions — the prompt's `page.pdf()`/`beforeprint` timing gotcha does not arise.

---

## Section 8: Testing

**`node --test`** (built in, no dependency) for pure logic:

- `parseNum` — all nine cases in Section 5
- `totals` — a hand-verified mixed 19 % / 7 % invoice; a 0 % group; rounding at the 2-decimal boundary
- `numbering` — `2026-001` → `2026-002`, `R-2026-099` → `R-2026-100`, German numeric sort order

**Playwright** for flows:

- Unauthenticated `/admin` redirects to `/admin/login`; wrong password fails; correct password lands in the tool
- A Server Action called without a valid session cookie is rejected (the boundary, not just the redirect)
- Master-data edit appears in the invoice sheet immediately
- Two invoices archived → number increment, *Kopie*, summary strip totals
- An issued invoice cannot be edited or deleted
- Print view: German date, no placeholder text, empty line item hidden, long description not clipped

No test fixture may contain a real tax number, IBAN or personal identifier.

**Two setup facts to settle in Phase 4 / 6 rather than discover:**

- `node --test` strips types but does **not** resolve the `@/…` tsconfig path aliases. It therefore
  works only if `parseNum.ts`, `totals.ts` and `numbering.ts` stay dependency-free and the tests import
  them by relative path. Confirm on this Node version at the start of Phase 4; fall back to `vitest` if
  it does not hold.
- Playwright needs `npx playwright install chromium` and a running dev server, and the `/admin` tests
  need a real session. The session is obtained by logging in through the form in a setup project (using
  a dev-only `ADMIN_PASSWORD` from `.env.local`) and reusing the stored cookie — no test-only auth
  bypass is added to the app.

Every phase ends with `npm run build` and `npm run lint` clean, and the browser console free of errors.

---

## Section 9: Build order

| Phase | Deliverable | Done when |
|-------|-------------|-----------|
| 1 | Route-group split: root layout minimal, `(site)` holds the chrome | All existing routes render identically; build + lint clean |
| 2 | Login: session module, login page, logout, DAL, attempt limiting | `/admin` gated; wrong password rejected; auth tests pass |
| 3 | Neon provisioning (via the `vercel:marketplace` skill), schema, migration script, Stammdaten tab | Owner fills master data in the UI; it persists across a redeploy |
| 4 | Invoice editor: sheet, items table, totals, `parseNum` | Unit tests pass; a mixed-VAT invoice matches hand calculation |
| 5 | Archive: save, load, *Kopie*, delete, numbering, draft/issued locking | Archive tests pass; issued invoice is immutable |
| 6 | Print CSS, validation, Playwright suite | A printed test invoice is correct on paper |

Phase 3 requires the Vercel CLI (`npm i -g vercel`, `vercel login`, `vercel link`), which is not
currently installed.

---

## Section 10: Deviations from the original artefact prompt

| Prompt said | This design | Why |
|-------------|-------------|-----|
| Hard-code master data as defaults | Empty defaults; data typed once into the UI, stored in Postgres | The repository is **public**. Committing a personal tax ID, social-security number, birth date and IBAN would publish them permanently, including in git history |
| No `localStorage`; archive in memory; export/import JSON | Postgres | The artefact constraint does not apply to our own site. Real § 14 UStG invoices need durable, multi-device storage with database-enforced unique numbering |
| Notice that the archive is lost when the page closes | Removed | No longer true |
| Delete and overwrite archived invoices freely | Allowed for drafts; issued invoices are locked | Deleting an issued invoice creates a numbering gap and contradicts the reason for using a database |
| "Reset master data to defaults" button | Removed | With no hard-coded defaults it would only erase real data, restoring nothing |
| `beforeprint` / `afterprint` DOM mutation | Print-only spans rendered from state | Simpler, race-free, testable; also fixes input clipping, which the prompt did not cover |
| Cancel printing from `beforeprint` | Validate on the button | `beforeprint` cannot reliably cancel a print |
| Single self-contained HTML file | Next.js route group, server components, Server Actions | It now lives inside an existing Next 16 app behind a login |

Unchanged from the prompt: German UI, § 14 UStG mandatory fields, no Kleinunternehmer toggle and no
§ 19 notice, three-tab structure, `parseNum` semantics, per-rate VAT blocks, German number and currency
formatting, invoice-number increment logic, the restrained visual style, and the internal
"Nur zur Ablage" group that never reaches an invoice.

---

## Section 11: To verify during implementation

- The `<input>` print-clipping claim (Section 7) — confirm in a real browser before relying on it in
  the spec's justification; the print-span design is correct regardless.
- Neon's exact driver return types for `numeric` and `date` columns once provisioned.
- Whether `gen_random_uuid()` is available without an extension on the provisioned Postgres version
  (expected: yes on PG 13+).
