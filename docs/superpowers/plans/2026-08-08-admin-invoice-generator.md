# Admin Area + German Invoice Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a password-protected single-user area at `/admin` on silicortex.de containing a § 14 UStG compliant German invoice generator backed by Neon Postgres.

**Architecture:** The existing marketing chrome moves into a `(site)` route group so `/admin` inherits only a bare root layout. Authentication is one password in an env var, verified timing-safely, carried in a `jose`-signed httpOnly cookie; the security boundary is a memoized `requireSession()` called by the protected layout and by every Server Action. Invoice data lives in Neon Postgres, reached through thin repository modules; all money arithmetic lives in pure, unit-tested modules under `lib/invoice/`.

**Tech Stack:** Next.js 16.2.4 (App Router, Server Actions), React 19, TypeScript, Tailwind CSS v4, `jose`, `@neondatabase/serverless`, `node --test` (pure logic), `@playwright/test` (E2E).

**Spec:** `docs/superpowers/specs/2026-08-08-admin-invoice-generator-design.md` — read it before Task 1.

## Global Constraints

- **This repository is PUBLIC.** No tax number, IBAN, USt-IdNr, Steuer-IdNr, Sozialversicherungsnummer, birth date, password or connection string may appear in any committed file, including tests and fixtures. Master data is typed into the UI by the owner and lives only in the database.
- **Next.js 16 APIs, verified against `node_modules/next/dist/docs/`:** `cookies()` must be awaited. `middleware.ts` no longer exists — it is `proxy.ts`, and this plan deliberately does not use it. Post-mutation refresh is `refresh()` from `next/cache`.
- **`requireSession()` is the first statement of every Server Action.** Server Actions are POST endpoints reachable directly; a layout gate does not protect them.
- **`requireSession()` must never sit inside a `try`/`catch`.** `redirect()` works by throwing a `NEXT_REDIRECT` error, and the shipped Next docs warn it must be called outside `try`/`catch`. An action written as `try { await requireSession(); … } catch { return { ok: false } }` would swallow the redirect and **continue executing unauthenticated** — the gate would appear to work while protecting nothing. Every action in this plan therefore calls `requireSession()` as a bare first statement, with the `try` opening only afterwards. Do not "tidy" an action by wrapping the whole body.
- **Never `<input type="number">` for money or quantity.** German decimal input (`80,50`) is discarded by that control. Always `type="text" inputmode="decimal"` + `parseNum`.
- **Money is `numeric` in Postgres and never a float in arithmetic.** The Neon driver returns `numeric` columns as **strings** — every read parses explicitly. Verified against the live database: `quantity` came back as `"2.000"` and `unit_price` as `"80.50"`.
- **Every `date` column must be selected as `::text`.** Verified against the live database: the driver parses a `date` into a `Date` at **local** midnight, so a stored `2026-08-08` arrives as `2026-08-07T22:00:00.000Z` in CEST. Both obvious readings are wrong — `String(value).slice(0, 10)` gives `"Sat Aug 08"`, and `value.toISOString().slice(0, 10)` gives `"2026-08-07"`, one day early on a legally dated document. `select invoice_date::text` returns `"2026-08-08"` correctly. `timestamptz` columns (`created_at`, `issued_at`) may stay as `Date` objects; `jsonb` arrives already parsed.
- **VAT is computed per rate group, never per line:** round each line net to 2 decimals, group by rate, `round2(groupNet × rate / 100)`.
- **UI text is German. Code, comments, commit messages, test names are English.** Admin strings are hard-coded German and must NOT be added to `lib/dictionaries/`.
- **Admin is light-only.** No `next-themes`, no Framer Motion, no marketing navbar or footer under `/admin`.
- **Ordering note:** this plan swaps spec §9 phases 2 and 3. Login's attempt-limiting table requires the database, so Postgres is provisioned first.
- **`server-only` and bare-Node scripts.** Server modules are marked with `import 'server-only'` so a stray client import can never bundle database credentials into the browser. Next resolves that specifier through its own alias, but **bare Node throws by design** ("This module cannot be imported from a Client Component module"), which would break every verification script in this plan. Two consequences, both verified here: `server-only` is an explicit dependency in `package.json` (it is otherwise absent from `node_modules`, since Next uses a compiled copy), and every bare-Node command that imports a repository module runs with **`--conditions=react-server`**, which resolves the specifier to its empty stub. Do not "fix" a script by deleting the `server-only` import — the flag is the fix.
- Every task ends with `npm run build` and `npm run lint` clean unless the task says otherwise.

## File Structure

| File | Responsibility |
|------|----------------|
| `app/layout.tsx` | html/body, fonts, metadataBase only (trimmed) |
| `app/(site)/layout.tsx` | Marketing chrome: navbar, footer, Theme/Lang providers, Analytics |
| `app/(site)/**` | Existing public pages, moved unchanged |
| `app/admin/layout.tsx` | Bare admin shell, `robots: noindex`, imports `admin.css` |
| `app/admin/admin.css` | Admin-scoped styles incl. all `@media print` rules |
| `app/admin/login/page.tsx` | Public login form |
| `app/admin/login/actions.ts` | `loginAction` |
| `app/admin/(protected)/layout.tsx` | `requireSession()` gate + logout button |
| `app/admin/(protected)/page.tsx` | Server component: loads data, renders `<AdminApp>` |
| `app/admin/(protected)/actions.ts` | All authenticated Server Actions |
| `lib/admin/password.ts` | Timing-safe password comparison (pure) |
| `lib/admin/token.ts` | Sign/verify the session JWT (pure, no `next/headers`) |
| `lib/admin/session.ts` | Cookie read/write + `verifySession` / `requireSession` (server-only) |
| `lib/db/client.ts` | The single Neon SQL client |
| `lib/db/masterData.ts` | Master data load/save + types |
| `lib/db/invoices.ts` | Invoice load/list/save/delete/issue |
| `lib/db/loginAttempts.ts` | Attempt recording, lockout check, pruning |
| `lib/invoice/parseNum.ts` | German/English decimal parser (pure) |
| `lib/invoice/format.ts` | de-DE currency, number and date formatting (pure) |
| `lib/invoice/totals.ts` | Per-rate VAT arithmetic (pure) |
| `lib/invoice/numbering.ts` | Next number + German numeric ordering (pure) |
| `components/admin/AdminApp.tsx` | Tab shell, holds invoice + master data state |
| `components/admin/EditableField.tsx` | Screen input + print-only span |
| `components/admin/InvoiceSheet.tsx` | The white A4 sheet |
| `components/admin/ItemsTable.tsx` | Line items |
| `components/admin/TotalsBlock.tsx` | Per-rate totals |
| `components/admin/ArchiveTable.tsx` | Archive list + summary strip |
| `components/admin/MasterDataForm.tsx` | Stammdaten tabs |
| `db/schema.sql` | Schema, `-- @@`-delimited statements |
| `db/migrate.mjs` | Applies `schema.sql` statement by statement |
| `tests/e2e/*.spec.ts` | Playwright specs |
| `playwright.config.ts` | Playwright config incl. login setup project |

---

## Task 1: Move the marketing chrome into a `(site)` route group

**Files:**
- Create: `app/(site)/layout.tsx`
- Modify: `app/layout.tsx` (strip chrome down to html/body/fonts)
- Move (git mv, contents unchanged): `app/page.tsx`, `app/contact/`, `app/experience/`, `app/network/`, `app/work/` → `app/(site)/`

**Interfaces:**
- Consumes: nothing.
- Produces: `/admin/*` routes inherit only the bare root layout. All public URLs unchanged.

- [ ] **Step 1: Create the route group and move the public pages**

```bash
mkdir -p "app/(site)"
git mv app/page.tsx "app/(site)/page.tsx"
git mv app/contact "app/(site)/contact"
git mv app/experience "app/(site)/experience"
git mv app/network "app/(site)/network"
git mv app/work "app/(site)/work"
```

`app/globals.css`, `app/favicon.ico` and `app/layout.tsx` stay at the root.

- [ ] **Step 2: Create `app/(site)/layout.tsx` with the chrome moved out of the root layout**

```tsx
import { LangProvider } from "@/components/providers/LangProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { NavbarClient } from "@/components/NavbarClient"
import { siteConfig } from "@/lib/siteConfig"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ThemeProvider>
        <LangProvider>
          <NavbarClient />
          {children}
          <footer className="border-t border-black/5 bg-white px-6 py-8 text-center dark:border-white/5 dark:bg-slate-950">
            <p className="mb-1 text-xs text-slate-400 dark:text-slate-600">
              {siteConfig.name} — {siteConfig.slogan}
            </p>
            <p className="text-xs text-slate-300 dark:text-slate-700">
              © 2026 {siteConfig.name}. All rights reserved.
            </p>
          </footer>
        </LangProvider>
      </ThemeProvider>
      <SpeedInsights />
      <Analytics />
    </>
  )
}
```

- [ ] **Step 3: Trim `app/layout.tsx` to html/body/fonts only**

```tsx
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { siteConfig } from "@/lib/siteConfig"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.slogan,
  metadataBase: new URL("https://silicortex.com"),
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full text-slate-900 dark:text-white">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Verify the build and that every public route still renders**

```bash
npm run build && npm run lint
```

Expected: build succeeds and the route list shows `/`, `/contact`, `/experience`, `/network`, `/work`, `/work/sales-dashboard` — **without** `(site)` appearing in any path.

```bash
npm run dev
```

Open each of the six routes. Confirm the navbar, footer, dark-mode toggle and language switch behave exactly as before. This is the whole point of the task: no visible change.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move marketing chrome into a (site) route group

Prepares for an /admin area that must not inherit the navbar, footer,
theme provider or analytics. Route group parentheses keep all public
URLs unchanged."
```

---

## Task 2: Provision Neon Postgres, schema and SQL client

**Files:**
- Create: `db/schema.sql`, `db/migrate.mjs`, `lib/db/client.ts`
- Modify: `package.json` (add `@neondatabase/serverless`, `db:migrate` script), `.gitignore` (verify `.env*.local` is ignored)

**Interfaces:**
- Consumes: nothing.
- Produces: `sql` — the tagged-template Neon client, imported by every repository module: `import { sql } from '@/lib/db/client'`.

- [ ] **Step 1: Provision the database using the marketplace skill**

Invoke the `vercel:marketplace` skill and follow it to provision **Neon Postgres** for this project. Do not hand-roll a provider SDK and do not sign up for anything outside the Vercel Marketplace flow.

Prerequisite (the user runs this; the Vercel CLI is not installed):

```bash
npm i -g vercel && vercel login && vercel link
```

Then pull the connection string into a local, gitignored env file:

```bash
vercel env pull .env.local
```

- [ ] **Step 2: Verify `.env.local` can never be committed**

```bash
grep -nE "^\.env" .gitignore
git check-ignore -v .env.local
```

Expected: `git check-ignore` prints a matching `.gitignore` rule. If it prints nothing, add `.env*.local` to `.gitignore` and re-run before continuing. **Do not proceed while `.env.local` is committable.**

- [ ] **Step 3: Install the driver**

```bash
npm install @neondatabase/serverless
```

- [ ] **Step 4: Write `db/schema.sql`**

Statements are separated by a line containing exactly `-- @@` because the HTTP driver runs one statement per call and a naive `;` split would break the `$$`-quoted trigger body.

```sql
create table if not exists master_data (
  id                    smallint primary key default 1 check (id = 1),
  name                  text not null default '',
  status_label          text not null default '',
  activity              text not null default '',
  street                text not null default '',
  zip_city              text not null default '',
  country               text not null default '',
  phone                 text not null default '',
  email                 text not null default '',
  website               text not null default '',
  tax_number            text not null default '',
  vat_id                text not null default '',
  tax_office            text not null default '',
  default_vat_rate      numeric(4,1) not null default 19,
  payment_terms_days    integer not null default 14,
  account_holder        text not null default '',
  iban                  text not null default '',
  bank_name             text not null default '',
  bic                   text not null default '',
  business_id           text not null default '',
  personal_tax_id       text not null default '',
  social_security_no    text not null default '',
  birth_date            text not null default '',
  activity_start        text not null default '',
  vat_scheme            text not null default '',
  taxation_type         text not null default '',
  profit_determination  text not null default '',
  updated_at            timestamptz not null default now()
)
-- @@
insert into master_data (id) values (1) on conflict (id) do nothing
-- @@
create table if not exists invoices (
  id                uuid primary key default gen_random_uuid(),
  status            text not null default 'draft' check (status in ('draft','issued')),
  invoice_number    text unique,
  proposed_number   text not null default '',
  invoice_date      date not null,
  service_date      text not null default '',
  customer_number   text not null default '',
  customer_name     text not null default '',
  customer_street   text not null default '',
  customer_zip_city text not null default '',
  customer_country  text not null default '',
  customer_vat_id   text not null default '',
  payment_terms     text not null default '',
  net_total         numeric(12,2) not null default 0,
  vat_total         numeric(12,2) not null default 0,
  gross_total       numeric(12,2) not null default 0,
  vat_breakdown     jsonb not null default '[]',
  sender_snapshot   jsonb,
  issued_at         timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
)
-- @@
create table if not exists invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references invoices(id) on delete cascade,
  line_no     integer not null,
  description text not null default '',
  quantity    numeric(12,3) not null default 1,
  unit        text not null default '',
  unit_price  numeric(12,2) not null default 0,
  vat_rate    numeric(4,1) not null default 19,
  net_amount  numeric(12,2) not null default 0,
  unique (invoice_id, line_no)
)
-- @@
create table if not exists login_attempts (
  id           bigserial primary key,
  ip           text not null,
  success      boolean not null default false,
  attempted_at timestamptz not null default now()
)
-- @@
create index if not exists login_attempts_ip_time_idx
  on login_attempts (ip, attempted_at desc)
-- @@
create or replace function forbid_issued_invoice_changes() returns trigger as $$
begin
  if old.status = 'issued' then
    raise exception 'invoice % is issued and immutable', old.id;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$ language plpgsql
-- @@
drop trigger if exists invoices_immutable_when_issued on invoices
-- @@
create trigger invoices_immutable_when_issued
  before update or delete on invoices
  for each row execute function forbid_issued_invoice_changes()
```

**Note on the trigger:** it blocks *all* updates to an issued row, so the issuing statement itself must be the one that flips `status` from `'draft'` to `'issued'` (`OLD.status` is still `'draft'` at that moment, so it passes). Any later edit fails at the database level.

- [ ] **Step 5: Write `db/migrate.mjs`**

```js
// Applies db/schema.sql to the database in DATABASE_URL.
// Statements are separated by a line containing exactly "-- @@" because the
// Neon HTTP driver executes one statement per call.
import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set. Run: vercel env pull .env.local')
  process.exit(1)
}

const sql = neon(url)
const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8')
const statements = schema
  .split(/^-- @@$/m)
  .map((s) => s.trim())
  .filter(Boolean)

for (const [i, statement] of statements.entries()) {
  const label = statement.split('\n')[0].slice(0, 60)
  try {
    await sql.query(statement)
    console.log(`ok   ${i + 1}/${statements.length}  ${label}`)
  } catch (error) {
    console.error(`FAIL ${i + 1}/${statements.length}  ${label}`)
    console.error(error)
    process.exit(1)
  }
}

console.log('schema applied')
```

- [ ] **Step 6: Add the migrate script to `package.json`**

```json
"db:migrate": "node --env-file=.env.local db/migrate.mjs"
```

- [ ] **Step 7: Run the migration**

```bash
npm run db:migrate
```

Expected: one `ok` line per statement, then `schema applied`. Re-run it once — it must be idempotent (`if not exists` / `on conflict do nothing` / `create or replace`).

- [ ] **Step 8: Write `lib/db/client.ts`**

```ts
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
```

- [ ] **Step 9: Smoke-test the client against the real database**

```bash
node --env-file=.env.local --conditions=react-server --experimental-strip-types -e "
const { sql } = await import('./lib/db/client.ts');
const rows = await sql\`select id, name from master_data\`;
console.log(rows);
const t = await sql\`select table_name from information_schema.tables where table_schema='public' order by 1\`;
console.log(t.map(r => r.table_name).join(', '));
"
```

Expected: one `master_data` row with `id: 1` and an empty `name`, and the table list `invoice_items, invoices, login_attempts, master_data`.

- [ ] **Step 10: Commit**

```bash
git add db/ lib/db/client.ts package.json package-lock.json .gitignore
git commit -m "feat(db): add Neon Postgres schema, migration runner and SQL client

Schema covers master data (single row), invoices, invoice items and
login attempts. A trigger makes issued invoices immutable at the
database level, not only in application code."
```

---

## Task 3: Timing-safe password comparison + test infrastructure

**Files:**
- Create: `lib/admin/password.ts`, `lib/admin/password.test.ts`
- Modify: `tsconfig.json` (`allowImportingTsExtensions`), `package.json` (`test` script)

**Interfaces:**
- Consumes: nothing.
- Produces: `passwordsMatch(input: string, expected: string): boolean`.

**Why the tsconfig change:** Node's type stripping resolves only explicit `.ts` specifiers (verified on Node v22.16.0 — `./m`, `./m.js` and directory globs all fail), and TypeScript rejects `.ts` import paths unless `allowImportingTsExtensions` is on. This combination is verified to work with `noEmit: true`.

- [ ] **Step 1: Enable `.ts` import specifiers**

Add to `compilerOptions` in `tsconfig.json`:

```json
"allowImportingTsExtensions": true,
```

- [ ] **Step 2: Add the test script to `package.json`**

Test files are listed explicitly: `node --test` does not discover `.ts` files from a directory argument.

```json
"test": "node --experimental-strip-types --test lib/admin/password.test.ts lib/admin/token.test.ts lib/invoice/parseNum.test.ts lib/invoice/format.test.ts lib/invoice/totals.test.ts lib/invoice/numbering.test.ts"
```

Until Task 13 lands, run single files instead: `node --experimental-strip-types --test <file>`.

- [ ] **Step 3: Write the failing test**

`lib/admin/password.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { passwordsMatch } from './password.ts'

test('accepts the exact password', () => {
  assert.equal(passwordsMatch('correct horse battery', 'correct horse battery'), true)
})

test('rejects a wrong password of the same length', () => {
  assert.equal(passwordsMatch('correct horse batteryX', 'correct horse batteryY'), false)
})

test('rejects a wrong password of a different length', () => {
  assert.equal(passwordsMatch('short', 'correct horse battery'), false)
})

test('rejects an empty input', () => {
  assert.equal(passwordsMatch('', 'correct horse battery'), false)
})

test('rejects everything when the expected password is empty', () => {
  // Guards against a missing ADMIN_PASSWORD turning into "any password works".
  assert.equal(passwordsMatch('', ''), false)
  assert.equal(passwordsMatch('anything', ''), false)
})
```

- [ ] **Step 4: Run the test to verify it fails**

```bash
node --experimental-strip-types --test lib/admin/password.test.ts
```

Expected: FAIL — cannot find module `./password.ts`.

- [ ] **Step 5: Write `lib/admin/password.ts`**

```ts
import { createHash, timingSafeEqual } from 'node:crypto'

// Compares via fixed-length SHA-256 digests: timingSafeEqual throws on
// length mismatch, and comparing raw strings with === leaks length and
// matching prefix through timing.
export function passwordsMatch(input: string, expected: string): boolean {
  if (!expected) return false
  const a = createHash('sha256').update(input, 'utf8').digest()
  const b = createHash('sha256').update(expected, 'utf8').digest()
  return timingSafeEqual(a, b)
}
```

- [ ] **Step 6: Run the test to verify it passes**

```bash
node --experimental-strip-types --test lib/admin/password.test.ts
```

Expected: `# pass 5`, `# fail 0`.

- [ ] **Step 7: Verify the tsconfig change did not break the build**

```bash
npx tsc --noEmit -p tsconfig.json && npm run build && npm run lint
```

Expected: all clean. If `next build` rewrites `tsconfig.json` and drops `allowImportingTsExtensions`, re-add it and note that it must be re-checked after builds.

- [ ] **Step 8: Commit**

```bash
git add lib/admin/password.ts lib/admin/password.test.ts tsconfig.json package.json
git commit -m "feat(admin): add timing-safe password comparison

Also sets up node --test for pure TypeScript modules: type stripping
needs explicit .ts specifiers, which needs allowImportingTsExtensions."
```

---

## Task 4: Session token (sign / verify)

**Files:**
- Create: `lib/admin/token.ts`, `lib/admin/token.test.ts`
- Modify: `package.json` (add `jose`)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type SessionPayload = { sub: 'owner'; exp: number }`
  - `SESSION_MAX_AGE_SECONDS: number` (604800)
  - `signSessionToken(): Promise<string>`
  - `verifySessionToken(token: string): Promise<SessionPayload | null>`

`SESSION_SECRET` is read inside the functions, not at module scope, so tests can set it.

- [ ] **Step 1: Install `jose`**

```bash
npm install jose
```

- [ ] **Step 2: Write the failing test**

`lib/admin/token.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.SESSION_SECRET = 'test-secret-at-least-32-bytes-long!!'

const { signSessionToken, verifySessionToken, SESSION_MAX_AGE_SECONDS } =
  await import('./token.ts')

test('a freshly signed token verifies', async () => {
  const token = await signSessionToken()
  const payload = await verifySessionToken(token)
  assert.equal(payload?.sub, 'owner')
})

test('the token expires seven days out', async () => {
  const token = await signSessionToken()
  const payload = await verifySessionToken(token)
  const secondsFromNow = payload!.exp - Math.floor(Date.now() / 1000)
  assert.ok(Math.abs(secondsFromNow - SESSION_MAX_AGE_SECONDS) <= 5)
})

test('garbage is rejected', async () => {
  assert.equal(await verifySessionToken('not-a-token'), null)
  assert.equal(await verifySessionToken(''), null)
})

test('a token signed with a different secret is rejected', async () => {
  const token = await signSessionToken()
  process.env.SESSION_SECRET = 'a-completely-different-secret-value!!'
  assert.equal(await verifySessionToken(token), null)
  process.env.SESSION_SECRET = 'test-secret-at-least-32-bytes-long!!'
})

test('an unsigned "alg: none" token is rejected', async () => {
  // Classic JWT downgrade attack.
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify({ sub: 'owner', exp: 9999999999 })).toString('base64url')
  assert.equal(await verifySessionToken(`${header}.${body}.`), null)
})
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
node --experimental-strip-types --test lib/admin/token.test.ts
```

Expected: FAIL — cannot find module `./token.ts`.

- [ ] **Step 4: Write `lib/admin/token.ts`**

```ts
import { SignJWT, jwtVerify } from 'jose'

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export type SessionPayload = { sub: 'owner'; exp: number }

// Read per call so a rotated secret takes effect immediately and tests
// can set the env var before importing nothing further.
function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function signSessionToken(): Promise<string> {
  return new SignJWT({ sub: 'owner' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey())
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ['HS256'], // pinned: rejects alg:none and algorithm confusion
    })
    if (payload.sub !== 'owner' || typeof payload.exp !== 'number') return null
    return { sub: 'owner', exp: payload.exp }
  } catch {
    return null
  }
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
node --experimental-strip-types --test lib/admin/token.test.ts
```

Expected: `# pass 5`, `# fail 0`.

- [ ] **Step 6: Commit**

```bash
git add lib/admin/token.ts lib/admin/token.test.ts package.json package-lock.json
git commit -m "feat(admin): add HS256 session token signing and verification

Algorithm is pinned so alg:none and confusion attacks are rejected."
```

---

## Task 5: Session cookie and the authorization boundary

**Files:**
- Create: `lib/admin/session.ts`

**Interfaces:**
- Consumes: `signSessionToken`, `verifySessionToken`, `SessionPayload`, `SESSION_MAX_AGE_SECONDS` from `lib/admin/token.ts`.
- Produces:
  - `SESSION_COOKIE = 'sc_admin_session'`
  - `verifySession(): Promise<SessionPayload | null>` (memoized per render)
  - `requireSession(): Promise<SessionPayload>` (redirects to `/admin/login`)
  - `createSessionCookie(): Promise<void>`
  - `clearSessionCookie(): Promise<void>`

Not unit-testable — it depends on the request scope. Task 17's Playwright specs cover it.

- [ ] **Step 1: Write `lib/admin/session.ts`**

```ts
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from './token.ts'

export const SESSION_COOKIE = 'sc_admin_session'

// Memoized for the render pass: many components may ask, one verification.
export const verifySession = cache(async (): Promise<SessionPayload | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  return token ? verifySessionToken(token) : null
})

// THE security boundary. Called by the protected layout AND as the first
// statement of every Server Action — actions are directly reachable POST
// endpoints, so a layout gate alone protects nothing.
export async function requireSession(): Promise<SessionPayload> {
  const session = await verifySession()
  if (!session) redirect('/admin/login')
  return session
}

export async function createSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, await signSessionToken(), {
    httpOnly: true,
    // Unconditional `secure` silently breaks http://localhost.
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export async function clearSessionCookie(): Promise<void> {
  ;(await cookies()).delete(SESSION_COOKIE)
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit -p tsconfig.json
```

Expected: clean. (No build yet — nothing imports it until Task 7.)

- [ ] **Step 3: Commit**

```bash
git add lib/admin/session.ts
git commit -m "feat(admin): add session cookie helpers and requireSession boundary"
```

---

## Task 6: Login attempt limiting

**Files:**
- Create: `lib/db/loginAttempts.ts`

**Interfaces:**
- Consumes: `sql` from `lib/db/client.ts`.
- Produces:
  - `MAX_FAILURES = 8`, `WINDOW_MINUTES = 15`
  - `isLockedOut(ip: string): Promise<boolean>`
  - `recordAttempt(ip: string, success: boolean): Promise<void>`

- [ ] **Step 1: Write `lib/db/loginAttempts.ts`**

```ts
import 'server-only'
import { sql } from './client.ts'

export const MAX_FAILURES = 8
export const WINDOW_MINUTES = 15

// Database-backed on purpose: an in-memory counter does not survive or
// coordinate across serverless instances.
export async function isLockedOut(ip: string): Promise<boolean> {
  const rows = await sql`
    select count(*)::int as failures
    from login_attempts
    where ip = ${ip}
      and success = false
      and attempted_at > now() - make_interval(mins => ${WINDOW_MINUTES})
  `
  return (rows[0]?.failures ?? 0) >= MAX_FAILURES
}

export async function recordAttempt(ip: string, success: boolean): Promise<void> {
  await sql`insert into login_attempts (ip, success) values (${ip}, ${success})`
  // IP addresses are personal data: keep them only as long as the lockout
  // window needs them, with a day of slack for inspection.
  await sql`delete from login_attempts where attempted_at < now() - interval '24 hours'`
}
```

- [ ] **Step 2: Verify against the real database**

```bash
node --env-file=.env.local --conditions=react-server --experimental-strip-types -e "
const { isLockedOut, recordAttempt, MAX_FAILURES } = await import('./lib/db/loginAttempts.ts');
const ip = 'test-' + process.pid;
console.log('locked before:', await isLockedOut(ip));
for (let i = 0; i < MAX_FAILURES; i++) await recordAttempt(ip, false);
console.log('locked after ' + MAX_FAILURES + ' failures:', await isLockedOut(ip));
const { sql } = await import('./lib/db/client.ts');
await sql\`delete from login_attempts where ip = \${ip}\`;
console.log('cleaned up');
"
```

Expected: `locked before: false`, `locked after 8 failures: true`, `cleaned up`.

- [ ] **Step 3: Commit**

```bash
git add lib/db/loginAttempts.ts
git commit -m "feat(admin): add database-backed login attempt limiting"
```

---

## Task 7: Admin shell, login page, logout

**Files:**
- Create: `app/admin/layout.tsx`, `app/admin/admin.css`, `app/admin/login/page.tsx`, `app/admin/login/actions.ts`, `app/admin/(protected)/layout.tsx`, `app/admin/(protected)/page.tsx`, `app/admin/(protected)/actions.ts`
- Modify: `.env.local` (add `ADMIN_PASSWORD`, `SESSION_SECRET`)

**Interfaces:**
- Consumes: `passwordsMatch`, `requireSession`, `verifySession`, `createSessionCookie`, `clearSessionCookie`, `isLockedOut`, `recordAttempt`.
- Produces:
  - `type LoginState = { error: string | null }`
  - `loginAction(prev: LoginState, formData: FormData): Promise<LoginState>`
  - `logoutAction(): Promise<void>` (exported from `app/admin/(protected)/actions.ts`)
  - A gated `/admin` page that later tasks fill with `<AdminApp>`.

- [ ] **Step 1: Add the local secrets**

Generate and append to `.env.local` (gitignored — verified in Task 2):

```bash
echo "ADMIN_PASSWORD=$(openssl rand -base64 24)" >> .env.local
echo "SESSION_SECRET=$(openssl rand -base64 48)" >> .env.local
grep -c "^ADMIN_PASSWORD=\|^SESSION_SECRET=" .env.local
```

Expected: `2`. Read the generated password out of `.env.local` for manual testing. Both variables must also be added to the Vercel project (all environments) before deploying — see Task 13.

- [ ] **Step 2: Write `app/admin/admin.css`**

```css
/* Admin-only styles. Light-only by design: the invoice is white paper. */
.admin-root {
  color-scheme: light;
  min-height: 100dvh;
  background: #f1f5f4;
  color: #111827;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}

.admin-accent {
  color: #1f5f4f;
}

.admin-sheet {
  width: 840px;
  max-width: 100%;
  background: #fff;
  border: 1px solid #e2e8e6;
  box-shadow: 0 1px 3px rgb(0 0 0 / 8%);
  padding: 48px 56px;
}

/* Fields read as plain text and only reveal themselves on hover. */
.admin-field {
  width: 100%;
  background: transparent;
  border: 0;
  padding: 2px 4px;
  font: inherit;
  color: inherit;
}
.admin-field:hover {
  background: #f3f6f5;
}
.admin-field:focus {
  outline: 2px solid #1f5f4f;
  outline-offset: 0;
  background: #fff;
}

/* Print twins: the span is the printed representation of every field. */
.admin-print-only {
  display: none;
  white-space: pre-wrap;
}

@media print {
  @page {
    margin: 16mm 14mm;
  }
  .admin-root {
    background: #fff;
  }
  .admin-no-print {
    display: none !important;
  }
  .admin-sheet {
    width: auto;
    border: 0;
    box-shadow: none;
    padding: 0;
  }
  .admin-field {
    display: none;
  }
  .admin-print-only {
    display: block;
  }
  /* Optional fields left empty must not print an empty label row. */
  .admin-optional:has(.admin-print-only:empty) {
    display: none;
  }
  /* Line items with no description and no price. */
  tr[data-empty='true'] {
    display: none;
  }
}
```

- [ ] **Step 3: Write `app/admin/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './admin.css'

export const metadata: Metadata = {
  title: 'Verwaltung',
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-root">{children}</div>
}
```

- [ ] **Step 4: Write `app/admin/login/actions.ts`**

```ts
'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { passwordsMatch } from '@/lib/admin/password.ts'
import { createSessionCookie } from '@/lib/admin/session.ts'
import { isLockedOut, recordAttempt, WINDOW_MINUTES } from '@/lib/db/loginAttempts.ts'

export type LoginState = { error: string | null }

async function clientIp(): Promise<string> {
  const forwarded = (await headers()).get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const ip = await clientIp()

  if (await isLockedOut(ip)) {
    return {
      error: `Zu viele Fehlversuche. Bitte in ${WINDOW_MINUTES} Minuten erneut versuchen.`,
    }
  }

  // Fixed cost on every attempt, success or failure.
  await new Promise((resolve) => setTimeout(resolve, 300))

  const password = String(formData.get('password') ?? '')
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) throw new Error('ADMIN_PASSWORD is not set')

  if (!passwordsMatch(password, expected)) {
    await recordAttempt(ip, false)
    // Deliberately generic: no hint about what was wrong.
    return { error: 'Anmeldung fehlgeschlagen.' }
  }

  await recordAttempt(ip, true)
  await createSessionCookie()
  redirect('/admin')
}
```

- [ ] **Step 5: Write `app/admin/login/page.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/admin/session.ts'
import { LoginForm } from './LoginForm.tsx'

export default async function LoginPage() {
  // Already signed in? Don't show a form the visitor is past.
  if (await verifySession()) redirect('/admin')
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <h1 className="admin-accent mb-1 text-xl font-semibold">Silicortex Verwaltung</h1>
      <p className="mb-6 text-sm text-gray-500">Bitte Passwort eingeben.</p>
      <LoginForm />
    </main>
  )
}
```

- [ ] **Step 6: Write `app/admin/login/LoginForm.tsx`**

```tsx
'use client'

import { useActionState } from 'react'
import { loginAction, type LoginState } from './actions.ts'

const initialState: LoginState = { error: null }

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState)

  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="password" className="text-sm font-medium">
        Passwort
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        className="rounded border border-gray-300 bg-white px-3 py-2"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[#1f5f4f] px-3 py-2 font-medium text-white disabled:opacity-60"
      >
        {pending ? 'Prüfe …' : 'Anmelden'}
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  )
}
```

- [ ] **Step 7: Write `app/admin/(protected)/actions.ts` with logout**

```ts
'use server'

import { redirect } from 'next/navigation'
import { clearSessionCookie, requireSession } from '@/lib/admin/session.ts'

export async function logoutAction(): Promise<void> {
  await requireSession()
  await clearSessionCookie()
  redirect('/admin/login')
}
```

- [ ] **Step 8: Write `app/admin/(protected)/layout.tsx` — the gate**

```tsx
import { requireSession } from '@/lib/admin/session.ts'
import { logoutAction } from './actions.ts'

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSession()

  return (
    <>
      <header className="admin-no-print flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <span className="admin-accent font-semibold">Silicortex Verwaltung</span>
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-gray-500 underline">
            Abmelden
          </button>
        </form>
      </header>
      {children}
    </>
  )
}
```

- [ ] **Step 9: Write a temporary `app/admin/(protected)/page.tsx`**

Replaced in Task 9 by the real tool.

```tsx
export default function AdminHomePage() {
  return <main className="p-6 text-sm text-gray-600">Angemeldet.</main>
}
```

- [ ] **Step 10: Verify the gate manually**

```bash
npm run dev
```

Check all five, in order:

1. `/admin` while signed out → redirected to `/admin/login`.
2. Wrong password → "Anmeldung fehlgeschlagen." and still on the login page.
3. Correct password (from `.env.local`) → `/admin` showing "Angemeldet." with no marketing navbar or footer.
4. `/admin/login` while signed in → redirected to `/admin`.
5. "Abmelden" → back to `/admin/login`; `/admin` is gated again.

Then confirm the marketing site is untouched: open `/` and toggle dark mode.

**Deferred check inherited from Task 19** — the admin area must not carry the marketing chrome. With the
dev server running:

```bash
curl -s http://localhost:3000/admin/login | grep -c "All rights reserved"
curl -s http://localhost:3000/admin/login | grep -c "<nav"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/login
```

Expected: `0`, `0`, and `200`. A `404` means the login route is not being matched; a `1` on either grep
means the bare root layout has been undone and `/admin` is inheriting the site chrome.

- [ ] **Step 11: Verify the build**

```bash
npm run build && npm run lint
```

Expected: clean, and the route list includes `/admin` and `/admin/login` (no `(protected)` segment in any URL).

- [ ] **Step 12: Commit**

```bash
git add app/admin tsconfig.json
git commit -m "feat(admin): add gated admin shell with password login and logout

requireSession() guards the protected layout and every Server Action.
No proxy.ts: per the Next 16 docs that would be an optimistic check
only, and every admin route is dynamic because it reads cookies."
```

---

## Task 8: Master data repository

**Files:**
- Create: `lib/db/masterData.ts`

**Interfaces:**
- Consumes: `sql` from `lib/db/client.ts`.
- Produces:

```ts
type MasterDataInvoiceVisible = {
  name: string; statusLabel: string; activity: string; street: string
  zipCity: string; country: string; phone: string; email: string; website: string
  taxNumber: string; vatId: string; taxOffice: string
  defaultVatRate: number; paymentTermsDays: number
  accountHolder: string; iban: string; bankName: string; bic: string
}
type MasterDataInternal = {
  businessId: string; personalTaxId: string; socialSecurityNo: string
  birthDate: string; activityStart: string; vatScheme: string
  taxationType: string; profitDetermination: string
}
type MasterData = { invoiceVisible: MasterDataInvoiceVisible; internal: MasterDataInternal }
loadMasterData(): Promise<MasterData>
saveMasterData(data: MasterData): Promise<void>
```

**The split is the security mechanism.** `invoiceVisible` and `internal` are separate objects so the invoice components can be given only the former. The eight internal fields cannot reach the invoice or the print output because they are never passed to the components that render it.

- [ ] **Step 1: Write `lib/db/masterData.ts`**

```ts
import 'server-only'
import { sql } from './client.ts'

export type MasterDataInvoiceVisible = {
  name: string
  statusLabel: string
  activity: string
  street: string
  zipCity: string
  country: string
  phone: string
  email: string
  website: string
  taxNumber: string
  vatId: string
  taxOffice: string
  defaultVatRate: number
  paymentTermsDays: number
  accountHolder: string
  iban: string
  bankName: string
  bic: string
}

// "Nur zur Ablage" — must never appear on an invoice or in print output.
export type MasterDataInternal = {
  businessId: string
  personalTaxId: string
  socialSecurityNo: string
  birthDate: string
  activityStart: string
  vatScheme: string
  taxationType: string
  profitDetermination: string
}

export type MasterData = {
  invoiceVisible: MasterDataInvoiceVisible
  internal: MasterDataInternal
}

export async function loadMasterData(): Promise<MasterData> {
  const rows = await sql`select * from master_data where id = 1`
  const r = rows[0]
  if (!r) throw new Error('master_data row 1 is missing — run npm run db:migrate')

  return {
    invoiceVisible: {
      name: r.name,
      statusLabel: r.status_label,
      activity: r.activity,
      street: r.street,
      zipCity: r.zip_city,
      country: r.country,
      phone: r.phone,
      email: r.email,
      website: r.website,
      taxNumber: r.tax_number,
      vatId: r.vat_id,
      taxOffice: r.tax_office,
      // numeric columns arrive as strings from the driver
      defaultVatRate: Number(r.default_vat_rate),
      paymentTermsDays: Number(r.payment_terms_days),
      accountHolder: r.account_holder,
      iban: r.iban,
      bankName: r.bank_name,
      bic: r.bic,
    },
    internal: {
      businessId: r.business_id,
      personalTaxId: r.personal_tax_id,
      socialSecurityNo: r.social_security_no,
      birthDate: r.birth_date,
      activityStart: r.activity_start,
      vatScheme: r.vat_scheme,
      taxationType: r.taxation_type,
      profitDetermination: r.profit_determination,
    },
  }
}

export async function saveMasterData(data: MasterData): Promise<void> {
  const v = data.invoiceVisible
  const i = data.internal
  await sql`
    update master_data set
      name = ${v.name},
      status_label = ${v.statusLabel},
      activity = ${v.activity},
      street = ${v.street},
      zip_city = ${v.zipCity},
      country = ${v.country},
      phone = ${v.phone},
      email = ${v.email},
      website = ${v.website},
      tax_number = ${v.taxNumber},
      vat_id = ${v.vatId},
      tax_office = ${v.taxOffice},
      default_vat_rate = ${v.defaultVatRate},
      payment_terms_days = ${v.paymentTermsDays},
      account_holder = ${v.accountHolder},
      iban = ${v.iban},
      bank_name = ${v.bankName},
      bic = ${v.bic},
      business_id = ${i.businessId},
      personal_tax_id = ${i.personalTaxId},
      social_security_no = ${i.socialSecurityNo},
      birth_date = ${i.birthDate},
      activity_start = ${i.activityStart},
      vat_scheme = ${i.vatScheme},
      taxation_type = ${i.taxationType},
      profit_determination = ${i.profitDetermination},
      updated_at = now()
    where id = 1
  `
}
```

- [ ] **Step 2: Verify round-tripping against the real database**

Uses obviously fake values — never real master data in a shell command that lands in shell history.

```bash
node --env-file=.env.local --conditions=react-server --experimental-strip-types -e "
const { loadMasterData, saveMasterData } = await import('./lib/db/masterData.ts');
const before = await loadMasterData();
await saveMasterData({
  invoiceVisible: { ...before.invoiceVisible, name: 'TEST Name', defaultVatRate: 7, paymentTermsDays: 30 },
  internal: { ...before.internal, birthDate: '01.01.1900' },
});
const after = await loadMasterData();
console.log(after.invoiceVisible.name, after.invoiceVisible.defaultVatRate, typeof after.invoiceVisible.defaultVatRate, after.internal.birthDate);
await saveMasterData(before);
console.log('restored:', (await loadMasterData()).invoiceVisible.name === before.invoiceVisible.name);
"
```

Expected: `TEST Name 7 number 01.01.1900` then `restored: true`. The `number` is the important part — it proves the numeric-as-string parse works.

- [ ] **Step 3: Commit**

```bash
git add lib/db/masterData.ts
git commit -m "feat(admin): add master data repository

Invoice-visible and internal fields are separate objects so internal
identifiers can never be passed to invoice or print components."
```

---

## Task 9: Stammdaten tab and the tabbed admin app

**Files:**
- Create: `components/admin/AdminApp.tsx`, `components/admin/MasterDataForm.tsx`
- Modify: `app/admin/(protected)/page.tsx` (replace the placeholder), `app/admin/(protected)/actions.ts` (add `saveMasterDataAction`)

**Interfaces:**
- Consumes: `loadMasterData`, `saveMasterData`, `MasterData`, `requireSession`.
- Produces:
  - `saveMasterDataAction(data: MasterData): Promise<{ ok: boolean; error?: string }>`
  - `<AdminApp masterData={...} />` — tab shell; Tasks 12–16 add the other two tabs.

- [ ] **Step 1: Add `saveMasterDataAction` to `app/admin/(protected)/actions.ts`**

Append to the existing file (which already holds `logoutAction`):

```ts
import { refresh } from 'next/cache'
import { saveMasterData, type MasterData } from '@/lib/db/masterData.ts'

export async function saveMasterDataAction(
  data: MasterData
): Promise<{ ok: boolean; error?: string }> {
  await requireSession() // first statement: actions are directly reachable POST endpoints
  try {
    await saveMasterData(data)
    refresh()
    return { ok: true }
  } catch (error) {
    console.error('saveMasterData failed', error)
    return { ok: false, error: 'Speichern fehlgeschlagen.' }
  }
}
```

- [ ] **Step 2: Write `components/admin/MasterDataForm.tsx`**

```tsx
'use client'

import { useState } from 'react'
import type {
  MasterData,
  MasterDataInternal,
  MasterDataInvoiceVisible,
} from '@/lib/db/masterData.ts'
import { saveMasterDataAction } from '@/app/admin/(protected)/actions.ts'
import { parseNum } from '@/lib/invoice/parseNum.ts'

type TextKey = Exclude<keyof MasterDataInvoiceVisible, 'defaultVatRate' | 'paymentTermsDays'>

const VISIBLE_FIELDS: { key: TextKey; label: string }[] = [
  { key: 'name', label: 'Name / Firmenbezeichnung' },
  { key: 'statusLabel', label: 'Status' },
  { key: 'activity', label: 'Tätigkeit' },
  { key: 'street', label: 'Straße und Hausnummer' },
  { key: 'zipCity', label: 'PLZ und Ort' },
  { key: 'country', label: 'Land' },
  { key: 'phone', label: 'Telefon' },
  { key: 'email', label: 'E-Mail' },
  { key: 'website', label: 'Website' },
  { key: 'taxNumber', label: 'Steuernummer' },
  { key: 'vatId', label: 'USt-IdNr. (§ 27a UStG)' },
  { key: 'taxOffice', label: 'Finanzamt' },
]

const BANK_FIELDS: { key: TextKey; label: string }[] = [
  { key: 'accountHolder', label: 'Kontoinhaber' },
  { key: 'iban', label: 'IBAN' },
  { key: 'bankName', label: 'Bank' },
  { key: 'bic', label: 'BIC' },
]

const INTERNAL_FIELDS: { key: keyof MasterDataInternal; label: string }[] = [
  { key: 'businessId', label: 'Wirtschafts-IdNr.' },
  { key: 'personalTaxId', label: 'Steuer-IdNr.' },
  { key: 'socialSecurityNo', label: 'Sozialversicherungsnummer' },
  { key: 'birthDate', label: 'Geburtsdatum' },
  { key: 'activityStart', label: 'Beginn der Tätigkeit' },
  { key: 'vatScheme', label: 'Umsatzsteuer-Regelung' },
  { key: 'taxationType', label: 'Besteuerungsart' },
  { key: 'profitDetermination', label: 'Gewinnermittlung' },
]

export function MasterDataForm({
  masterData,
  onChange,
}: {
  masterData: MasterData
  onChange: (next: MasterData) => void
}) {
  const [status, setStatus] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  // Raw text for the two numeric fields while they are being typed.
  const [rawVatRate, setRawVatRate] = useState<string | null>(null)
  const [rawTermsDays, setRawTermsDays] = useState<string | null>(null)

  function setVisible(key: TextKey, value: string) {
    onChange({
      ...masterData,
      invoiceVisible: { ...masterData.invoiceVisible, [key]: value },
    })
  }

  function setInternal(key: keyof MasterDataInternal, value: string) {
    onChange({ ...masterData, internal: { ...masterData.internal, [key]: value } })
  }

  async function save() {
    setSaving(true)
    setStatus(null)
    try {
      const result = await saveMasterDataAction(masterData)
      setStatus(result.ok ? 'Gespeichert.' : (result.error ?? 'Fehler.'))
    } catch {
      // A transport-level failure (dropped connection, function timeout) rejects
      // the action call itself. Without this catch the rejection is unhandled,
      // `saving` stays true, the button sits on "Speichere …" forever, and the
      // only escape — reloading — discards everything the owner just typed into
      // 26 fields.
      setStatus('Speichern fehlgeschlagen. Bitte Verbindung prüfen und erneut versuchen.')
    } finally {
      setSaving(false)
    }
  }

  const row = 'flex flex-col gap-1 sm:flex-row sm:items-center'
  const labelCls = 'w-72 shrink-0 text-sm text-gray-600'
  const inputCls = 'w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm'

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h2 className="admin-accent mb-6 text-lg font-semibold">Stammdaten</h2>

      <fieldset className="mb-8 flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold">Angaben auf der Rechnung</legend>
        {VISIBLE_FIELDS.map((f) => (
          <div key={f.key} className={row}>
            <label className={labelCls} htmlFor={`md-${f.key}`}>{f.label}</label>
            <input
              id={`md-${f.key}`}
              className={inputCls}
              value={masterData.invoiceVisible[f.key]}
              onChange={(e) => setVisible(f.key, e.target.value)}
            />
          </div>
        ))}
        <div className={row}>
          <label className={labelCls} htmlFor="md-vatRate">Standard-Steuersatz (%)</label>
          {/* Raw text is held while typing, so an in-progress "7," is not
              re-rendered as "7" — which would make a decimal rate impossible to
              enter one keystroke at a time. parseNum accepts both "7,7" and
              "7.7". The raw draft is dropped on blur. */}
          <input
            id="md-vatRate"
            className={inputCls}
            inputMode="decimal"
            value={rawVatRate ?? String(masterData.invoiceVisible.defaultVatRate)}
            onChange={(e) => {
              setRawVatRate(e.target.value)
              onChange({
                ...masterData,
                invoiceVisible: {
                  ...masterData.invoiceVisible,
                  defaultVatRate: parseNum(e.target.value),
                },
              })
            }}
            onBlur={() => setRawVatRate(null)}
          />
        </div>
        <div className={row}>
          <label className={labelCls} htmlFor="md-terms">Zahlungsziel (Tage)</label>
          <input
            id="md-terms"
            className={inputCls}
            inputMode="numeric"
            value={rawTermsDays ?? String(masterData.invoiceVisible.paymentTermsDays)}
            onChange={(e) => {
              setRawTermsDays(e.target.value)
              onChange({
                ...masterData,
                invoiceVisible: {
                  ...masterData.invoiceVisible,
                  // Days are whole numbers; never negative.
                  paymentTermsDays: Math.max(0, Math.trunc(parseNum(e.target.value))),
                },
              })
            }}
            onBlur={() => setRawTermsDays(null)}
          />
        </div>
      </fieldset>

      <fieldset className="mb-8 flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold">Bankverbindung</legend>
        {BANK_FIELDS.map((f) => (
          <div key={f.key} className={row}>
            <label className={labelCls} htmlFor={`md-${f.key}`}>{f.label}</label>
            <input
              id={`md-${f.key}`}
              className={inputCls}
              value={masterData.invoiceVisible[f.key]}
              onChange={(e) => setVisible(f.key, e.target.value)}
            />
          </div>
        ))}
      </fieldset>

      <fieldset className="mb-8 flex flex-col gap-3 rounded border border-amber-300 bg-amber-50 p-4">
        <legend className="flex items-center gap-2 text-sm font-semibold">
          Nur zur Ablage — erscheint nie auf einer Rechnung
          <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-900">
            intern
          </span>
        </legend>
        {INTERNAL_FIELDS.map((f) => (
          <div key={f.key} className={row}>
            <label className={labelCls} htmlFor={`md-${f.key}`}>{f.label}</label>
            <input
              id={`md-${f.key}`}
              className={inputCls}
              value={masterData.internal[f.key]}
              onChange={(e) => setInternal(f.key, e.target.value)}
            />
          </div>
        ))}
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded bg-[#1f5f4f] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? 'Speichere …' : 'Stammdaten speichern'}
        </button>
        {status && <span className="text-sm text-gray-600">{status}</span>}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write `components/admin/AdminApp.tsx`**

Tabs two and three are added in Tasks 13 and 15; the buttons exist now so the shell is complete.

```tsx
'use client'

import { useState } from 'react'
import type { MasterData } from '@/lib/db/masterData.ts'
import { MasterDataForm } from './MasterDataForm.tsx'

type Tab = 'invoice' | 'archive' | 'master'

const TABS: { id: Tab; label: string }[] = [
  { id: 'invoice', label: 'Rechnung erstellen' },
  { id: 'archive', label: 'Meine Rechnungen' },
  { id: 'master', label: 'Stammdaten' },
]

export function AdminApp({ masterData: initial }: { masterData: MasterData }) {
  const [tab, setTab] = useState<Tab>('invoice')
  const [masterData, setMasterData] = useState(initial)

  return (
    <>
      <nav className="admin-no-print flex gap-1 border-b border-gray-200 bg-white px-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={
              tab === t.id
                ? 'border-b-2 border-[#1f5f4f] px-4 py-3 text-sm font-semibold text-[#1f5f4f]'
                : 'px-4 py-3 text-sm text-gray-500'
            }
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'master' && (
        <MasterDataForm masterData={masterData} onChange={setMasterData} />
      )}
      {tab !== 'master' && (
        <p className="p-6 text-sm text-gray-500">Wird in einem späteren Schritt ergänzt.</p>
      )}
    </>
  )
}
```

- [ ] **Step 4: Replace `app/admin/(protected)/page.tsx`**

```tsx
import { requireSession } from '@/lib/admin/session.ts'
import { loadMasterData } from '@/lib/db/masterData.ts'
import { AdminApp } from '@/components/admin/AdminApp.tsx'

export default async function AdminHomePage() {
  await requireSession()
  const masterData = await loadMasterData()
  return <AdminApp masterData={masterData} />
}
```

- [ ] **Step 5: Verify manually**

```bash
npm run dev
```

1. Sign in, open **Stammdaten**. All three groups render; the internal group has the amber `intern` badge.
2. **Fill in your real master data now** and click "Stammdaten speichern" → "Gespeichert."
3. Reload the page. The values come back from the database.
4. Confirm `git status` is clean — your data went to Postgres, not to a file.

- [ ] **Step 6: Verify the build**

```bash
npm run build && npm run lint
```

- [ ] **Step 7: Commit**

```bash
git add app/admin components/admin
git commit -m "feat(admin): add tabbed admin app and Stammdaten editor

Master data is entered through the UI and stored in Postgres; nothing
sensitive is hard-coded, because this repository is public."
```

---

## Task 10: German number parsing and formatting (pure)

**Files:**
- Create: `lib/invoice/parseNum.ts`, `lib/invoice/parseNum.test.ts`, `lib/invoice/format.ts`, `lib/invoice/format.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `parseNum(value: unknown): number`
  - `formatAmount(value: number): string` — `"1.234,50"` (no currency symbol; for input fields)
  - `formatCurrency(value: number): string` — `"1.234,50 €"`
  - `formatQuantity(value: number): string` — up to 3 decimals, de-DE
  - `formatDateDe(iso: string): string` — `"2026-08-08"` → `"08.08.2026"`, `""` → `""`
  - `todayIso(): string`

- [ ] **Step 1: Write the failing test for `parseNum`**

`lib/invoice/parseNum.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseNum } from './parseNum.ts'

// The nine cases from the spec. This function is the single most common
// bug in German invoicing tools: type="number" discards "80,50" entirely.
const CASES: [string, number][] = [
  ['80', 80],
  ['80,50', 80.5],
  ['80.50', 80.5],
  ['1.234,56', 1234.56],
  ['1,234.56', 1234.56],
  ['1,5', 1.5],
  ['95 €', 95],
  ['', 0],
  ['abc', 0],
]

for (const [input, expected] of CASES) {
  test(`parses ${JSON.stringify(input)} as ${expected}`, () => {
    assert.equal(parseNum(input), expected)
  })
}

// A comma is always the decimal separator — never thousands.
test('treats any comma as the decimal separator', () => {
  assert.equal(parseNum('1,234'), 1.234)
  assert.equal(parseNum('0,005'), 0.005)
  assert.equal(parseNum('80,505'), 80.505)
})

// Regression: "1.234" previously parsed as 1.234, printing 1,23 € for an
// invoice line the owner meant as 1.234,00 € — a 1000x undercharge.
test('treats a lone dot grouping three digits as thousands', () => {
  assert.equal(parseNum('1.234'), 1234)
  assert.equal(parseNum('1.500'), 1500)
  assert.equal(parseNum('1.234.567'), 1234567)
})

// A grouping never starts with 0, so these stay decimals.
test('treats other lone dots as decimal points', () => {
  assert.equal(parseNum('0.005'), 0.005)
  assert.equal(parseNum('1.2345'), 1.2345)
  assert.equal(parseNum('0.5'), 0.5)
})

test('round-trips what formatQuantity prints', () => {
  // formatQuantity(0.005) renders "0,005"; re-parsing it must not change it.
  assert.equal(parseNum('0,005'), 0.005)
})

// Regression: a stray letter used to be stripped, fusing digits into a
// plausible but wrong price (8O,50 -> 8.5). It must be rejected instead.
test('rejects input containing unexpected characters', () => {
  assert.equal(parseNum('8O,50'), 0)
  assert.equal(parseNum('1e3'), 0)
  assert.equal(parseNum('NaN'), 0)
  assert.equal(parseNum('Infinity'), 0)
  assert.equal(parseNum('1.2.3'), 0)
  assert.equal(parseNum('80,50,60'), 0)
  assert.equal(parseNum('-'), 0)
})

test('strips currency noise only at the edges', () => {
  assert.equal(parseNum('€80,50'), 80.5)
  assert.equal(parseNum('80.50 EUR'), 80.5)
  assert.equal(parseNum('  80,50  '), 80.5)
  assert.equal(parseNum('1 234,56'), 1234.56)
  assert.equal(parseNum('8eur0'), 0)
})

test('handles null and undefined', () => {
  assert.equal(parseNum(null), 0)
  assert.equal(parseNum(undefined), 0)
})

test('handles a number passed straight through', () => {
  assert.equal(parseNum(80.5), 80.5)
  assert.equal(parseNum(Number.NaN), 0)
  assert.equal(parseNum(Number.POSITIVE_INFINITY), 0)
})

test('keeps a leading minus', () => {
  assert.equal(parseNum('-80,50'), -80.5)
})

test('tolerates a trailing or leading separator', () => {
  assert.equal(parseNum('80,'), 80)
  assert.equal(parseNum(',50'), 0.5)
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
node --experimental-strip-types --test lib/invoice/parseNum.test.ts
```

Expected: FAIL — cannot find module `./parseNum.ts`.

- [ ] **Step 3: Write `lib/invoice/parseNum.ts`**

```ts
// Parses money and quantity input for a German-first invoicing tool.
//
// NEVER use <input type="number"> for these values: it accepts only "." as
// the decimal separator, so a German "80,50" makes .value return an empty
// string and the amount silently becomes 0.
//
// Rules, in order of precedence:
//   1. A comma is ALWAYS the decimal separator ("0,005" -> 0.005). German
//      users do not write commas as thousands separators.
//   2. A lone dot is a THOUSANDS separator when it groups exactly three
//      digits and the leading group does not start with "0" ("1.234" ->
//      1234); otherwise it is a decimal point ("80.50" -> 80.5).
//   3. With both present, whichever appears last is the decimal separator.
//   4. Anything else is rejected as 0 rather than silently reinterpreted:
//      "8O,50" (letter O) must not become 8.5 on a customer's invoice.
export function parseNum(value: unknown): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0

  // Strip currency noise only at the edges, never in the middle: removing a
  // stray character between digits would fuse groups into a wrong number.
  let s = String(value).replace(/[\s ]/g, '')
  s = s.replace(/^(?:€|\$|eur)/i, '').replace(/(?:€|\$|eur)$/i, '')
  if (!s) return 0

  if (!/^-?[\d.,]+$/.test(s)) return 0

  const negative = s.startsWith('-')
  if (negative) s = s.slice(1)
  if (s.includes('-')) return 0

  const commas = (s.match(/,/g) ?? []).length
  const dots = (s.match(/\./g) ?? []).length
  if (commas > 1) return 0 // "80,50,60" is not a number

  let normalised: string
  if (commas === 1 && dots > 0) {
    normalised =
      s.lastIndexOf(',') > s.lastIndexOf('.')
        ? s.replace(/\./g, '').replace(',', '.') // 1.234,56
        : s.replace(/,/g, '') // 1,234.56
  } else if (commas === 1) {
    normalised = s.replace(',', '.') // 80,50 and 0,005
  } else if (dots > 0 && isThousandsGrouping(s)) {
    normalised = s.replace(/\./g, '') // 1.234 and 1.234.567
  } else if (dots > 1) {
    return 0 // "1.2.3" is neither a grouping nor a decimal
  } else {
    normalised = s // 80.50 and 0.005
  }

  const n = parseFloat(normalised)
  if (!Number.isFinite(n)) return 0
  return negative ? -n : n
}

// True for "1.234" and "1.234.567"; false for "80.50" and "0.005".
// A thousands grouping never starts with 0 and every later group is 3 digits.
function isThousandsGrouping(s: string): boolean {
  return /^[1-9]\d{0,2}(\.\d{3})+$/.test(s)
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
node --experimental-strip-types --test lib/invoice/parseNum.test.ts
```

Expected: `# pass 13`, `# fail 0`.

- [ ] **Step 5: Write the failing test for the formatters**

`lib/invoice/format.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatAmount, formatCurrency, formatDateDe, formatQuantity } from './format.ts'

test('formats amounts with German separators', () => {
  assert.equal(formatAmount(1234.5), '1.234,50')
  assert.equal(formatAmount(80.5), '80,50')
  assert.equal(formatAmount(0), '0,00')
})

test('formats currency with a trailing euro sign', () => {
  assert.equal(formatCurrency(1234.5), '1.234,50 €')
})

test('formats quantities without forcing decimals', () => {
  assert.equal(formatQuantity(2), '2')
  assert.equal(formatQuantity(1.5), '1,5')
  assert.equal(formatQuantity(0.125), '0,125')
})

test('formats an ISO date as DD.MM.YYYY', () => {
  // A type="date" input renders per browser locale — "08/07/2026" is
  // ambiguous on a German invoice, so print output is formatted here.
  assert.equal(formatDateDe('2026-08-08'), '08.08.2026')
  assert.equal(formatDateDe('2026-12-31'), '31.12.2026')
})

test('returns an empty string for empty or malformed dates', () => {
  assert.equal(formatDateDe(''), '')
  assert.equal(formatDateDe('nonsense'), '')
})

// Regression: shape-only validation printed impossible dates on invoices.
test('rejects dates that match the shape but do not exist', () => {
  assert.equal(formatDateDe('2026-02-30'), '')
  assert.equal(formatDateDe('2026-13-01'), '')
  assert.equal(formatDateDe('2026-00-10'), '')
  assert.equal(formatDateDe('2026-04-31'), '')
})

test('accepts a real leap day', () => {
  assert.equal(formatDateDe('2028-02-29'), '29.02.2028')
})

// Regression: the invoice date must follow Europe/Berlin, not the server's
// clock. On Vercel (UTC) a naive date is a day behind just after midnight.
test('todayIso follows the German calendar date, not UTC', () => {
  // 22:30 UTC in August is 00:30 the next day in Berlin (UTC+2).
  assert.equal(todayIso(new Date('2026-08-08T22:30:00Z')), '2026-08-09')
  // 23:30 UTC on New Year's Eve is 00:30 on 1 January in Berlin (UTC+1).
  assert.equal(todayIso(new Date('2025-12-31T23:30:00Z')), '2026-01-01')
  // Midday is unambiguous in either zone.
  assert.equal(todayIso(new Date('2026-08-08T12:00:00Z')), '2026-08-08')
})
```

- [ ] **Step 6: Run the test to verify it fails**

```bash
node --experimental-strip-types --test lib/invoice/format.test.ts
```

Expected: FAIL — cannot find module `./format.ts`.

- [ ] **Step 7: Write `lib/invoice/format.ts`**

```ts
export function formatAmount(value: number): string {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatCurrency(value: number): string {
  return `${formatAmount(value)} €`
}

export function formatQuantity(value: number): string {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })
}

// Formatted here rather than left to the browser: a type="date" input
// prints in the visitor's locale, which is ambiguous on a German invoice.
export function formatDateDe(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return ''
  const [, year, month, day] = match

  // Shape alone is not enough: "2026-02-30" matches the pattern but is not a
  // date, and must not print as 30.02.2026 on an invoice.
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`)
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() + 1 !== Number(month) ||
    date.getUTCDate() !== Number(day)
  ) {
    return ''
  }

  return `${day}.${month}.${year}`
}

// The invoice date must be the German calendar date. Vercel Functions run in
// UTC, so a naive local-time date would be one day behind for the first one
// to two hours after midnight in Germany — on a legally dated document.
// The `now` parameter exists so this is testable.
export function todayIso(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}
```

- [ ] **Step 8: Run the test to verify it passes**

```bash
node --experimental-strip-types --test lib/invoice/format.test.ts
```

Expected: `# pass 5`, `# fail 0`.

- [ ] **Step 9: Commit**

```bash
git add lib/invoice/parseNum.ts lib/invoice/parseNum.test.ts lib/invoice/format.ts lib/invoice/format.test.ts
git commit -m "feat(invoice): add German number parsing and de-DE formatting

parseNum handles both German and English decimal conventions; all nine
spec cases are covered by tests."
```

---

## Task 11: VAT totals and invoice numbering (pure)

**Files:**
- Create: `lib/invoice/totals.ts`, `lib/invoice/totals.test.ts`, `lib/invoice/numbering.ts`, `lib/invoice/numbering.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type InvoiceItemInput = { description: string; quantity: number; unit: string; unitPrice: number; vatRate: number }`
  - `type VatGroup = { rate: number; net: number; vat: number }`
  - `type InvoiceTotals = { lineNets: number[]; groups: VatGroup[]; netTotal: number; vatTotal: number; grossTotal: number }`
  - `round2(value: number): number`
  - `computeTotals(items: InvoiceItemInput[]): InvoiceTotals`
  - `nextInvoiceNumber(highest: string | null, year: number): string`
  - `compareInvoiceNumbers(a: string, b: string): number`

- [ ] **Step 1: Write the failing test for totals**

`lib/invoice/totals.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeTotals, round2, type InvoiceItemInput } from './totals.ts'

function item(partial: Partial<InvoiceItemInput>): InvoiceItemInput {
  return { description: 'Leistung', quantity: 1, unit: 'Std', unitPrice: 0, vatRate: 19, ...partial }
}

test('rounds half away from zero despite float representation', () => {
  assert.equal(round2(2.675), 2.68)
  assert.equal(round2(1.005), 1.01)
  assert.equal(round2(30.589999999999996), 30.59)
  assert.equal(round2(161), 161)
})

// A NaN here would silently poison every total on the invoice, so the
// guards must hold for values that stringify in exponential notation.
test('round2 never returns NaN', () => {
  assert.equal(round2(1e-7), 0)
  assert.equal(round2(Number.NaN), 0)
  assert.equal(round2(Number.POSITIVE_INFINITY), 0)
  assert.equal(round2(0), 0)
})

// Discount lines ("Nachlass -50,00") are ordinary on a German invoice, so
// negative amounts must round like their positive mirror image.
test('rounds half away from zero for negative amounts too', () => {
  assert.equal(round2(-0.145), -0.15)
  assert.equal(round2(-2.675), -2.68)
  assert.equal(round2(-1.005), -1.01)
})

test('a discount line exactly cancels the line it reverses', () => {
  // With asymmetric rounding these two lines would print 0,15 and -0,14 and
  // leave a cent of VAT on a net-zero transaction.
  const totals = computeTotals([
    item({ quantity: 1, unitPrice: 0.145, vatRate: 19 }),
    item({ quantity: 1, unitPrice: -0.145, vatRate: 19 }),
  ])
  assert.deepEqual(totals.lineNets, [0.15, -0.15])
  assert.equal(totals.groups[0].net, 0)
  assert.equal(totals.groups[0].vat, 0)
  assert.equal(totals.grossTotal, 0)
})

test('computes a single-rate invoice', () => {
  // 2 × 80,50 = 161,00 net; 19 % of 161,00 = 30,59; gross 191,59
  const totals = computeTotals([item({ quantity: 2, unitPrice: 80.5, vatRate: 19 })])
  assert.deepEqual(totals.lineNets, [161])
  assert.deepEqual(totals.groups, [{ rate: 19, net: 161, vat: 30.59 }])
  assert.equal(totals.netTotal, 161)
  assert.equal(totals.vatTotal, 30.59)
  assert.equal(totals.grossTotal, 191.59)
})

test('keeps 19 % and 7 % in separate groups, as § 14 UStG requires', () => {
  // 19 %: 2 × 80,50 = 161,00 -> VAT 30,59
  //  7 %: 1 × 100,00 = 100,00 -> VAT 7,00
  // net 261,00 | VAT 37,59 | gross 298,59
  const totals = computeTotals([
    item({ quantity: 2, unitPrice: 80.5, vatRate: 19 }),
    item({ quantity: 1, unitPrice: 100, vatRate: 7 }),
  ])
  assert.equal(totals.groups.length, 2)
  assert.deepEqual(totals.groups, [
    { rate: 7, net: 100, vat: 7 },
    { rate: 19, net: 161, vat: 30.59 },
  ])
  assert.equal(totals.netTotal, 261)
  assert.equal(totals.vatTotal, 37.59)
  assert.equal(totals.grossTotal, 298.59)
})

test('sums several lines that share a rate into one group', () => {
  const totals = computeTotals([
    item({ quantity: 1, unitPrice: 10, vatRate: 19 }),
    item({ quantity: 1, unitPrice: 20, vatRate: 19 }),
  ])
  assert.deepEqual(totals.groups, [{ rate: 19, net: 30, vat: 5.7 }])
})

test('includes a 0 % group with no VAT', () => {
  const totals = computeTotals([item({ quantity: 1, unitPrice: 50, vatRate: 0 })])
  assert.deepEqual(totals.groups, [{ rate: 0, net: 50, vat: 0 }])
  assert.equal(totals.vatTotal, 0)
  assert.equal(totals.grossTotal, 50)
})

// The printed document must be arithmetically consistent: the group net is
// the sum of the line nets AS PRINTED. Summing unrounded values instead would
// print lines of 0,15 + 0,15 under a subtotal of 0,29 — an invoice that
// visibly does not add up, which is worse than a one-cent rounding choice.
test('the group net is the sum of the rounded line nets, so the invoice adds up', () => {
  const totals = computeTotals([
    item({ quantity: 1, unitPrice: 0.145, vatRate: 19 }),
    item({ quantity: 1, unitPrice: 0.145, vatRate: 19 }),
  ])
  assert.deepEqual(totals.lineNets, [0.15, 0.15])
  assert.equal(totals.groups[0].net, 0.3)
  assert.equal(totals.netTotal, 0.3)
  assert.equal(totals.groups[0].vat, 0.06)
})

// This is the § 14 UStG requirement itself: VAT is owed on the summed net of
// each rate, not on each line separately.
test('computes VAT per rate group, not per line', () => {
  // Four lines of 0,03 net at 19 %. Per line the VAT rounds to 0,01 each,
  // i.e. 0,04 in total; on the summed net of 0,12 it is 0,02. The invoice
  // must show 0,02.
  const totals = computeTotals([
    item({ quantity: 1, unitPrice: 0.03, vatRate: 19 }),
    item({ quantity: 1, unitPrice: 0.03, vatRate: 19 }),
    item({ quantity: 1, unitPrice: 0.03, vatRate: 19 }),
    item({ quantity: 1, unitPrice: 0.03, vatRate: 19 }),
  ])
  assert.equal(totals.groups[0].net, 0.12)
  assert.equal(totals.groups[0].vat, 0.02)
})

test('an empty invoice is all zeros', () => {
  const totals = computeTotals([])
  assert.deepEqual(totals, { lineNets: [], groups: [], netTotal: 0, vatTotal: 0, grossTotal: 0 })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
node --experimental-strip-types --test lib/invoice/totals.test.ts
```

Expected: FAIL — cannot find module `./totals.ts`.

- [ ] **Step 3: Write `lib/invoice/totals.ts`**

```ts
export type InvoiceItemInput = {
  description: string
  quantity: number
  unit: string
  unitPrice: number
  vatRate: number
}

export type VatGroup = { rate: number; net: number; vat: number }

export type InvoiceTotals = {
  lineNets: number[]
  groups: VatGroup[]
  netTotal: number
  vatTotal: number
  grossTotal: number
}

// Decimal-string shift: Math.round(2.675 * 100) gives 267 because 2.675 is
// really 2.67499..., while Number('2.675e+2') is exactly 267.5.
//
// The two guards are not decoration. A value JavaScript stringifies in
// exponential form (1e-7, or anything >= 1e21) would make the template
// literal read "1e-7e+2", which is NaN — and a NaN silently poisons every
// total downstream. Non-finite input returns 0; exponential input falls back
// to plain multiplication, which is accurate enough at that magnitude.
export function round2(value: number): number {
  if (!Number.isFinite(value)) return 0

  // Half away from zero in BOTH directions. Math.round(-14.5) is -14, so a
  // naive implementation rounds +0,145 to 0,15 but -0,145 to -0,14 — and a
  // discount line would then not cancel the line it reverses. German
  // commercial rounding (kaufmännisches Runden) is symmetric.
  const away = (n: number) => (n < 0 ? -Math.round(-n) : Math.round(n))

  const shifted = Number(`${value}e+2`)
  if (!Number.isFinite(shifted)) return away(value * 100) / 100
  return Number(`${away(shifted)}e-2`)
}

// VAT is computed per rate group, never per line: § 14 UStG requires the
// net subtotal and the VAT owed to be shown for each rate.
//
// The order matters and is deliberate: round each line first, then sum the
// ROUNDED line nets per rate, then round the VAT of each group. Grouping
// unrounded values would leave the printed line amounts not summing to the
// printed subtotal — an invoice that visibly does not add up.
export function computeTotals(items: InvoiceItemInput[]): InvoiceTotals {
  const lineNets = items.map((i) => round2(i.quantity * i.unitPrice))

  const netByRate = new Map<number, number>()
  items.forEach((item, index) => {
    netByRate.set(item.vatRate, round2((netByRate.get(item.vatRate) ?? 0) + lineNets[index]))
  })

  const groups: VatGroup[] = [...netByRate.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([rate, net]) => ({ rate, net, vat: round2((net * rate) / 100) }))

  const netTotal = round2(groups.reduce((sum, g) => sum + g.net, 0))
  const vatTotal = round2(groups.reduce((sum, g) => sum + g.vat, 0))

  return { lineNets, groups, netTotal, vatTotal, grossTotal: round2(netTotal + vatTotal) }
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
node --experimental-strip-types --test lib/invoice/totals.test.ts
```

Expected: `# pass 7`, `# fail 0`.

- [ ] **Step 5: Write the failing test for numbering**

`lib/invoice/numbering.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compareInvoiceNumbers, nextInvoiceNumber } from './numbering.ts'

test('starts at 001 for the current year when nothing is issued yet', () => {
  assert.equal(nextInvoiceNumber(null, 2026), '2026-001')
})

test('increments the trailing digit block and keeps its width', () => {
  assert.equal(nextInvoiceNumber('2026-001', 2026), '2026-002')
  assert.equal(nextInvoiceNumber('2026-009', 2026), '2026-010')
  assert.equal(nextInvoiceNumber('R-2026-099', 2026), 'R-2026-100')
})

test('grows the width when the digits overflow', () => {
  assert.equal(nextInvoiceNumber('2026-999', 2026), '2026-1000')
})

test('falls back to the year pattern when there is no trailing digit block', () => {
  assert.equal(nextInvoiceNumber('RECHNUNG', 2026), '2026-001')
})

test('sorts numerically per German collation, not lexically', () => {
  const sorted = ['2026-010', '2026-002', '2026-009'].sort(compareInvoiceNumbers)
  assert.deepEqual(sorted, ['2026-002', '2026-009', '2026-010'])
})
```

- [ ] **Step 6: Run the test to verify it fails**

```bash
node --experimental-strip-types --test lib/invoice/numbering.test.ts
```

Expected: FAIL — cannot find module `./numbering.ts`.

- [ ] **Step 7: Write `lib/invoice/numbering.ts`**

```ts
// German invoice numbers must be unique and gapless, so a number is only
// ever derived from the highest ISSUED one — drafts hold no number.
export function nextInvoiceNumber(highest: string | null, year: number): string {
  if (!highest) return `${year}-001`

  const match = /^(.*?)(\d+)$/.exec(highest)
  if (!match) return `${year}-001`

  const [, prefix, digits] = match
  const incremented = String(Number(digits) + 1)
  return `${prefix}${incremented.padStart(digits.length, '0')}`
}

export function compareInvoiceNumbers(a: string, b: string): number {
  return a.localeCompare(b, 'de', { numeric: true })
}
```

- [ ] **Step 8: Run the test to verify it passes, then the whole suite**

```bash
node --experimental-strip-types --test lib/invoice/numbering.test.ts
npm test
```

Expected: the single file passes, then `npm test` reports all six test files green (`# fail 0`).

- [ ] **Step 9: Commit**

```bash
git add lib/invoice/totals.ts lib/invoice/totals.test.ts lib/invoice/numbering.ts lib/invoice/numbering.test.ts
git commit -m "feat(invoice): add per-rate VAT totals and invoice numbering

VAT is grouped by rate as § 14 UStG requires, with a decimal-shift
rounding helper so 2.675 rounds to 2.68 rather than 2.67."
```

---

## Task 12: Invoice types and the `EditableField` print twin

**Files:**
- Create: `lib/invoice/types.ts`, `components/admin/EditableField.tsx`

**Interfaces:**
- Consumes: `InvoiceItemInput` from `lib/invoice/totals.ts`, `formatDateDe` from `lib/invoice/format.ts`.
- Produces:
  - `type InvoiceStatus = 'draft' | 'issued'`
  - `type InvoiceDraft` (see code) — the shared editor/database shape
  - `type InvoiceSummary` — the archive row shape
  - `emptyItem(vatRate: number): InvoiceItemInput`
  - `defaultPaymentTerms(days: number): string`
  - `emptyInvoice(args: { proposedNumber: string; invoiceDate: string; paymentTerms: string; vatRate: number }): InvoiceDraft`
  - `<EditableField>` — renders a screen input **and** a print-only span

**Why the twin:** every printed value comes from a `<span>` rendered from the same state as its input. That single decision removes four print traps at once (locale-formatted dates, placeholder text on empty optionals, clipped text in inputs, select arrows) and makes print output pure render — no `beforeprint` mutation, and therefore no `beforeprint` race in tests.

- [ ] **Step 1: Write `lib/invoice/types.ts`**

```ts
import type { InvoiceItemInput } from './totals.ts'

export type InvoiceStatus = 'draft' | 'issued'

export type InvoiceDraft = {
  id: string | null
  status: InvoiceStatus
  invoiceNumber: string | null // assigned only when issued
  proposedNumber: string // the editable field while still a draft
  invoiceDate: string // ISO yyyy-mm-dd
  serviceDate: string // free text: a date or a period ("Juli 2026")
  customerNumber: string
  customerName: string
  customerStreet: string
  customerZipCity: string
  customerCountry: string
  customerVatId: string
  paymentTerms: string
  items: InvoiceItemInput[]
}

export type InvoiceSummary = {
  id: string
  status: InvoiceStatus
  invoiceNumber: string | null
  proposedNumber: string
  invoiceDate: string
  customerName: string
  netTotal: number
  vatTotal: number
  grossTotal: number
}

// `crypto.randomUUID()` exists only in a secure context, so a dev server
// reached over a plain-HTTP LAN address (from a phone, say) would throw and take
// the whole admin app down. `getRandomValues` has no such restriction, so the
// fallback is still cryptographically random — and it must keep a valid UUID
// shape, because `invoices.id` is a `uuid` column.
export function newInvoiceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 1
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function emptyItem(vatRate: number): InvoiceItemInput {
  return { description: '', quantity: 1, unit: 'Std', unitPrice: 0, vatRate }
}

export function defaultPaymentTerms(days: number): string {
  return `Zahlbar innerhalb von ${days} Tagen ohne Abzug.`
}

export function emptyInvoice(args: {
  proposedNumber: string
  invoiceDate: string
  paymentTerms: string
  vatRate: number
}): InvoiceDraft {
  return {
    // The id is minted here, on the client, rather than left null until the
    // first save. `saveDraft` upserts on it, so clicking "Ins Archiv legen"
    // twice in quick succession updates one row instead of creating two — with
    // a null id each click mints its own UUID, `on conflict (id)` never fires,
    // and nothing else in the schema stops the duplicate.
    id: newInvoiceId(),
    status: 'draft',
    invoiceNumber: null,
    proposedNumber: args.proposedNumber,
    invoiceDate: args.invoiceDate,
    serviceDate: '',
    customerNumber: '',
    customerName: '',
    customerStreet: '',
    customerZipCity: '',
    customerCountry: 'Deutschland',
    customerVatId: '',
    paymentTerms: args.paymentTerms,
    items: [emptyItem(args.vatRate)],
  }
}
```

- [ ] **Step 2: Write `components/admin/EditableField.tsx`**

```tsx
'use client'

import { formatDateDe } from '@/lib/invoice/format.ts'

type Props = {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  placeholder?: string
  type?: 'text' | 'date'
  multiline?: boolean
  readOnly?: boolean
  className?: string
  /** Overrides what is printed; defaults to `value`. */
  printValue?: string
}

// Renders TWO representations of one value: an input for the screen and a
// span for print. The span wraps, is never locale-formatted by the browser,
// and is empty when the value is empty — which is how the print CSS knows
// to hide optional rows.
export function EditableField({
  value,
  onChange,
  ariaLabel,
  placeholder,
  type = 'text',
  multiline = false,
  readOnly = false,
  className = '',
  printValue,
}: Props) {
  const printed = printValue ?? (type === 'date' ? formatDateDe(value) : value)

  return (
    <>
      {multiline ? (
        <textarea
          aria-label={ariaLabel}
          className={`admin-field admin-no-print resize-none ${className}`}
          rows={2}
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          aria-label={ariaLabel}
          type={type}
          className={`admin-field admin-no-print ${className}`}
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <span className="admin-print-only">{printed}</span>
    </>
  )
}
```

Note: `.admin-field` is already hidden in print by `admin.css`; `admin-no-print` is added for the textarea and inputs so the rule holds even if a field is restyled later.

- [ ] **Step 3: Verify it compiles**

```bash
npx tsc --noEmit -p tsconfig.json
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add lib/invoice/types.ts components/admin/EditableField.tsx
git commit -m "feat(invoice): add shared invoice types and EditableField print twin

Every field renders an input for screen and a span for print from the
same state, so print output needs no beforeprint DOM mutation."
```

---

## Task 13: Invoice sheet, line items and totals block

**Files:**
- Create: `components/admin/InvoiceSheet.tsx`, `components/admin/ItemsTable.tsx`, `components/admin/TotalsBlock.tsx`
- Modify: `components/admin/AdminApp.tsx` (render the invoice tab)

**Interfaces:**
- Consumes: `InvoiceDraft`, `emptyItem`, `defaultPaymentTerms`, `emptyInvoice`, `computeTotals`, `parseNum`, `formatAmount`, `formatCurrency`, `formatQuantity`, `todayIso`, `MasterDataInvoiceVisible`, `<EditableField>`.
- Produces:
  - `<InvoiceSheet invoice sender totals onChange readOnly />`
  - `<ItemsTable items lineNets onChange readOnly />`
  - `<TotalsBlock totals />`

**Security detail:** `InvoiceSheet` takes `sender: MasterDataInvoiceVisible`, never `MasterData`. The internal fields are not in scope for any component below this line.

- [ ] **Step 1: Write `components/admin/TotalsBlock.tsx`**

```tsx
'use client'

import { formatCurrency, formatQuantity } from '@/lib/invoice/format.ts'
import type { InvoiceTotals } from '@/lib/invoice/totals.ts'

export function TotalsBlock({ totals }: { totals: InvoiceTotals }) {
  return (
    <div className="mt-8 flex justify-end">
      <table className="text-sm">
        <tbody>
          {totals.groups.map((group) => (
            <tr key={group.rate}>
              <th scope="row" className="py-0.5 pr-6 text-left font-normal text-gray-600">
                Nettobetrag {formatQuantity(group.rate)} % USt.
              </th>
              <td className="py-0.5 text-right tabular-nums">{formatCurrency(group.net)}</td>
            </tr>
          ))}
          {totals.groups.map((group) => (
            <tr key={`vat-${group.rate}`}>
              <th scope="row" className="py-0.5 pr-6 text-left font-normal text-gray-600">
                zzgl. {formatQuantity(group.rate)} % USt.
              </th>
              <td className="py-0.5 text-right tabular-nums">{formatCurrency(group.vat)}</td>
            </tr>
          ))}
          <tr className="border-t border-gray-300">
            <th scope="row" className="py-1 pr-6 text-left font-normal text-gray-600">
              Gesamt netto
            </th>
            <td className="py-1 text-right tabular-nums">{formatCurrency(totals.netTotal)}</td>
          </tr>
          <tr className="border-t-2 border-gray-800">
            <th scope="row" className="py-1.5 pr-6 text-left font-semibold">
              Gesamtbetrag
            </th>
            <td className="py-1.5 text-right font-semibold tabular-nums">
              {formatCurrency(totals.grossTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Write `components/admin/ItemsTable.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { EditableField } from './EditableField.tsx'
import { formatAmount, formatCurrency, formatQuantity } from '@/lib/invoice/format.ts'
import { parseNum } from '@/lib/invoice/parseNum.ts'
import { emptyItem } from '@/lib/invoice/types.ts'
import type { InvoiceItemInput } from '@/lib/invoice/totals.ts'

const VAT_RATES = [19, 7, 0]

export function ItemsTable({
  items,
  lineNets,
  defaultVatRate,
  readOnly,
  onChange,
}: {
  items: InvoiceItemInput[]
  lineNets: number[]
  defaultVatRate: number
  readOnly: boolean
  onChange: (items: InvoiceItemInput[]) => void
}) {
  // Raw text per numeric cell so typing "80," is not clobbered mid-keystroke.
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  function update(index: number, patch: Partial<InvoiceItemInput>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function removeRow(index: number) {
    const remaining = items.filter((_, i) => i !== index)
    // Deleting the last row immediately yields a fresh empty one.
    onChange(remaining.length ? remaining : [emptyItem(defaultVatRate)])
    setDrafts({})
  }

  function numericCell(
    index: number,
    field: 'quantity' | 'unitPrice',
    display: (value: number) => string
  ) {
    const key = `${index}-${field}`
    const raw = drafts[key]
    return (
      <>
        <input
          aria-label={`${field === 'quantity' ? 'Menge' : 'Einzelpreis'} Position ${index + 1}`}
          type="text"
          inputMode="decimal"
          className="admin-field admin-no-print text-right"
          readOnly={readOnly}
          value={raw ?? display(items[index][field])}
          onChange={(e) => {
            setDrafts((d) => ({ ...d, [key]: e.target.value }))
            update(index, { [field]: parseNum(e.target.value) })
          }}
          onBlur={() => {
            // Rewrite the field in German formatting on blur.
            setDrafts((d) => {
              const next = { ...d }
              delete next[key]
              return next
            })
          }}
        />
        <span className="admin-print-only text-right">{display(items[index][field])}</span>
      </>
    )
  }

  return (
    <div className="mt-8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-300 text-left text-xs uppercase text-gray-500">
            <th className="w-10 py-1 font-medium">Pos.</th>
            <th className="py-1 font-medium">Beschreibung</th>
            {/* pr-3: right-aligned "Menge" otherwise butts straight against
                left-aligned "Einheit" and the header reads "MENGEEINHEIT". */}
            <th className="w-20 py-1 pr-3 text-right font-medium">Menge</th>
            <th className="w-20 py-1 font-medium">Einheit</th>
            <th className="w-28 py-1 text-right font-medium">Einzelpreis</th>
            <th className="w-20 py-1 text-right font-medium">USt.</th>
            <th className="w-28 py-1 text-right font-medium">Gesamt netto</th>
            <th className="admin-no-print w-8 py-1" />
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={index}
              className="border-b border-gray-100 align-top"
              data-empty={item.description.trim() === '' && item.unitPrice === 0 ? 'true' : undefined}
            >
              <td className="py-1 text-gray-500">{index + 1}</td>
              <td className="py-1">
                <EditableField
                  ariaLabel={`Beschreibung Position ${index + 1}`}
                  value={item.description}
                  readOnly={readOnly}
                  onChange={(value) => update(index, { description: value })}
                />
              </td>
              <td className="py-1 pr-3">{numericCell(index, 'quantity', formatQuantity)}</td>
              <td className="py-1">
                <EditableField
                  ariaLabel={`Einheit Position ${index + 1}`}
                  value={item.unit}
                  readOnly={readOnly}
                  onChange={(value) => update(index, { unit: value })}
                />
              </td>
              <td className="py-1">{numericCell(index, 'unitPrice', formatAmount)}</td>
              <td className="py-1 text-right">
                <select
                  aria-label={`Steuersatz Position ${index + 1}`}
                  className="admin-field admin-no-print text-right [appearance:none]"
                  disabled={readOnly}
                  value={String(item.vatRate)}
                  onChange={(e) => update(index, { vatRate: Number(e.target.value) })}
                >
                  {VAT_RATES.map((rate) => (
                    <option key={rate} value={rate}>
                      {rate} %
                    </option>
                  ))}
                </select>
                <span className="admin-print-only text-right">{formatQuantity(item.vatRate)} %</span>
              </td>
              <td className="py-1 text-right tabular-nums">{formatCurrency(lineNets[index] ?? 0)}</td>
              <td className="admin-no-print py-1 text-right">
                {!readOnly && (
                  <button
                    type="button"
                    aria-label={`Position ${index + 1} löschen`}
                    onClick={() => removeRow(index)}
                    className="px-1 text-gray-400 hover:text-red-700"
                  >
                    ✕
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!readOnly && (
        <button
          type="button"
          onClick={() => onChange([...items, emptyItem(defaultVatRate)])}
          className="admin-no-print mt-3 text-sm text-[#1f5f4f] underline"
        >
          + Position hinzufügen
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write `components/admin/InvoiceSheet.tsx`**

```tsx
'use client'

import { EditableField } from './EditableField.tsx'
import { ItemsTable } from './ItemsTable.tsx'
import { TotalsBlock } from './TotalsBlock.tsx'
import type { InvoiceItemInput, InvoiceTotals } from '@/lib/invoice/totals.ts'
import type { InvoiceDraft } from '@/lib/invoice/types.ts'
// Only the invoice-visible half of the master data reaches this component.
import type { MasterDataInvoiceVisible } from '@/lib/db/masterData.ts'

export function InvoiceSheet({
  invoice,
  sender,
  totals,
  readOnly,
  onChange,
}: {
  invoice: InvoiceDraft
  sender: MasterDataInvoiceVisible
  totals: InvoiceTotals
  readOnly: boolean
  onChange: (next: InvoiceDraft) => void
}) {
  function set<K extends keyof InvoiceDraft>(key: K, value: InvoiceDraft[K]) {
    onChange({ ...invoice, [key]: value })
  }

  function setItems(items: InvoiceItemInput[]) {
    onChange({ ...invoice, items })
  }

  const metaRow = 'flex gap-2'
  const metaLabel = 'w-40 shrink-0 text-gray-600'

  return (
    <article className="admin-sheet mx-auto my-8 text-sm">
      <header className="flex items-start justify-between">
        <div className="leading-relaxed">
          <p className="font-semibold">{sender.name}</p>
          <p>{sender.statusLabel}</p>
          <p>{sender.street}</p>
          <p>{sender.zipCity}</p>
          <p>{sender.country}</p>
        </div>
        <h2 className="admin-accent text-2xl font-semibold tracking-wide">RECHNUNG</h2>
      </header>

      <section className="mt-12 leading-relaxed">
        <EditableField
          ariaLabel="Kundenname"
          placeholder="Kundenname"
          value={invoice.customerName}
          readOnly={readOnly}
          onChange={(v) => set('customerName', v)}
        />
        <EditableField
          ariaLabel="Kundenstraße"
          placeholder="Straße und Hausnummer"
          value={invoice.customerStreet}
          readOnly={readOnly}
          onChange={(v) => set('customerStreet', v)}
        />
        <EditableField
          ariaLabel="Kunden-PLZ und Ort"
          placeholder="PLZ und Ort"
          value={invoice.customerZipCity}
          readOnly={readOnly}
          onChange={(v) => set('customerZipCity', v)}
        />
        <EditableField
          ariaLabel="Kundenland"
          placeholder="Land"
          value={invoice.customerCountry}
          readOnly={readOnly}
          onChange={(v) => set('customerCountry', v)}
        />
        <div className="admin-optional">
          <EditableField
            ariaLabel="USt-IdNr. des Kunden"
            placeholder="USt-IdNr. des Kunden (optional)"
            value={invoice.customerVatId}
            readOnly={readOnly}
            onChange={(v) => set('customerVatId', v)}
          />
        </div>
      </section>

      <section className="mt-10 flex flex-col gap-1">
        <div className={metaRow}>
          <span className={metaLabel}>Rechnungsnummer</span>
          {invoice.status === 'issued' ? (
            <span>{invoice.invoiceNumber}</span>
          ) : (
            <EditableField
              ariaLabel="Rechnungsnummer"
              value={invoice.proposedNumber}
              readOnly={readOnly}
              onChange={(v) => set('proposedNumber', v)}
            />
          )}
        </div>
        <div className={metaRow}>
          <span className={metaLabel}>Rechnungsdatum</span>
          <EditableField
            ariaLabel="Rechnungsdatum"
            type="date"
            value={invoice.invoiceDate}
            readOnly={readOnly}
            onChange={(v) => set('invoiceDate', v)}
          />
        </div>
        <div className={metaRow}>
          <span className={metaLabel}>Leistungszeitraum</span>
          <EditableField
            ariaLabel="Leistungsdatum oder Leistungszeitraum"
            placeholder="z. B. 01.07.2026 – 31.07.2026"
            value={invoice.serviceDate}
            readOnly={readOnly}
            onChange={(v) => set('serviceDate', v)}
          />
        </div>
        <div className={`${metaRow} admin-optional`}>
          <span className={metaLabel}>Kundennummer</span>
          <EditableField
            ariaLabel="Kundennummer"
            placeholder="optional"
            value={invoice.customerNumber}
            readOnly={readOnly}
            onChange={(v) => set('customerNumber', v)}
          />
        </div>
      </section>

      <ItemsTable
        items={invoice.items}
        lineNets={totals.lineNets}
        defaultVatRate={sender.defaultVatRate}
        readOnly={readOnly}
        onChange={setItems}
      />

      <TotalsBlock totals={totals} />

      <section className="mt-10 flex justify-between gap-8">
        <div className="w-1/2">
          <p className="mb-1 font-semibold">Zahlungsbedingungen</p>
          <EditableField
            ariaLabel="Zahlungsbedingungen"
            multiline
            value={invoice.paymentTerms}
            readOnly={readOnly}
            onChange={(v) => set('paymentTerms', v)}
          />
        </div>
        <div className="w-1/2 leading-relaxed">
          <p className="mb-1 font-semibold">Bankverbindung</p>
          <p>{sender.accountHolder}</p>
          <p>IBAN: {sender.iban}</p>
          <p>{sender.bankName}</p>
          {sender.bic && <p>BIC: {sender.bic}</p>}
        </div>
      </section>

      <footer className="mt-12 border-t border-gray-200 pt-3 text-xs leading-relaxed text-gray-600">
        <p>
          {sender.name} · {sender.street} · {sender.zipCity}
        </p>
        <p>
          Steuernummer: {sender.taxNumber} · USt-IdNr.: {sender.vatId} · {sender.taxOffice}
        </p>
        <p>
          {sender.phone} · {sender.email} · {sender.website}
        </p>
      </footer>
    </article>
  )
}
```

- [ ] **Step 4: Wire the invoice tab into `components/admin/AdminApp.tsx`**

Replace the whole file:

```tsx
'use client'

import { useMemo, useState } from 'react'
import type { MasterData } from '@/lib/db/masterData.ts'
import { computeTotals } from '@/lib/invoice/totals.ts'
import { todayIso } from '@/lib/invoice/format.ts'
import { defaultPaymentTerms, emptyInvoice, type InvoiceDraft } from '@/lib/invoice/types.ts'
import { InvoiceSheet } from './InvoiceSheet.tsx'
import { MasterDataForm } from './MasterDataForm.tsx'

type Tab = 'invoice' | 'archive' | 'master'

const TABS: { id: Tab; label: string }[] = [
  { id: 'invoice', label: 'Rechnung erstellen' },
  { id: 'archive', label: 'Meine Rechnungen' },
  { id: 'master', label: 'Stammdaten' },
]

export function AdminApp({
  masterData: initialMasterData,
  nextNumber,
}: {
  masterData: MasterData
  nextNumber: string
}) {
  const [tab, setTab] = useState<Tab>('invoice')
  const [masterData, setMasterData] = useState(initialMasterData)
  const [termsTouched, setTermsTouched] = useState(false)
  const [invoice, setInvoice] = useState<InvoiceDraft>(() =>
    emptyInvoice({
      proposedNumber: nextNumber,
      invoiceDate: todayIso(),
      paymentTerms: defaultPaymentTerms(initialMasterData.invoiceVisible.paymentTermsDays),
      vatRate: initialMasterData.invoiceVisible.defaultVatRate,
    })
  )

  const totals = useMemo(() => computeTotals(invoice.items), [invoice.items])

  function updateInvoice(next: InvoiceDraft) {
    if (next.paymentTerms !== invoice.paymentTerms) setTermsTouched(true)
    setInvoice(next)
  }

  // Master data drives payment terms until the owner edits them by hand.
  function updateMasterData(next: MasterData) {
    setMasterData(next)
    if (!termsTouched) {
      setInvoice((current) => ({
        ...current,
        paymentTerms: defaultPaymentTerms(next.invoiceVisible.paymentTermsDays),
      }))
    }
  }

  return (
    <>
      <nav className="admin-no-print flex gap-1 border-b border-gray-200 bg-white px-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={
              tab === t.id
                ? 'border-b-2 border-[#1f5f4f] px-4 py-3 text-sm font-semibold text-[#1f5f4f]'
                : 'px-4 py-3 text-sm text-gray-500'
            }
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'invoice' && (
        <InvoiceSheet
          invoice={invoice}
          sender={masterData.invoiceVisible}
          totals={totals}
          readOnly={invoice.status === 'issued'}
          onChange={updateInvoice}
        />
      )}
      {tab === 'archive' && (
        <p className="p-6 text-sm text-gray-500">Wird in einem späteren Schritt ergänzt.</p>
      )}
      {tab === 'master' && (
        <MasterDataForm masterData={masterData} onChange={updateMasterData} />
      )}
    </>
  )
}
```

- [ ] **Step 5: Pass `nextNumber` from `app/admin/(protected)/page.tsx`**

Until Task 14 provides the real repository, derive it from nothing issued yet:

```tsx
import { requireSession } from '@/lib/admin/session.ts'
import { loadMasterData } from '@/lib/db/masterData.ts'
import { nextInvoiceNumber } from '@/lib/invoice/numbering.ts'
import { AdminApp } from '@/components/admin/AdminApp.tsx'

export default async function AdminHomePage() {
  await requireSession()
  const masterData = await loadMasterData()
  const nextNumber = nextInvoiceNumber(null, new Date().getFullYear())
  return <AdminApp masterData={masterData} nextNumber={nextNumber} />
}
```

- [ ] **Step 6: Verify manually — this is the first time the tool looks like an invoice**

```bash
npm run dev
```

1. The sheet shows your master data in the sender block, bank block and footer.
2. Type `80,50` into Einzelpreis with Menge `2` → *Gesamt netto* shows `161,00 €`, VAT `30,59 €`, total `191,59 €`. **If the price becomes 0, an `<input type="number">` slipped in.**
3. Switch one row to `7 %` and add a second row at `19 %` → two separate VAT blocks appear.
4. Delete the only row → a fresh empty row appears immediately.
5. Add three rows, delete the middle one → positions renumber to 1, 2, 3.
6. Open **Stammdaten**, change Zahlungsziel to 30, return to the invoice → the payment terms text updates. Edit the terms by hand, change Zahlungsziel again → your text is left alone.

- [ ] **Step 7: Verify the build**

```bash
npm run build && npm run lint && npm test
```

- [ ] **Step 8: Commit**

```bash
git add components/admin app/admin
git commit -m "feat(invoice): add editable invoice sheet, items table and totals

Line items recompute live; VAT is shown per rate group. Payment terms
follow master data until manually edited."
```

---

## Task 14: Invoice repository

**Files:**
- Create: `lib/db/invoices.ts`
- Modify: `app/admin/(protected)/actions.ts` (add draft actions), `app/admin/(protected)/page.tsx` (load the archive and the real next number)

**Interfaces:**
- Consumes: `sql`, `computeTotals`, `InvoiceDraft`, `InvoiceSummary`, `MasterDataInvoiceVisible`, `nextInvoiceNumber`.
- Produces:
  - `listInvoices(): Promise<InvoiceSummary[]>`
  - `loadInvoice(id: string): Promise<InvoiceDraft | null>`
  - `saveDraft(draft: InvoiceDraft): Promise<string>`
  - `deleteDraft(id: string): Promise<void>`
  - `lastIssuedNumber(): Promise<string | null>`
  - `issueInvoice(id, invoiceNumber, snapshot): Promise<{ ok: true } | { ok: false; error: 'number_taken' | 'not_draft' }>`
  - Actions: `saveDraftAction`, `loadInvoiceAction`, `deleteDraftAction`

- [ ] **Step 1: Write `lib/db/invoices.ts`**

```ts
import 'server-only'
import { randomUUID } from 'node:crypto'
import { sql } from './client.ts'
// Relative, not `@/…`: plain Node ESM cannot resolve the tsconfig path alias,
// so an `@/` import here breaks every bare-Node verification script in this
// plan (it reads `@/lib/…` as an invalid bare package name). The rest of
// `lib/` already imports relatively for the same reason.
import { computeTotals } from '../invoice/totals.ts'
import { compareInvoiceNumbers } from '../invoice/numbering.ts'
import { todayIso } from '../invoice/format.ts'
import type { InvoiceDraft, InvoiceStatus, InvoiceSummary } from '../invoice/types.ts'
import type { MasterDataInvoiceVisible } from './masterData.ts'

// Verified against the live database: the driver parses a `date` column into a
// Date at LOCAL midnight, so a stored 2026-08-08 arrives as
// 2026-08-07T22:00:00.000Z in CEST. Both naive readings are wrong —
// String(value).slice(0,10) gives "Sat Aug 08", and toISOString().slice(0,10)
// gives "2026-08-07", one day early on a legally dated document.
//
// Every query therefore selects `invoice_date::text`. This guard exists so a
// future query that forgets the cast fails loudly instead of silently shifting
// every invoice date by a day.
function isoDate(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error(
      `invoice_date must be selected as ::text — got ${Object.prototype.toString.call(value)}`
    )
  }
  return value.slice(0, 10)
}

export async function listInvoices(): Promise<InvoiceSummary[]> {
  const rows = await sql`
    select id, status, invoice_number, proposed_number,
           invoice_date::text as invoice_date,
           customer_name, net_total, vat_total, gross_total
    from invoices
  `
  return rows
    .map((r) => ({
      id: r.id as string,
      status: r.status as InvoiceStatus,
      invoiceNumber: (r.invoice_number as string | null) ?? null,
      proposedNumber: r.proposed_number as string,
      invoiceDate: isoDate(r.invoice_date),
      customerName: r.customer_name as string,
      netTotal: Number(r.net_total),
      vatTotal: Number(r.vat_total),
      grossTotal: Number(r.gross_total),
    }))
    .sort((a, b) =>
      compareInvoiceNumbers(
        a.invoiceNumber ?? a.proposedNumber,
        b.invoiceNumber ?? b.proposedNumber
      )
    )
}

export async function loadInvoice(id: string): Promise<InvoiceDraft | null> {
  // Columns are enumerated rather than `select *` so the date cast cannot be
  // lost, and so adding a column later does not silently change this shape.
  const rows = await sql`
    select id, status, invoice_number, proposed_number,
           invoice_date::text as invoice_date,
           service_date, customer_number, customer_name, customer_street,
           customer_zip_city, customer_country, customer_vat_id, payment_terms
    from invoices where id = ${id}
  `
  const r = rows[0]
  if (!r) return null

  const items = await sql`
    select line_no, description, quantity, unit, unit_price, vat_rate
    from invoice_items where invoice_id = ${id} order by line_no
  `

  return {
    id: r.id as string,
    status: r.status as InvoiceStatus,
    invoiceNumber: (r.invoice_number as string | null) ?? null,
    proposedNumber: r.proposed_number as string,
    invoiceDate: isoDate(r.invoice_date),
    serviceDate: r.service_date as string,
    customerNumber: r.customer_number as string,
    customerName: r.customer_name as string,
    customerStreet: r.customer_street as string,
    customerZipCity: r.customer_zip_city as string,
    customerCountry: r.customer_country as string,
    customerVatId: r.customer_vat_id as string,
    paymentTerms: r.payment_terms as string,
    items: items.map((i) => ({
      description: i.description as string,
      quantity: Number(i.quantity),
      unit: i.unit as string,
      unitPrice: Number(i.unit_price),
      vatRate: Number(i.vat_rate),
    })),
  }
}

export async function saveDraft(draft: InvoiceDraft): Promise<string> {
  const id = draft.id ?? randomUUID()
  const totals = computeTotals(draft.items)
  const invoiceDate = draft.invoiceDate || todayIso()

  // One transaction so items are never half-replaced. The immutability
  // trigger rejects this outright if the row is already issued.
  await sql.transaction([
    sql`
      insert into invoices (
        id, status, proposed_number, invoice_date, service_date,
        customer_number, customer_name, customer_street, customer_zip_city,
        customer_country, customer_vat_id, payment_terms,
        net_total, vat_total, gross_total, vat_breakdown
      ) values (
        ${id}, 'draft', ${draft.proposedNumber}, ${invoiceDate}, ${draft.serviceDate},
        ${draft.customerNumber}, ${draft.customerName}, ${draft.customerStreet},
        ${draft.customerZipCity}, ${draft.customerCountry}, ${draft.customerVatId},
        ${draft.paymentTerms}, ${totals.netTotal}, ${totals.vatTotal}, ${totals.grossTotal},
        ${JSON.stringify(totals.groups)}::jsonb
      )
      on conflict (id) do update set
        proposed_number = excluded.proposed_number,
        invoice_date = excluded.invoice_date,
        service_date = excluded.service_date,
        customer_number = excluded.customer_number,
        customer_name = excluded.customer_name,
        customer_street = excluded.customer_street,
        customer_zip_city = excluded.customer_zip_city,
        customer_country = excluded.customer_country,
        customer_vat_id = excluded.customer_vat_id,
        payment_terms = excluded.payment_terms,
        net_total = excluded.net_total,
        vat_total = excluded.vat_total,
        gross_total = excluded.gross_total,
        vat_breakdown = excluded.vat_breakdown,
        updated_at = now()
    `,
    sql`delete from invoice_items where invoice_id = ${id}`,
    ...draft.items.map(
      (item, index) => sql`
        insert into invoice_items (
          invoice_id, line_no, description, quantity, unit, unit_price, vat_rate, net_amount
        ) values (
          ${id}, ${index + 1}, ${item.description}, ${item.quantity}, ${item.unit},
          ${item.unitPrice}, ${item.vatRate}, ${totals.lineNets[index] ?? 0}
        )
      `
    ),
  ])

  return id
}

export async function deleteDraft(id: string): Promise<void> {
  // The trigger blocks deletion of issued rows; this keeps the intent local.
  await sql`delete from invoices where id = ${id} and status = 'draft'`
}

// The number to continue from is the one on the invoice most recently ISSUED —
// not the "highest" by any string ordering.
//
// Sorting the numbers was verified to be wrong: with `2026-050` and
// `RE-2026-001` in the table, German collation ranks the letter-prefixed one
// last, so it was treated as the highest and the next number came out as
// `RE-2026-002` — BELOW the true `2026-050`, with no error raised. Because the
// number is a free-text field the owner may edit, no string ordering can be
// trusted across a change of prefix. `issued_at` always can: invoices are
// issued one at a time, in time order.
export async function lastIssuedNumber(): Promise<string | null> {
  const rows = await sql`
    select invoice_number from invoices
    where status = 'issued' and invoice_number is not null
    order by issued_at desc
    limit 1
  `
  return (rows[0]?.invoice_number as string | undefined) ?? null
}

export async function issueInvoice(
  id: string,
  invoiceNumber: string,
  snapshot: MasterDataInvoiceVisible
): Promise<{ ok: true } | { ok: false; error: 'number_taken' | 'not_draft' }> {
  try {
    // OLD.status is still 'draft' here, so the immutability trigger allows
    // exactly this one transition and nothing after it.
    const rows = await sql`
      update invoices set
        status = 'issued',
        invoice_number = ${invoiceNumber},
        issued_at = now(),
        sender_snapshot = ${JSON.stringify(snapshot)}::jsonb,
        updated_at = now()
      where id = ${id} and status = 'draft'
      returning id
    `
    if (rows.length === 0) return { ok: false, error: 'not_draft' }
    return { ok: true }
  } catch (error) {
    const code = (error as { code?: string }).code
    if (code === '23505' || String(error).includes('invoice_number')) {
      return { ok: false, error: 'number_taken' }
    }
    throw error
  }
}
```

- [ ] **Step 2: Add the draft actions to `app/admin/(protected)/actions.ts`**

```ts
import {
  deleteDraft,
  lastIssuedNumber,
  listInvoices,
  loadInvoice,
  saveDraft,
} from '@/lib/db/invoices.ts'
import type { InvoiceDraft, InvoiceSummary } from '@/lib/invoice/types.ts'

export async function saveDraftAction(
  draft: InvoiceDraft
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireSession()
  try {
    const id = await saveDraft(draft)
    refresh()
    return { ok: true, id }
  } catch (error) {
    console.error('saveDraft failed', error)
    return { ok: false, error: 'Speichern fehlgeschlagen. Festgeschriebene Rechnungen sind unveränderbar.' }
  }
}

export async function loadInvoiceAction(id: string): Promise<InvoiceDraft | null> {
  await requireSession()
  return loadInvoice(id)
}

export async function deleteDraftAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireSession()
  try {
    await deleteDraft(id)
    refresh()
    return { ok: true }
  } catch (error) {
    console.error('deleteDraft failed', error)
    return { ok: false, error: 'Löschen fehlgeschlagen.' }
  }
}

export async function listInvoicesAction(): Promise<InvoiceSummary[]> {
  await requireSession()
  return listInvoices()
}

// Single source of truth for numbering: the client never derives the next
// number from its own copy of the archive.
export async function nextNumberAction(): Promise<string> {
  await requireSession()
  return nextInvoiceNumber(await lastIssuedNumber(), new Date().getFullYear())
}
```

`nextNumberAction` needs `lastIssuedNumber` and `nextInvoiceNumber`, which Task 16 also imports — add both imports now:

```ts
import { lastIssuedNumber } from '@/lib/db/invoices.ts'
import { nextInvoiceNumber } from '@/lib/invoice/numbering.ts'
```

- [ ] **Step 3: Load real data in `app/admin/(protected)/page.tsx`**

```tsx
import { requireSession } from '@/lib/admin/session.ts'
import { loadMasterData } from '@/lib/db/masterData.ts'
import { lastIssuedNumber, listInvoices } from '@/lib/db/invoices.ts'
import { nextInvoiceNumber } from '@/lib/invoice/numbering.ts'
import { AdminApp } from '@/components/admin/AdminApp.tsx'

export default async function AdminHomePage() {
  await requireSession()
  const [masterData, invoices, highest] = await Promise.all([
    loadMasterData(),
    listInvoices(),
    lastIssuedNumber(),
  ])
  return (
    <AdminApp
      masterData={masterData}
      invoices={invoices}
      nextNumber={nextInvoiceNumber(highest, new Date().getFullYear())}
    />
  )
}
```

`AdminApp` gains the `invoices: InvoiceSummary[]` prop here; Task 15 consumes it. Add the prop to its signature now (`invoices`) and pass it through unused until then — TypeScript will keep you honest.

- [ ] **Step 4: Verify against the real database**

```bash
node --env-file=.env.local --conditions=react-server --experimental-strip-types -e "
const { saveDraft, loadInvoice, listInvoices, deleteDraft, lastIssuedNumber } = await import('./lib/db/invoices.ts');
const id = await saveDraft({
  id: null, status: 'draft', invoiceNumber: null, proposedNumber: 'TEST-001',
  invoiceDate: '2026-08-08', serviceDate: 'Juli 2026', customerNumber: '',
  customerName: 'Testkunde GmbH', customerStreet: 'Teststr. 1', customerZipCity: '65195 Wiesbaden',
  customerCountry: 'Deutschland', customerVatId: '', paymentTerms: 'Zahlbar in 14 Tagen.',
  items: [
    { description: 'Entwicklung', quantity: 2, unit: 'Std', unitPrice: 80.5, vatRate: 19 },
    { description: 'Buch', quantity: 1, unit: 'Stk', unitPrice: 100, vatRate: 7 },
  ],
});
const loaded = await loadInvoice(id);
console.log('items:', loaded.items.length, 'qty type:', typeof loaded.items[0].quantity);
// The date must survive the round trip EXACTLY — not one day early.
console.log('invoiceDate:', JSON.stringify(loaded.invoiceDate), 'type:', typeof loaded.invoiceDate);
if (loaded.invoiceDate !== '2026-08-08') throw new Error('invoice_date shifted: ' + loaded.invoiceDate);
console.log('summary:', (await listInvoices()).find(i => i.id === id));
console.log('highest issued:', await lastIssuedNumber());
await deleteDraft(id);
console.log('deleted:', (await loadInvoice(id)) === null);
"
```

Expected: `items: 2 qty type: number`, a summary with `netTotal: 261, vatTotal: 37.59, grossTotal: 298.59`, `highest issued: null`, `deleted: true`.

- [ ] **Step 5: Verify the build**

```bash
npm run build && npm run lint
```

- [ ] **Step 6: Commit**

```bash
git add lib/db/invoices.ts app/admin components/admin/AdminApp.tsx
git commit -m "feat(invoice): add invoice repository and draft actions

Items are replaced inside a transaction; drafts hold no invoice number,
which is only claimed when the invoice is issued."
```

---

## Task 15: Archive tab

**Files:**
- Create: `components/admin/ArchiveTable.tsx`
- Modify: `components/admin/AdminApp.tsx` (render the archive tab, wire save/load/copy/delete)

**Interfaces:**
- Consumes: `InvoiceSummary`, `InvoiceDraft`, `saveDraftAction`, `loadInvoiceAction`, `deleteDraftAction`, `listInvoicesAction`, `formatCurrency`, `formatDateDe`.
- Produces: `<ArchiveTable invoices onLoad onCopy onDelete />`.

**Behaviour by status, from the spec:** *Laden* opens a draft for editing and an issued invoice read-only. *Kopie* always makes a new editable draft with a fresh number and today's date. `✕` exists **only** on drafts. The summary strip sums **issued invoices only**.

- [ ] **Step 1: Write `components/admin/ArchiveTable.tsx`**

```tsx
'use client'

import { formatCurrency, formatDateDe } from '@/lib/invoice/format.ts'
import type { InvoiceSummary } from '@/lib/invoice/types.ts'

export function ArchiveTable({
  invoices,
  onLoad,
  onCopy,
  onDelete,
}: {
  invoices: InvoiceSummary[]
  onLoad: (id: string) => void
  onCopy: (id: string) => void
  onDelete: (id: string) => void
}) {
  // Drafts are not revenue: the strip counts issued invoices only.
  const issued = invoices.filter((i) => i.status === 'issued')
  const sum = (pick: (i: InvoiceSummary) => number) =>
    issued.reduce((total, invoice) => total + pick(invoice), 0)

  if (invoices.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <p className="text-sm text-gray-500">
          Noch keine Rechnungen. Erstelle im Tab „Rechnung erstellen“ eine Rechnung und
          speichere sie – sie erscheint dann hier.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h2 className="admin-accent mb-6 text-lg font-semibold">Meine Rechnungen</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-300 text-left text-xs uppercase text-gray-500">
            <th className="py-2 font-medium">Nummer</th>
            <th className="py-2 font-medium">Datum</th>
            <th className="py-2 font-medium">Kunde</th>
            <th className="py-2 text-right font-medium">Netto</th>
            <th className="py-2 text-right font-medium">USt.</th>
            <th className="py-2 text-right font-medium">Brutto</th>
            <th className="py-2 text-right font-medium">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b border-gray-100">
              <td className="py-2">
                {invoice.invoiceNumber ?? invoice.proposedNumber}
                {invoice.status === 'draft' && (
                  <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-700">
                    Entwurf
                  </span>
                )}
              </td>
              <td className="py-2">{formatDateDe(invoice.invoiceDate)}</td>
              <td className="py-2">{invoice.customerName}</td>
              <td className="py-2 text-right tabular-nums">{formatCurrency(invoice.netTotal)}</td>
              <td className="py-2 text-right tabular-nums">{formatCurrency(invoice.vatTotal)}</td>
              <td className="py-2 text-right tabular-nums">{formatCurrency(invoice.grossTotal)}</td>
              <td className="py-2 text-right">
                <button type="button" onClick={() => onLoad(invoice.id)} className="px-2 text-[#1f5f4f] underline">
                  Laden
                </button>
                <button type="button" onClick={() => onCopy(invoice.id)} className="px-2 text-[#1f5f4f] underline">
                  Kopie
                </button>
                {invoice.status === 'draft' && (
                  <button
                    type="button"
                    aria-label={`Entwurf ${invoice.proposedNumber} löschen`}
                    onClick={() => onDelete(invoice.id)}
                    className="px-2 text-gray-400 hover:text-red-700"
                  >
                    ✕
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex flex-wrap gap-6 border-t border-gray-300 pt-4 text-sm">
        <span>
          Festgeschriebene Rechnungen: <strong>{issued.length}</strong>
        </span>
        <span>
          Gesamt netto: <strong>{formatCurrency(sum((i) => i.netTotal))}</strong>
        </span>
        <span>
          Gesamt USt.: <strong>{formatCurrency(sum((i) => i.vatTotal))}</strong>
        </span>
        <span>
          Gesamt brutto: <strong>{formatCurrency(sum((i) => i.grossTotal))}</strong>
        </span>
        {invoices.length !== issued.length && (
          <span className="text-gray-500">
            ({invoices.length - issued.length} Entwürfe nicht enthalten)
          </span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire the archive into `AdminApp.tsx`**

Add these imports and handlers to the existing component, and replace the archive-tab placeholder with `<ArchiveTable …>`:

```tsx
import { ArchiveTable } from './ArchiveTable.tsx'
import type { InvoiceSummary } from '@/lib/invoice/types.ts'
import {
  deleteDraftAction,
  listInvoicesAction,
  loadInvoiceAction,
  nextNumberAction,
  saveDraftAction,
} from '@/app/admin/(protected)/actions.ts'
```

Inside the component (props now include `invoices: InvoiceSummary[]`):

```tsx
  const [archive, setArchive] = useState(invoices)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function refreshArchive() {
    setArchive(await listInvoicesAction())
  }

  async function saveToArchive() {
    setBusy(true)
    const result = await saveDraftAction(invoice)
    setBusy(false)
    if (!result.ok) return setNotice(result.error)
    setInvoice({ ...invoice, id: result.id })
    await refreshArchive()
    setNotice('Ins Archiv gelegt.')
  }

  async function loadFromArchive(id: string) {
    const loaded = await loadInvoiceAction(id)
    if (!loaded) return setNotice('Rechnung nicht gefunden.')
    setInvoice(loaded)
    setTermsTouched(true) // never overwrite the terms of a stored invoice
    setTab('invoice')
    setNotice(loaded.status === 'issued' ? 'Festgeschriebene Rechnung — nur Ansicht.' : null)
  }

  async function copyFromArchive(id: string) {
    const loaded = await loadInvoiceAction(id)
    if (!loaded) return setNotice('Rechnung nicht gefunden.')
    setInvoice({
      ...loaded,
      // A fresh id: a copy is a NEW invoice, and minting it here keeps the
      // double-click protection that `emptyInvoice` relies on.
      id: newInvoiceId(),
      status: 'draft',
      invoiceNumber: null,
      // Asked of the server, not derived from the client's archive copy.
      proposedNumber: await nextNumberAction(),
      invoiceDate: todayIso(),
    })
    // A copy inherits the original's payment terms, which may have been edited
    // by hand. Without this, a later Zahlungsziel change in Stammdaten would
    // silently overwrite them.
    setTermsTouched(true)
    setTab('invoice')
    setNotice('Kopie erstellt.')
  }

  async function deleteFromArchive(id: string) {
    if (!confirm('Diesen Entwurf wirklich löschen?')) return
    const result = await deleteDraftAction(id)
    if (!result.ok) return setNotice(result.error ?? 'Fehler.')
    await refreshArchive()
    // A fresh id, not null: null would reopen the double-click duplication that
    // client-minted ids exist to prevent.
    if (invoice.id === id) setInvoice({ ...invoice, id: newInvoiceId() })
    setNotice('Entwurf gelöscht.')
  }
```

Imports for this step: `ArchiveTable`, `todayIso` (already imported in Task 13), and from the actions module `deleteDraftAction`, `listInvoicesAction`, `loadInvoiceAction`, `saveDraftAction`, `nextNumberAction`. `nextInvoiceNumber` is **not** imported here — numbering lives on the server.

Render the notice **above the tab content, outside every tab branch** — deleting a draft happens on
the archive tab and does not switch tabs, so a notice rendered only inside the invoice tab would never
be seen for the action that most needs confirming:

```tsx
      {notice && (
        <p className="admin-no-print mx-auto max-w-[840px] px-6 pt-4 text-sm text-gray-600" role="status">
          {notice}
        </p>
      )}
```

Then, in the invoice tab, the button row and the sheet:

```tsx
      {tab === 'invoice' && (
        <>
          <div className="admin-no-print mx-auto flex max-w-[840px] items-center gap-3 px-6 pt-6">
            <button
              type="button"
              onClick={saveToArchive}
              disabled={busy || invoice.status === 'issued'}
              className="rounded bg-[#1f5f4f] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {busy ? 'Speichere …' : 'Ins Archiv legen'}
            </button>
          </div>
          <InvoiceSheet
            invoice={invoice}
            sender={masterData.invoiceVisible}
            totals={totals}
            readOnly={invoice.status === 'issued'}
            onChange={updateInvoice}
          />
        </>
      )}
      {tab === 'archive' && (
        <ArchiveTable
          invoices={archive}
          onLoad={loadFromArchive}
          onCopy={copyFromArchive}
          onDelete={deleteFromArchive}
        />
      )}
```

- [ ] **Step 3: Verify manually**

```bash
npm run dev
```

1. Create an invoice, click **Ins Archiv legen** → "Ins Archiv gelegt."; it appears under **Meine Rechnungen** with the *Entwurf* badge.
2. *Laden* → it returns to the editor; save again → still **one** row, not two.
3. *Kopie* → a new draft with today's date, same customer and items.
4. `✕` on a draft → confirmation, then it disappears.
5. The summary strip reads `Festgeschriebene Rechnungen: 0` with a note that drafts are excluded.
6. Reload the page — everything survives.

- [ ] **Step 4: Verify the build**

```bash
npm run build && npm run lint && npm test
```

- [ ] **Step 5: Commit**

```bash
git add components/admin
git commit -m "feat(invoice): add archive tab with load, copy and draft deletion

The summary strip counts issued invoices only; drafts are marked and
excluded, and only drafts can be deleted."
```

---

## Task 16: Print validation and festschreiben

**Files:**
- Create: `lib/invoice/validate.ts`, `lib/invoice/validate.test.ts`
- Modify: `app/admin/(protected)/actions.ts` (add `issueInvoiceAction`), `components/admin/AdminApp.tsx` (print button flow), `package.json` (add `validate.test.ts` to the `test` script)

**Interfaces:**
- Consumes: `InvoiceDraft`, `computeTotals`, `issueInvoice`, `lastIssuedNumber`, `nextInvoiceNumber`, `loadMasterData`.
- Produces:
  - `validateForPrint(invoice: InvoiceDraft): string[]` — German messages, empty when valid
  - `issueInvoiceAction(id: string, proposedNumber: string): Promise<{ ok: true; invoiceNumber: string } | { ok: false; error: string }>`

- [ ] **Step 1: Write the failing test**

`lib/invoice/validate.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateForPrint } from './validate.ts'
import type { InvoiceDraft } from './types.ts'

function invoice(patch: Partial<InvoiceDraft> = {}): InvoiceDraft {
  return {
    id: null,
    status: 'draft',
    invoiceNumber: null,
    proposedNumber: '2026-001',
    invoiceDate: '2026-08-08',
    serviceDate: 'Juli 2026',
    customerNumber: '',
    customerName: 'Testkunde GmbH',
    customerStreet: 'Teststr. 1',
    customerZipCity: '65195 Wiesbaden',
    customerCountry: 'Deutschland',
    customerVatId: '',
    paymentTerms: 'Zahlbar in 14 Tagen.',
    items: [{ description: 'Entwicklung', quantity: 2, unit: 'Std', unitPrice: 80.5, vatRate: 19 }],
    ...patch,
  }
}

test('a complete invoice has no errors', () => {
  assert.deepEqual(validateForPrint(invoice()), [])
})

test('requires the customer name', () => {
  assert.ok(validateForPrint(invoice({ customerName: '  ' })).some((m) => m.includes('Kundenname')))
})

test('requires a customer address', () => {
  const errors = validateForPrint(invoice({ customerStreet: '', customerZipCity: '' }))
  assert.ok(errors.some((m) => m.includes('Adresse')))
})

test('requires an invoice number, invoice date and service date', () => {
  assert.ok(validateForPrint(invoice({ proposedNumber: '' })).some((m) => m.includes('Rechnungsnummer')))
  assert.ok(validateForPrint(invoice({ invoiceDate: '' })).some((m) => m.includes('Rechnungsdatum')))
  assert.ok(validateForPrint(invoice({ serviceDate: '' })).some((m) => m.includes('Leistung')))
})

test('requires at least one line item with a description and a price above zero', () => {
  const noItems = validateForPrint(invoice({ items: [] }))
  assert.ok(noItems.some((m) => m.includes('Position')))

  const emptyDescription = validateForPrint(
    invoice({ items: [{ description: '', quantity: 1, unit: 'Std', unitPrice: 80, vatRate: 19 }] })
  )
  assert.ok(emptyDescription.some((m) => m.includes('Position')))

  const zeroPrice = validateForPrint(
    invoice({ items: [{ description: 'Arbeit', quantity: 1, unit: 'Std', unitPrice: 0, vatRate: 19 }] })
  )
  assert.ok(zeroPrice.some((m) => m.includes('Position')))
})

test('an issued invoice validates on its assigned number', () => {
  const issued = invoice({ status: 'issued', invoiceNumber: '2026-001', proposedNumber: '' })
  assert.deepEqual(validateForPrint(issued), [])
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
node --experimental-strip-types --test lib/invoice/validate.test.ts
```

Expected: FAIL — cannot find module `./validate.ts`.

- [ ] **Step 3: Write `lib/invoice/validate.ts`**

```ts
import type { InvoiceDraft } from './types.ts'

// § 14 UStG mandatory fields, checked before printing. Validation happens on
// the print button because a beforeprint handler cannot cancel a print.
export function validateForPrint(invoice: InvoiceDraft): string[] {
  const errors: string[] = []
  const filled = (value: string) => value.trim().length > 0

  if (!filled(invoice.customerName)) errors.push('Kundenname fehlt.')
  if (!filled(invoice.customerStreet) || !filled(invoice.customerZipCity)) {
    errors.push('Adresse des Kunden ist unvollständig.')
  }

  const number = invoice.status === 'issued' ? (invoice.invoiceNumber ?? '') : invoice.proposedNumber
  if (!filled(number)) errors.push('Rechnungsnummer fehlt.')
  if (!filled(invoice.invoiceDate)) errors.push('Rechnungsdatum fehlt.')
  if (!filled(invoice.serviceDate)) errors.push('Leistungsdatum bzw. Leistungszeitraum fehlt.')

  const usable = invoice.items.filter((item) => filled(item.description) && item.unitPrice > 0)
  if (usable.length === 0) {
    errors.push('Mindestens eine Position mit Beschreibung und Preis über 0 € ist erforderlich.')
  }

  return errors
}
```

- [ ] **Step 4: Run the test to verify it passes and add it to the suite**

```bash
node --experimental-strip-types --test lib/invoice/validate.test.ts
```

Expected: `# pass 6`, `# fail 0`. Then append `lib/invoice/validate.test.ts` to the `test` script in `package.json` and run `npm test` — all seven files green.

- [ ] **Step 5: Add `issueInvoiceAction` to `app/admin/(protected)/actions.ts`**

```ts
import { lastIssuedNumber, issueInvoice } from '@/lib/db/invoices.ts'
import { nextInvoiceNumber } from '@/lib/invoice/numbering.ts'
import { loadMasterData } from '@/lib/db/masterData.ts'

export async function issueInvoiceAction(
  id: string,
  proposedNumber: string
): Promise<{ ok: true; invoiceNumber: string } | { ok: false; error: string }> {
  await requireSession()

  // The number is claimed here, never by a draft: that is what keeps the
  // sequence gapless when a draft is deleted.
  const number =
    proposedNumber.trim() ||
    nextInvoiceNumber(await lastIssuedNumber(), new Date().getFullYear())

  const masterData = await loadMasterData()
  // Only the invoice-visible half is frozen into the snapshot.
  const result = await issueInvoice(id, number, masterData.invoiceVisible)

  if (!result.ok) {
    refresh()
    return {
      ok: false,
      error:
        result.error === 'number_taken'
          ? `Die Rechnungsnummer ${number} ist bereits vergeben. Bitte eine andere Nummer wählen.`
          : 'Diese Rechnung ist bereits festgeschrieben.',
    }
  }

  refresh()
  return { ok: true, invoiceNumber: number }
}
```

- [ ] **Step 6: Add the print flow to `AdminApp.tsx`**

Import `validateForPrint` and `issueInvoiceAction`, then add:

```tsx
  const [printErrors, setPrintErrors] = useState<string[]>([])

  async function printInvoice() {
    const errors = validateForPrint(invoice)
    setPrintErrors(errors)
    if (errors.length) return

    if (invoice.status === 'draft') {
      const ok = confirm(
        'Rechnung festschreiben? Danach ist sie nicht mehr änderbar. ' +
          'Eine Korrektur erfolgt später über eine neue Rechnung.'
      )
      if (!ok) return

      setBusy(true)
      const saved = await saveDraftAction(invoice)
      if (!saved.ok) {
        setBusy(false)
        return setNotice(saved.error)
      }
      const issued = await issueInvoiceAction(saved.id, invoice.proposedNumber)
      setBusy(false)
      if (!issued.ok) return setNotice(issued.error)

      setInvoice({
        ...invoice,
        id: saved.id,
        status: 'issued',
        invoiceNumber: issued.invoiceNumber,
      })
      await refreshArchive()
      setNotice(`Festgeschrieben als ${issued.invoiceNumber}.`)
    }

    window.print()
  }
```

Render next to "Ins Archiv legen":

```tsx
            <button
              type="button"
              onClick={printInvoice}
              disabled={busy}
              className="rounded border border-[#1f5f4f] px-4 py-2 text-sm font-medium text-[#1f5f4f] disabled:opacity-60"
            >
              Drucken / PDF
            </button>
```

And below the button row:

```tsx
          {printErrors.length > 0 && (
            <div
              role="alert"
              className="admin-no-print mx-auto mt-3 max-w-[840px] rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              <p className="mb-1 font-semibold">Die Rechnung ist noch nicht vollständig:</p>
              <ul className="list-inside list-disc">
                {printErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
```

- [ ] **Step 7: Verify the print output on real paper (or PDF)**

```bash
npm run dev
```

1. Click **Drucken / PDF** on an empty invoice → the red list appears, no print dialog opens.
2. Fill everything in, add a long description (~200 characters) and leave *Kundennummer* and the customer's USt-IdNr empty. Add an extra empty line item.
3. Click **Drucken / PDF** → confirmation appears. Confirm → the notice shows the assigned number and the print dialog opens.
4. In the print preview verify all six: **(a)** the date reads `DD.MM.YYYY`; **(b)** no grey placeholder text anywhere; **(c)** no *Kundennummer* row; **(d)** the empty line item is absent; **(e)** the long description wraps fully and is not cut off; **(f)** no toolbar, tabs, buttons, delete column or dropdown arrows.
5. Cancel the dialog. The invoice is now issued: fields are read-only, "Ins Archiv legen" is disabled, and `✕` is gone from its archive row.
6. Try printing it again → prints immediately with no confirmation.
7. In the archive, the summary strip now counts 1 issued invoice.

- [ ] **Step 8: Verify the build**

```bash
npm run build && npm run lint && npm test
```

- [ ] **Step 9: Commit**

```bash
git add lib/invoice/validate.ts lib/invoice/validate.test.ts app/admin components/admin package.json
git commit -m "feat(invoice): add print validation and festschreiben flow

Mandatory § 14 UStG fields are checked on the print button, then the
invoice number is claimed and the sender snapshot frozen in one step."
```

---

## Task 17: Playwright end-to-end suite

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/auth.setup.ts`, `tests/e2e/auth.spec.ts`, `tests/e2e/invoice.spec.ts`, `tests/e2e/print.spec.ts`
- Modify: `package.json` (add `@playwright/test`, `test:e2e`), `.gitignore` (ignore Playwright output)

**Interfaces:**
- Consumes: the running app and `ADMIN_PASSWORD` from `.env.local`.
- Produces: `npm run test:e2e`.

**No test-only auth bypass.** The setup project logs in through the real form and saves the cookie; adding a backdoor would defeat the thing being tested.

- [ ] **Step 1: Install Playwright and its browser**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Ignore Playwright output**

Append to `.gitignore`:

```
/test-results/
/playwright-report/
/tests/e2e/.auth/
```

- [ ] **Step 3: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // one database, shared state
  workers: 1,
  use: { baseURL },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/owner.json' },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

- [ ] **Step 4: Write `tests/e2e/auth.setup.ts`**

```ts
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
```

- [ ] **Step 5: Write `tests/e2e/auth.spec.ts`**

```ts
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
    await expect(page.getByRole('alert')).toHaveText('Anmeldung fehlgeschlagen.')
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
```

- [ ] **Step 6: Write `tests/e2e/invoice.spec.ts`**

```ts
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

test('a German decimal price is not swallowed and totals compute per rate', async ({ page }) => {
  await page.goto('/admin')
  await fillInvoice(page, 'Testkunde Totals')

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
  await fillInvoice(page, 'Testkunde Archiv')
  await page.getByRole('button', { name: 'Ins Archiv legen' }).click()
  await expect(page.getByText('Ins Archiv gelegt.')).toBeVisible()

  await page.getByRole('button', { name: 'Meine Rechnungen' }).click()
  const row = page.getByRole('row', { name: /Testkunde Archiv/ })
  await expect(row).toBeVisible()
  await expect(row.getByText('Entwurf')).toBeVisible()

  await row.getByRole('button', { name: 'Kopie' }).click()
  await expect(page.getByText('Kopie erstellt.')).toBeVisible()
  await expect(page.getByLabel('Kundenname')).toHaveValue('Testkunde Archiv')

  await page.getByRole('button', { name: 'Meine Rechnungen' }).click()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('row', { name: /Testkunde Archiv/ }).first()
    .getByRole('button', { name: /löschen/ }).click()
  await expect(page.getByText('Entwurf gelöscht.')).toBeVisible()
})

test('an issued invoice cannot be edited or deleted', async ({ page }) => {
  await page.goto('/admin')
  await fillInvoice(page, 'Testkunde Festschreiben')
  await page.getByLabel('Rechnungsnummer').fill(`E2E-${Date.now()}`)

  page.once('dialog', (dialog) => dialog.accept()) // festschreiben confirmation
  await page.getByRole('button', { name: 'Drucken / PDF' }).click()

  await expect(page.getByText(/Festgeschrieben als E2E-/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ins Archiv legen' })).toBeDisabled()
  await expect(page.getByLabel('Kundenname')).toHaveAttribute('readonly', '')

  await page.getByRole('button', { name: 'Meine Rechnungen' }).click()
  const row = page.getByRole('row', { name: /Testkunde Festschreiben/ })
  await expect(row.getByRole('button', { name: /löschen/ })).toHaveCount(0)
  await expect(page.getByText(/Festgeschriebene Rechnungen: [1-9]/)).toBeVisible()
})

test('incomplete invoices are refused before printing', async ({ page }) => {
  await page.goto('/admin')
  await page.getByRole('button', { name: 'Drucken / PDF' }).click()
  const alert = page.getByRole('alert')
  await expect(alert).toContainText('Kundenname fehlt.')
  await expect(alert).toContainText('Mindestens eine Position')
})
```

**Note on `window.print()` in tests:** Chromium's print dialog does not block Playwright in headless mode, so the assertions after the click run normally. If a run ever hangs on the dialog, add `await page.addInitScript(() => { window.print = () => {} })` at the top of that test.

- [ ] **Step 7: Write `tests/e2e/print.spec.ts`**

```ts
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

  test('empty optional fields print nothing at all', async ({ page }) => {
    await expect(page.getByText('optional')).toHaveCount(0)
    await expect(page.getByText('USt-IdNr. des Kunden (optional)')).toHaveCount(0)
  })

  test('empty line items are hidden', async ({ page }) => {
    await page.emulateMedia({ media: 'screen' })
    await page.getByRole('button', { name: '+ Position hinzufügen' }).click()
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('tr[data-empty="true"]')).toBeHidden()
  })

  test('toolbar, tabs and inputs are hidden', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Drucken / PDF' })).toBeHidden()
    await expect(page.getByRole('button', { name: 'Meine Rechnungen' })).toBeHidden()
    await expect(page.getByLabel('Kundenname')).toBeHidden()
    await expect(page.getByLabel('Steuersatz Position 1')).toBeHidden()
  })
})
```

- [ ] **Step 8: Add the E2E script to `package.json`**

`node --env-file` supplies `ADMIN_PASSWORD` and `DATABASE_URL` to the Playwright process.

```json
"test:e2e": "node --env-file=.env.local node_modules/@playwright/test/cli.js test"
```

- [ ] **Step 9: Run the suite**

```bash
npm run test:e2e
```

Expected: all specs pass. If the CLI path does not resolve, fall back to:

```bash
set -a && . ./.env.local && set +a && npx playwright test
```

- [ ] **Step 9b: Confirm the immutability trigger blocks the cleanup**

The suite issues invoices, and issued rows are protected — so first prove the protection is real, because the next step deliberately works around it.

```bash
node --env-file=.env.local --conditions=react-server --experimental-strip-types -e "
const { sql } = await import('./lib/db/client.ts');
try {
  await sql\`delete from invoices where status = 'issued' and invoice_number like 'E2E-%'\`;
  console.log('UNEXPECTED: the trigger did not block the delete — investigate before continuing');
} catch (error) {
  console.log('expected block:', String(error).split('\n')[0]);
}
"
```

Expected: `expected block: … is issued and immutable`. If it prints `UNEXPECTED`, the trigger from Task 2 is missing — re-run `npm run db:migrate` and check it exists before going on.

- [ ] **Step 9c: Clean up the E2E rows**

Drafts delete normally. Issued E2E rows need the trigger disabled for the duration — safe **only** because every E2E invoice number carries the `E2E-` prefix, so this can never touch a real invoice.

```bash
node --env-file=.env.local --conditions=react-server --experimental-strip-types -e "
const { sql } = await import('./lib/db/client.ts');
// Drafts first — no trigger involved.
const drafts = await sql\`delete from invoices where status = 'draft' and (customer_name like 'Testkunde%' or customer_name like 'Druck Testkunde%') returning id\`;
console.log('drafts deleted:', drafts.length);
// Issued E2E rows: scoped strictly to the E2E- prefix.
await sql\`alter table invoices disable trigger invoices_immutable_when_issued\`;
try {
  const issued = await sql\`delete from invoices where status = 'issued' and invoice_number like 'E2E-%' returning invoice_number\`;
  console.log('issued E2E deleted:', issued.map(r => r.invoice_number));
} finally {
  await sql\`alter table invoices enable trigger invoices_immutable_when_issued\`;
  console.log('trigger re-enabled');
}
"
```

Expected: a draft count, the deleted `E2E-…` numbers, and `trigger re-enabled`. Re-run step 9b afterwards to confirm the protection is back on.

**Alternative if you prefer never to disable the trigger:** leave the E2E invoices in the database and start your real numbering above them (e.g. `2026-001` while the test rows are all `E2E-…`). The prefixes do not collide, so nothing forces their removal — the numbering sequence derived from `lastIssuedNumber()` would then continue from an `E2E-` number, so set the first real number by hand.

- [ ] **Step 10: Commit**

```bash
git add playwright.config.ts tests package.json package-lock.json .gitignore
git commit -m "test(admin): add Playwright end-to-end suite

Covers the auth boundary (including a Server Action without a session),
German decimal input, per-rate VAT, archive actions, immutability of
issued invoices and all print traps."
```

---

## Task 18: Deploy to Vercel

**Files:**
- Modify: none (configuration and verification only)

**Interfaces:**
- Consumes: everything above.
- Produces: a working `/admin` on the production domain.

- [ ] **Step 1: Add the secrets to Vercel**

`ADMIN_PASSWORD` must be a **new, long, unique** password — not the local development one.

```bash
vercel env add ADMIN_PASSWORD production
vercel env add ADMIN_PASSWORD preview
vercel env add ADMIN_PASSWORD development
vercel env add SESSION_SECRET production
vercel env add SESSION_SECRET preview
vercel env add SESSION_SECRET development
vercel env ls
```

`DATABASE_URL` was added by the Neon integration in Task 2 — confirm it appears for production in `vercel env ls`.

- [ ] **Step 2: Apply the schema to the production database**

```bash
vercel env pull .env.production.local --environment production
node --env-file=.env.production.local db/migrate.mjs
rm .env.production.local
```

Expected: `schema applied`. Confirm `.env.production.local` is gitignored **before** running this (`git check-ignore -v .env.production.local`).

- [ ] **Step 3: Deploy a preview and verify it**

```bash
vercel deploy
```

On the preview URL: `/admin` redirects to the login, the production password works, Stammdaten shows your data, and one test invoice computes and prints correctly.

- [ ] **Step 4: Verify the admin area is not indexable**

```bash
curl -sI "<preview-url>/admin/login" | grep -i "x-robots-tag"
curl -s "<preview-url>/admin/login" | grep -i "noindex"
```

Expected: a `noindex` signal is present (Next emits the `robots` metadata as a meta tag; the header may be absent, which is fine).

- [ ] **Step 5: Verify the public site is unchanged in production**

Open `/`, `/contact`, `/experience`, `/network`, `/work`, `/work/sales-dashboard` on the preview URL. Navbar, footer, dark mode and language switching must behave exactly as before Task 1.

- [ ] **Step 6: Promote to production**

```bash
vercel deploy --prod
```

- [ ] **Step 7: Final verification on the live domain**

1. Sign in at `https://silicortex.de/admin`.
2. Create one real invoice end to end and print it to PDF.
3. **Have your Steuerberater check that PDF before sending a real invoice** — mandatory fields, VAT presentation and the absence of any § 19 notice.
4. Confirm the internal "Nur zur Ablage" values appear **nowhere** in the printed PDF (search the PDF text for your Steuer-IdNr).
5. `git log --oneline` and `git show --stat` on the last few commits: confirm no master data, password or connection string was ever committed.

- [ ] **Step 8: Commit any remaining local changes**

```bash
git status --short
```

Expected: clean, or only intended files. Nothing in `.env*`.

---

## Task 19: Restore the marketing chrome on the public 404

**Files:**
- Create: `components/SiteChrome.tsx`, `app/not-found.tsx`
- Modify: `app/(site)/layout.tsx` (delegate to `SiteChrome`)

**Interfaces:**
- Consumes: `NavbarClient`, `ThemeProvider`, `LangProvider`, `siteConfig`, `SpeedInsights`, `Analytics`.
- Produces: `<SiteChrome>` — the marketing shell, shared by the `(site)` layout and the 404 page.

**Why this task exists.** Task 1 moved the chrome out of the root layout so `/admin` could be bare. An
unmatched URL renders `app/not-found.tsx` inside the **root** layout, not inside `(site)`, so the public
404 lost its navbar and footer — a visible regression from before the refactor. The owner ruled it gets
full chrome back. Extracting `SiteChrome` keeps one copy of the chrome instead of two.

- [ ] **Step 1: Create `components/SiteChrome.tsx`, moving the markup out of the `(site)` layout**

```tsx
import { LangProvider } from "@/components/providers/LangProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { NavbarClient } from "@/components/NavbarClient"
import { siteConfig } from "@/lib/siteConfig"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

// The marketing shell, shared by the (site) layout and the root not-found
// page. Unmatched URLs render app/not-found.tsx inside the ROOT layout, which
// stays deliberately bare so /admin inherits nothing — so the 404 page has to
// bring the chrome with it instead of inheriting it.
export function SiteChrome({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ThemeProvider>
        <LangProvider>
          <NavbarClient />
          {children}
          <footer className="border-t border-black/5 bg-white px-6 py-8 text-center dark:border-white/5 dark:bg-slate-950">
            <p className="mb-1 text-xs text-slate-400 dark:text-slate-600">
              {siteConfig.name} — {siteConfig.slogan}
            </p>
            <p className="text-xs text-slate-300 dark:text-slate-700">
              © 2026 {siteConfig.name}. All rights reserved.
            </p>
          </footer>
        </LangProvider>
      </ThemeProvider>
      <SpeedInsights />
      <Analytics />
    </>
  )
}
```

- [ ] **Step 2: Reduce `app/(site)/layout.tsx` to a delegation**

The footer markup and provider nesting must exist in exactly one place.

```tsx
import { SiteChrome } from "@/components/SiteChrome"

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteChrome>{children}</SiteChrome>
}
```

- [ ] **Step 3: Create `app/not-found.tsx`**

English text, matching the site's `html lang="en"`. The admin area is unaffected — it has its own
layout and never renders this page.

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { SiteChrome } from "@/components/SiteChrome"

export const metadata: Metadata = {
  title: "Page not found",
}

export default function NotFound() {
  return (
    <SiteChrome>
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-2 font-mono text-sm text-slate-400 dark:text-slate-500">404</p>
        <h1 className="mb-3 text-2xl font-semibold">This page does not exist</h1>
        <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
          The link may be outdated, or the address slightly off.
        </p>
        <Link
          href="/"
          className="rounded-full border border-black/10 px-5 py-2 text-sm font-medium transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
        >
          Back to home
        </Link>
      </main>
    </SiteChrome>
  )
}
```

- [ ] **Step 4: Verify the 404 has chrome and `/admin` still does not**

```bash
npm run build && npm run lint
npm run dev
```

With the dev server running:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/definitely-not-a-page
curl -s http://localhost:3000/definitely-not-a-page | grep -c "All rights reserved"
curl -s http://localhost:3000/definitely-not-a-page | grep -c "<nav"
curl -s http://localhost:3000/admin/login | grep -c "All rights reserved"
```

Expected: `404`, then `1` and `1` (chrome present on the 404). Also re-check that `/` and one other
public route still render their navbar and footer.

**The fourth check cannot pass yet, and that is correct.** If `app/admin/` does not exist at this point,
`/admin/login` is itself an unmatched URL, so it returns HTTP 404 and renders this very page — chrome
included. Confirm the status code is 404 to prove it is the not-found page rather than chrome leaking,
then treat the check as deferred: it belongs to Task 7, which creates the bare admin layout. If Task 7
has already run, the expectation is `0` and a non-zero result is a real defect.

- [ ] **Step 5: Commit**

```bash
git add components/SiteChrome.tsx app/not-found.tsx "app/(site)/layout.tsx"
git commit -m "fix: restore marketing chrome on the public 404 page

Task 1 moved the chrome into the (site) route group so /admin could be
bare, which left unmatched URLs rendering a chromeless 404 inside the
root layout. Extracts SiteChrome so the (site) layout and the 404 page
share one copy, and adds app/not-found.tsx using it."
```

---

## Task 21: Permanent schema-guarantee test (PGlite)

**Files:**
- Create: `db/schema.test.mjs`
- Modify: `package.json` (add `@electric-sql/pglite` as a devDependency and a `test:schema` script)

**Interfaces:**
- Consumes: `db/schema.sql`.
- Produces: `npm run test:schema` — applies the real schema to an in-process Postgres and asserts the guarantees the invoicing design depends on.

**Why this exists.** The immutability of an issued invoice, and the gapless-numbering design that rests on
`invoice_number` being nullable, are *database* guarantees. Nothing in the test suite proves they hold —
and a future migration could drop the trigger with every test still green. `@electric-sql/pglite` is
PostgreSQL 18.3 compiled to WASM, running in-process with `plpgsql` available, so these properties can be
tested with no provisioning, no credentials and no network. Verified working in this environment before
this task was written.

This complements the live smoke test in Task 2 step 9; it does not replace it. PGlite is not the Neon HTTP
driver, so driver-level behaviour still needs the real database.

- [ ] **Step 1: Install PGlite as a devDependency**

```bash
npm install -D @electric-sql/pglite
```

- [ ] **Step 2: Write `db/schema.test.mjs`**

Plain `.mjs` (no type stripping needed), run directly by Node. It reads the real `db/schema.sql` — never
a copy — so drift between the test and the shipped schema is impossible.

```js
// Applies db/schema.sql to an in-process Postgres (PGlite, PostgreSQL 18 in
// WASM) and asserts the guarantees the invoicing design rests on:
//   - an issued invoice cannot be updated or deleted, at the DATABASE level
//   - a draft holds no invoice number, so deleting one leaves no gap
//   - invoice numbers are unique once issued
//   - the whole schema is idempotent
// No provisioning, credentials or network needed.
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PGlite } from '@electric-sql/pglite'

const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8')
const statements = schema
  .split(/^-- @@$/m)
  .map((s) => s.trim())
  .filter(Boolean)

async function freshDb() {
  const db = await PGlite.create()
  for (const statement of statements) await db.exec(statement)
  return db
}

test('the schema applies, and applies again unchanged', async () => {
  const db = await freshDb()
  for (const statement of statements) await db.exec(statement)
  const tables = await db.query(
    `select table_name from information_schema.tables
     where table_schema = 'public' order by 1`
  )
  assert.deepEqual(
    tables.rows.map((r) => r.table_name),
    ['invoice_items', 'invoices', 'login_attempts', 'master_data']
  )
  const seeded = await db.query('select count(*)::int as n from master_data')
  assert.equal(seeded.rows[0].n, 1)
})

test('drafts hold no invoice number, so two may share a proposed number', async () => {
  const db = await freshDb()
  await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-001', '2026-08-08', 'A')`
  )
  await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-001', '2026-08-08', 'B')`
  )
  const drafts = await db.query(
    `select count(*)::int as n from invoices where invoice_number is null`
  )
  assert.equal(drafts.rows[0].n, 2)
})

test('an issued invoice cannot be updated or deleted', async () => {
  const db = await freshDb()
  const inserted = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-001', '2026-08-08', 'Kundin') returning id`
  )
  const id = inserted.rows[0].id

  // The one transition the trigger must permit: OLD.status is still 'draft'.
  await db.query(
    `update invoices set status = 'issued', invoice_number = '2026-001',
     issued_at = now() where id = $1 and status = 'draft'`,
    [id]
  )

  await assert.rejects(
    () => db.query(`update invoices set customer_name = 'TAMPERED' where id = $1`, [id]),
    /issued and immutable/
  )
  await assert.rejects(
    () => db.query(`delete from invoices where id = $1`, [id]),
    /issued and immutable/
  )

  const row = await db.query(`select customer_name from invoices where id = $1`, [id])
  assert.equal(row.rows[0].customer_name, 'Kundin')
})

test('an issued invoice number cannot be reused', async () => {
  const db = await freshDb()
  const a = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-001', '2026-08-08', 'A') returning id`
  )
  const b = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-001', '2026-08-08', 'B') returning id`
  )
  await db.query(
    `update invoices set status = 'issued', invoice_number = '2026-001'
     where id = $1 and status = 'draft'`,
    [a.rows[0].id]
  )
  await assert.rejects(
    () =>
      db.query(
        `update invoices set status = 'issued', invoice_number = '2026-001'
         where id = $1 and status = 'draft'`,
        [b.rows[0].id]
      ),
    /duplicate key|unique/i
  )
})

test('deleting a draft cascades to its line items', async () => {
  const db = await freshDb()
  const draft = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-002', '2026-08-08', 'A') returning id`
  )
  const id = draft.rows[0].id
  await db.query(
    `insert into invoice_items (invoice_id, line_no, description, unit_price, net_amount)
     values ($1, 1, 'Entwicklung', 80.50, 80.50)`,
    [id]
  )
  await db.query(`delete from invoices where id = $1 and status = 'draft'`, [id])
  const items = await db.query(
    `select count(*)::int as n from invoice_items where invoice_id = $1`,
    [id]
  )
  assert.equal(items.rows[0].n, 0)
})

// Documents the driver behaviour the repository modules must handle: money
// arrives as a STRING, so arithmetic on a raw column value would concatenate.
test('numeric columns are returned as strings, not numbers', async () => {
  const db = await freshDb()
  const invoice = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-003', '2026-08-08', 'A') returning id`
  )
  await db.query(
    `insert into invoice_items (invoice_id, line_no, description, quantity, unit_price, net_amount)
     values ($1, 1, 'Entwicklung', 2, 80.50, 161.00)`,
    [invoice.rows[0].id]
  )
  const items = await db.query(`select quantity, unit_price from invoice_items`)
  assert.equal(typeof items.rows[0].quantity, 'string')
  assert.equal(typeof items.rows[0].unit_price, 'string')
})
```

- [ ] **Step 3: Add the script to `package.json`**

```json
"test:schema": "node --test db/schema.test.mjs"
```

- [ ] **Step 4: Run it**

```bash
npm run test:schema
```

Expected: 6 tests pass. Then prove the immutability test has teeth: comment out the
`create trigger invoices_immutable_when_issued` statement in a **copy** of `db/schema.sql` under `/tmp`,
point a scratch script at that copy, and confirm the "cannot be updated or deleted" test fails. Restore
nothing in the repo — the copy is in `/tmp`. Report both outcomes.

- [ ] **Step 5: Commit**

```bash
git add db/schema.test.mjs package.json package-lock.json
git commit -m "test(db): assert schema guarantees against in-process Postgres

Immutability of issued invoices and the nullable invoice_number that
keeps numbering gapless are database guarantees, and nothing tested
them — a migration could drop the trigger with every test still green.
PGlite runs PostgreSQL 18 in WASM, so these hold without provisioning,
credentials or network. Also pins the driver behaviour that numeric
columns come back as strings."
```

---

## Task 22: Close two immutability gaps in the schema

**Files:**
- Modify: `db/schema.sql` (three new `-- @@` statements plus one comment), `db/schema.test.mjs` (three new tests)

**Interfaces:**
- Consumes: the existing schema from Task 2 and the PGlite harness from Task 21.
- Produces: no new exports. The schema goes from 9 statements to 13.

**Why.** Task 2's review found that the immutability trigger guards the `invoices` row but **not
`invoice_items`**. An issued invoice's line items could therefore be updated, deleted, or added to —
prices, quantities and descriptions altered — while the parent row still read `status = 'issued'`. The
invoice would appear frozen while its contents were not, which defeats the reason this design was chosen
over storing JSON files. The same review noted nothing forces an issued row to actually *have* its number,
`issued_at` and `sender_snapshot`, so a row could be frozen in an incomplete state and then be unfixable
by the very trigger protecting it.

Both fixes below were prototyped against PGlite before this task was written: the item guard blocks
UPDATE, DELETE and INSERT on an issued invoice's items, still allows editing a draft's items, and still
allows a draft's cascade delete.

- [ ] **Step 1: Add the line-item guard to `db/schema.sql`**

Append these as three new `-- @@`-separated statements, after the existing trigger.

```sql
-- @@
-- The invoices trigger alone is not enough: without this, an issued invoice's
-- line items could still be edited, deleted or added to, leaving a row that
-- says 'issued' above contents that changed.
create or replace function forbid_issued_invoice_item_changes() returns trigger as $$
declare
  parent_status text;
begin
  if tg_op in ('UPDATE','DELETE') then
    select status into parent_status from invoices where id = old.invoice_id;
    if parent_status = 'issued' then
      raise exception 'invoice % is issued; its line items are immutable', old.invoice_id;
    end if;
  end if;
  if tg_op in ('INSERT','UPDATE') then
    select status into parent_status from invoices where id = new.invoice_id;
    if parent_status = 'issued' then
      raise exception 'invoice % is issued; its line items are immutable', new.invoice_id;
    end if;
  end if;
  -- A missing parent means the invoice is being deleted in this same
  -- transaction (a draft's cascade), which is legitimate and falls through.
  return case when tg_op = 'DELETE' then old else new end;
end;
$$ language plpgsql
-- @@
drop trigger if exists invoice_items_immutable_when_issued on invoice_items
-- @@
create trigger invoice_items_immutable_when_issued
  before insert or update or delete on invoice_items
  for each row execute function forbid_issued_invoice_item_changes()
```

- [ ] **Step 2: Add the issued-completeness constraint to `db/schema.sql`**

One more `-- @@` statement. Wrapped in a `do` block because `alter table ... add constraint` has no
`if not exists`, and every statement in this file must be re-runnable.

```sql
-- @@
-- An issued invoice must be complete, or the trigger above would freeze a row
-- that is missing its own number, timestamp or sender snapshot — unfixable
-- afterwards without DDL.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'invoices_issued_complete') then
    alter table invoices add constraint invoices_issued_complete check (
      status = 'draft'
      or (invoice_number is not null and issued_at is not null and sender_snapshot is not null)
    );
  end if;
end $$
```

- [ ] **Step 3: Note the one bypass that remains**

Add this comment directly above the `invoices` trigger definition, so the guarantee is not overstated:

```sql
-- Note: row-level triggers do not fire for TRUNCATE. That is not reachable
-- through the application's SQL, but a manual TRUNCATE would bypass both
-- guards.
```

- [ ] **Step 4: Add three tests to `db/schema.test.mjs`**

```js
test('an issued invoice\'s line items cannot be changed, deleted or added to', async () => {
  const db = await freshDb()
  const invoice = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-010', '2026-08-08', 'Kundin') returning id`
  )
  const id = invoice.rows[0].id
  await db.query(
    `insert into invoice_items (invoice_id, line_no, description, quantity, unit_price, vat_rate, net_amount)
     values ($1, 1, 'Entwicklung', 2, 80.50, 19, 161.00)`,
    [id]
  )
  // Editable while the invoice is still a draft.
  await db.query(`update invoice_items set unit_price = 90.00 where invoice_id = $1`, [id])

  await db.query(
    `update invoices set status = 'issued', invoice_number = '2026-010',
     issued_at = now(), sender_snapshot = '{"name":"X"}'::jsonb
     where id = $1 and status = 'draft'`,
    [id]
  )

  await assert.rejects(
    () => db.query(`update invoice_items set unit_price = 1 where invoice_id = $1`, [id]),
    /line items are immutable/
  )
  await assert.rejects(
    () => db.query(`delete from invoice_items where invoice_id = $1`, [id]),
    /line items are immutable/
  )
  await assert.rejects(
    () =>
      db.query(
        `insert into invoice_items (invoice_id, line_no, description, unit_price, net_amount)
         values ($1, 2, 'Zusatz', 999, 999)`,
        [id]
      ),
    /line items are immutable/
  )

  const items = await db.query(
    `select unit_price from invoice_items where invoice_id = $1`,
    [id]
  )
  assert.equal(items.rows.length, 1)
  assert.equal(items.rows[0].unit_price, '90.00')
})

test('an invoice cannot be issued without a number, timestamp and snapshot', async () => {
  const db = await freshDb()
  const invoice = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-011', '2026-08-08', 'A') returning id`
  )
  await assert.rejects(
    () => db.query(`update invoices set status = 'issued' where id = $1`, [invoice.rows[0].id]),
    /invoices_issued_complete|check constraint/i
  )
})

test('the line-item guard does not block a draft cascade delete', async () => {
  const db = await freshDb()
  const draft = await db.query(
    `insert into invoices (proposed_number, invoice_date, customer_name)
     values ('2026-012', '2026-08-08', 'A') returning id`
  )
  const id = draft.rows[0].id
  await db.query(
    `insert into invoice_items (invoice_id, line_no, description, unit_price, net_amount)
     values ($1, 1, 'Entwicklung', 5, 5)`,
    [id]
  )
  await db.query(`delete from invoices where id = $1 and status = 'draft'`, [id])
  const items = await db.query(
    `select count(*)::int as n from invoice_items where invoice_id = $1`,
    [id]
  )
  assert.equal(items.rows[0].n, 0)
})
```

- [ ] **Step 5: Run the suite and prove the new guard has teeth**

```bash
npm run test:schema
```

Expected: 9 tests pass. Then copy `db/schema.sql` and `db/schema.test.mjs` to `/tmp`, comment out
`create trigger invoice_items_immutable_when_issued` in the **copy**, and confirm the line-item test
fails there. Report both runs. Never modify the repository's schema for this check.

- [ ] **Step 6: Commit**

```bash
git add db/schema.sql db/schema.test.mjs
git commit -m "fix(db): make an issued invoice's line items immutable too

The invoices trigger guarded only the parent row, so an issued invoice's
line items could still be updated, deleted or added to — prices and
descriptions changed under a row that read 'issued'. That defeated the
reason this schema was chosen over JSON files.

Adds a matching guard on invoice_items covering INSERT, UPDATE and
DELETE, which still allows editing a draft's items and still allows a
draft's cascade delete. Adds a check constraint so an invoice cannot be
issued without its number, issued_at and sender_snapshot — otherwise the
trigger would freeze an incomplete row that nothing could then repair.

Also records that row triggers do not fire for TRUNCATE."
```

---

## Task 23: Close the issuing race in the line-item guard

**Files:**
- Modify: `db/schema.sql` (two `select` statements inside `forbid_issued_invoice_item_changes`)

**Interfaces:** none change. The schema statement count stays at 13.

**Why.** Task 22's review found that the line-item guard reads the parent's status with a plain,
non-locking `select`. Under `READ COMMITTED` — Postgres's default — this interleaving is possible:

1. Transaction A updates `invoice_items`; the trigger reads the parent and sees `status = 'draft'`, so it
   allows the change.
2. Transaction B issues that same invoice (`update invoices set status = 'issued' …`) and commits.
3. Transaction A commits.

The result is an issued invoice whose line items were altered after issuing — the exact outcome the guard
exists to prevent. Writes to the parent row serialise against each other through the row lock that an
`UPDATE` takes, but the item guard's lookup never locks, so item writes do not participate.

This is reachable in this application: the print flow saves the draft and then issues it as **two**
separate Server Action calls, so a double-click or a retry can overlap them.

`for share` makes the trigger take a shared lock on the parent row. A concurrent issuing `UPDATE` needs an
exclusive row lock, so it waits until the item transaction finishes — and then sees the final state.

- [ ] **Step 1: Add `for share` to both parent lookups**

In `db/schema.sql`, inside `forbid_issued_invoice_item_changes`, both `select status into parent_status`
statements gain `for share`:

```sql
  if tg_op in ('UPDATE','DELETE') then
    -- `for share` is load-bearing: without it this read does not serialise
    -- against a concurrent `update invoices set status = 'issued'`, so an item
    -- change could commit against an invoice that has just been issued.
    select status into parent_status from invoices where id = old.invoice_id for share;
    if parent_status = 'issued' then
      raise exception 'invoice % is issued; its line items are immutable', old.invoice_id;
    end if;
  end if;
  if tg_op in ('INSERT','UPDATE') then
    select status into parent_status from invoices where id = new.invoice_id for share;
    if parent_status = 'issued' then
      raise exception 'invoice % is issued; its line items are immutable', new.invoice_id;
    end if;
  end if;
```

Change nothing else in the function — the `case when tg_op = 'DELETE' then old else new end` return and the
fall-through on a missing parent both stay exactly as they are.

- [ ] **Step 2: Confirm the existing guarantees still hold**

```bash
npm run test:schema
```

Expected: all 9 tests still pass. In particular the draft cascade-delete test must still pass — a lock
taken on a parent row that is being deleted in the same transaction is held by that same transaction, so
it does not block itself.

**Note on what this step does and does not prove.** PGlite is a single-connection, in-process Postgres, so
it cannot exercise two concurrent transactions and therefore cannot demonstrate the race or its fix. These
tests confirm only that `for share` breaks nothing. The race itself is argued from Postgres locking
semantics, and the fix is standard practice for exactly this pattern. Record that limitation plainly in
the report rather than implying the race was reproduced.

- [ ] **Step 3: Commit**

```bash
git add db/schema.sql
git commit -m "fix(db): lock the parent row when checking issued status

The line-item guard read the parent invoice's status without locking, so
under READ COMMITTED an item change could be validated against a draft
while a concurrent transaction issued that same invoice — both commit,
and an issued invoice ends up with items altered afterwards.

Reachable here: the print flow saves the draft and issues it as two
separate Server Action calls, so a double-click can overlap them.

`for share` makes the check serialise against the issuing UPDATE, which
needs an exclusive row lock and therefore waits."
```

---

## Task 24: Keep `/admin/*` 404s out of the marketing chrome

**Files:**
- Create: `app/admin/not-found.tsx`, `app/admin/[...adminNotFound]/page.tsx`

**Interfaces:** none change.

**Why.** Task 7's verification found that an unmatched path under `/admin` — say `/admin/nonexistent` —
renders the **root** `app/not-found.tsx`, which Task 19 deliberately gave the full marketing navbar and
footer. Confirmed by curl: `HTTP 404` with one `<nav>` and one `<footer>` in the body. That contradicts the
plan's constraint that no marketing chrome appears under `/admin`. It leaks no data, but it is visibly
wrong.

**The approach was determined experimentally, because the obvious one does not work.** In Next 16 an
unmatched URL renders the root `not-found`, so an `app/admin/not-found.tsx` alone is never reached —
verified: the marker never appeared and `<nav>` was still present. A catch-all route under `/admin` that
calls `notFound()` *does* route into the admin-scoped boundary. Verified with both files in place:
`/admin/nonexistent` → 404 with `nav: 0` and the admin marker rendered, while `/admin/login` stayed 200
with `nav: 0`, `/admin` still redirected 307, and the public `/typo` kept its navbar and footer.

- [ ] **Step 1: Create `app/admin/not-found.tsx`**

It renders inside `app/admin/layout.tsx`, so it inherits the bare, light-only admin shell and the
`robots: noindex` metadata. German, like the rest of the admin UI.

```tsx
import Link from 'next/link'

export default function AdminNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="mb-2 font-mono text-sm text-gray-400">404</p>
      <h1 className="mb-3 text-xl font-semibold">Seite nicht gefunden</h1>
      <p className="mb-8 text-sm text-gray-500">
        Diese Seite existiert in der Verwaltung nicht.
      </p>
      <Link
        href="/admin"
        className="rounded border border-[#1f5f4f] px-4 py-2 text-sm font-medium text-[#1f5f4f]"
      >
        Zur Verwaltung
      </Link>
    </main>
  )
}
```

- [ ] **Step 2: Create `app/admin/[...adminNotFound]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'

// An unmatched URL renders the ROOT not-found page, which carries the marketing
// chrome by design (Task 19). This catch-all exists so that /admin/* misses
// throw into the admin-scoped not-found boundary instead, keeping the admin
// area free of the site navbar and footer. A segment-level not-found.tsx alone
// does not achieve this — unmatched paths never reach it.
export default function AdminCatchAll() {
  notFound()
}
```

More specific routes take precedence over a catch-all, so `/admin` and `/admin/login` are unaffected —
confirmed by the verification below.

- [ ] **Step 3: Verify all four behaviours**

```bash
npm run build && npm run lint
npm run dev &
sleep 15
```

```bash
curl -s -o /dev/null -w "admin 404: HTTP %{http_code}\n" http://localhost:3000/admin/nonexistent
curl -s http://localhost:3000/admin/nonexistent | grep -c "<nav"
curl -s http://localhost:3000/admin/nonexistent | grep -c "Seite nicht gefunden"
curl -s -o /dev/null -w "login: HTTP %{http_code}\n" http://localhost:3000/admin/login
curl -s http://localhost:3000/admin/login | grep -c "<nav"
curl -s -o /dev/null -w "gate: HTTP %{http_code}\n" http://localhost:3000/admin
curl -s http://localhost:3000/typo | grep -c "<nav"
```

Expected in order: `404`, `0`, `1`, `200`, `0`, `307`, `1`. The last one matters — the **public** 404 must
keep its chrome, which the owner explicitly chose.

Stop the dev server by PID rather than `pkill -f "next dev"`: that pattern also matches the shell running
it and will kill your own session.

- [ ] **Step 4: Commit**

```bash
git add app/admin/not-found.tsx "app/admin/[...adminNotFound]"
git commit -m "fix(admin): scope /admin 404s to the admin layout

An unmatched path under /admin rendered the root not-found page, which
carries the marketing navbar and footer by design, contradicting the rule
that no site chrome appears under /admin.

A segment-level not-found.tsx alone is not reached for unmatched URLs, so
a catch-all route calling notFound() routes /admin/* misses into the
admin-scoped boundary. The public 404 keeps its chrome unchanged."
```

---

## Self-Review

**Spec coverage** — every spec section maps to a task:

| Spec section | Task(s) |
|---|---|
| §2 Route structure | 1 |
| §3 Authentication (secrets, flow, boundary, brute force) | 3, 4, 5, 6, 7 |
| §4 Data model (all five tables, snapshot, draft/issued, trigger) | 2, 8, 14, 16 |
| §5 parseNum, rounding, per-rate VAT, numbering | 10, 11 |
| §6 UI, components, internal-field separation, payment-terms touch flag | 9, 12, 13, 15 |
| §7 Print (four traps + clipping, button validation) | 12, 13, 16 |
| §8 Testing (`node --test` + Playwright, no real identifiers in fixtures) | 3, 10, 11, 16, 17 |
| §9 Build order | 1–18 (phases 2 and 3 swapped — reason in Global Constraints) |
| §10 Deviations (no export/import, no reset button, no §19 notice) | Honoured throughout; nothing in the plan reintroduces them |
| §11 Items to verify | 2 (numeric/date driver types, `gen_random_uuid`), 16 step 7e (input clipping) |

**Placeholder scan:** no TBDs. The two "Wird in einem späteren Schritt ergänzt." strings are real interim UI text, each replaced by a named later task (13 and 15).

**Type consistency check:** `InvoiceItemInput` is defined once in `totals.ts` and imported everywhere. `InvoiceDraft` / `InvoiceSummary` are defined once in `types.ts`. `MasterDataInvoiceVisible` is the only master-data type that reaches `InvoiceSheet`. Action names are consistent across Tasks 9, 14, 15 and 16: `saveMasterDataAction`, `saveDraftAction`, `loadInvoiceAction`, `deleteDraftAction`, `listInvoicesAction`, `issueInvoiceAction`, `logoutAction`.

**`sql.transaction([...])` — verified, not assumed.** The shipped type definitions of `@neondatabase/serverless` **1.1.0** document exactly the form Task 14 uses:

```
const results = await sql.transaction([
  sql`SELECT ${1} AS num`,
  sql`SELECT ${'a'} AS str`,
])
```

It runs the array as one non-interactive HTTP transaction, which is what item replacement needs. If a future version changes this, the fallback is a `Pool` client with explicit `BEGIN`/`COMMIT`/`ROLLBACK`.

**Numbering has one source of truth:** `lastIssuedNumber()` on the server, reached through `nextNumberAction()`. No client component derives an invoice number from its own copy of the archive.
