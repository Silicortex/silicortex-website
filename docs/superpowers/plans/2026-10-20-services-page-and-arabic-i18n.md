# Services Page + Arabic i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `/services` page covering 4 service categories (including 2 new ones: e-commerce, brand identity & business launch), reposition the homepage as a full digital agency, and ship Arabic as a third, fully-RTL language — with all three languages (`en`/`de`/`ar`) living at real, indexable URLs instead of a client-side-only toggle.

**Architecture:** Move the existing `app/layout.tsx` + `app/(site)/*` tree under a `app/[lang]/...` dynamic segment so every route is locale-prefixed and statically rendered per locale; add root `middleware.ts` to redirect un-prefixed requests to a locale. `LangProvider` switches from reading `localStorage` to being seeded by the URL's `[lang]` segment, with the switcher navigating (not just flipping state). Content changes (new services page, broadened hero, dictionary completeness, Arabic translation) build on top of that routing once it's in place.

**Tech Stack:** Next.js 16 (App Router, async `params`), React 19, Tailwind v4, Framer Motion — no new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-10-20-services-page-and-arabic-i18n-design.md`

## Global Constraints

- All three dictionaries (`en.ts`, `de.ts`, `ar.ts`) must satisfy the same `Dictionary` type — no partial translations, enforced by `tsc`.
- No test framework exists in this repo today (confirmed: no vitest/jest/playwright in `package.json`, `tests/e2e` holds only a stray `.auth/owner.json`). Introducing one is out of scope for this plan. Verification per task uses `npx tsc --noEmit`, `npm run lint`, `npm run build`, and manual browser checks via `npm run dev` — these stand in for the "run the test" steps a TDD-equipped repo would have.
- RTL fixes use Tailwind's logical utilities (`ps-`/`pe-`/`ms-`/`me-`/`text-start`/`text-end`/`start-`/`end-`) and its built-in `rtl:`/`ltr:` variants (keyed off the `dir` attribute) — never a `lang === "ar"` conditional className check.
- Decorative/symmetric elements (background grid, blurred gradient blobs in `HeroBackground`) are explicitly out of scope for RTL mirroring per the spec's non-goals.
- Arabic numerals default to Western digits (`1,2,3`), matching the existing `toLocaleString("en-US")` calls — do not change number formatting.
- The owner will review the Arabic translation before launch — this plan's Arabic task produces the content; the review itself happens after this plan is executed, not as a task step.

## Review Focus

- **Invalid locale segment in the URL** (e.g. `/xx/services`): the spec implies only valid locales render; a reasonable visitor hitting a stale/mistyped link expects a 404, not a crash or silent English fallback. Pinned to Task 3.
- **Switching language mid-page** (e.g. on `/en/work/sales-dashboard`, click "DE"): a visitor expects to land on the equivalent German page, not bounce to the German homepage. Pinned to Task 4.
- **Direct deep link to a non-default locale** (e.g. sharing `/ar/contact` to a client): must render Arabic/RTL immediately server-side, with no English-then-flip flash — this is the entire point of Decision 1 in the spec. The server-side mechanism is built in Task 3, but `ar` isn't a registered locale until Task 11, so `en`/`de` (both LTR) can't actually exercise the "flash" scenario — pinned to Task 11's verification step, the first point an RTL locale exists to check against.
- **A new `services` or `servicesPage` dictionary key present in `en.ts` but missed in `de.ts`/`ar.ts`**: silently breaks the page for whichever language is missing it. Pinned to Tasks 6, 7, and 11 via the `tsc` type-check (the `Dictionary` type makes this a compile error, not a runtime one — but only if every dictionary file is type-checked against it, which the task steps confirm explicitly).
- **RTL layout with real (non-Latin, variable-length) Arabic text**: fixing classes in isolation can still look wrong once actual Arabic strings (different lengths, different word-wrap behavior) are in place — a visitor expects the dot-on-timeline-line alignment and nav dropdown positioning to hold up with real content, not just placeholder text. Pinned to Task 10's verification step (manual check happens after Task 11's Arabic content exists, noted as a re-check in Task 12).

---

## File Structure

**New files:**
- `middleware.ts` (project root) — locale detection/redirect
- `lib/i18n/metadata.ts` — shared per-locale `Metadata`/hreflang builder
- `app/[lang]/layout.tsx` — new root layout (replaces `app/layout.tsx`)
- `app/[lang]/not-found.tsx` — replaces `app/not-found.tsx`
- `app/[lang]/(site)/layout.tsx`, `.../page.tsx`, `.../contact/page.tsx`, `.../experience/page.tsx`, `.../network/page.tsx`, `.../work/page.tsx`, `.../work/sales-dashboard/layout.tsx`, `.../work/sales-dashboard/page.tsx` — moved verbatim from `app/(site)/...` with per-task edits noted below
- `app/[lang]/(site)/services/page.tsx` — new route
- `components/ServicesShowcase.tsx` — new component
- `components/SiteFooter.tsx` — extracted from `SiteChrome.tsx` so the footer can call `useLang()`
- `lib/dictionaries/ar.ts` — Arabic translation

**Deleted files:** `app/layout.tsx`, `app/(site)/*` (moved, not left behind), `app/not-found.tsx`

**Modified files:** `lib/dictionaries/index.ts`, `lib/dictionaries/en.ts`, `lib/dictionaries/de.ts`, `lib/siteConfig.ts`, `components/providers/LangProvider.tsx`, `components/SiteChrome.tsx`, `components/NavbarClient.tsx`, `components/Hero.tsx`, `components/BentoGrid.tsx`, `components/ProfileCard.tsx`, `components/Timeline.tsx`, `components/SalesChatbot.tsx`, `components/WorkShowcase.tsx` (link prefixing only), `components/FreelanceNetwork.tsx` (link prefixing only), `components/ContactForm.tsx` (dictionary-driven aria-labels only, if any), `lib/motion.ts`, `app/(site)/work/sales-dashboard/page.tsx` → moved + edited

---

## Task 1: Locale Registry

**Files:**
- Modify: `lib/dictionaries/index.ts`

**Interfaces:**
- Produces: `export const locales: readonly ["en", "de"]`, `export type Lang = (typeof locales)[number]`, `export const defaultLocale: Lang`, `export function isValidLocale(value: string): value is Lang`, existing `getDictionary(lang: Lang): Dictionary` (unchanged signature, now derived from the `locales`-driven `dictionaries` map).

- [ ] **Step 1: Rewrite `lib/dictionaries/index.ts`**

```ts
import type { Dictionary } from "./en"
import en from "./en"
import de from "./de"

export const locales = ["en", "de"] as const
export type Lang = (typeof locales)[number]
export const defaultLocale: Lang = "en"

export type { Dictionary }

const dictionaries: Record<Lang, Dictionary> = { en, de }

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang] ?? dictionaries[defaultLocale]
}

export function isValidLocale(value: string): value is Lang {
  return (locales as readonly string[]).includes(value)
}
```

Arabic is added to `locales`/`dictionaries` in Task 11, not here — every later task that depends on "all locales" (middleware, `generateStaticParams`, the switcher) reads from `locales` so that one addition is the only place Arabic needs registering.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors (no call sites depend on the old shape yet — this task only adds exports).

- [ ] **Step 3: Commit**

```bash
git add lib/dictionaries/index.ts
git commit -m "feat(i18n): add locale registry with isValidLocale"
```

---

## Task 2: Locale-Negotiation Middleware

**Files:**
- Create: `middleware.ts`

**Interfaces:**
- Consumes: `locales`, `defaultLocale`, `isValidLocale` from Task 1.
- Produces: redirects any request whose path doesn't start with a valid locale to `/${locale}${path}`, preserving query string. Reads cookie `silicortex-lang` (same name `LangProvider` will write in Task 4) before falling back to `Accept-Language` negotiation.

- [ ] **Step 1: Write `middleware.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server"
import { locales, defaultLocale, isValidLocale } from "@/lib/dictionaries"

const COOKIE_NAME = "silicortex-lang"

function negotiateLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale

  const header = request.headers.get("accept-language") ?? ""
  for (const tag of header.split(",")) {
    const primary = tag.split(";")[0].trim().split("-")[0].toLowerCase()
    if (isValidLocale(primary)) return primary
  }
  return defaultLocale
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const firstSegment = pathname.split("/")[1]
  if (isValidLocale(firstSegment)) return NextResponse.next()

  const locale = negotiateLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
```

(The `.*\\..*` exclusion skips any path with a file extension — not just `favicon.ico` — so a future `public/robots.txt` or `public/sitemap.xml` doesn't get wrongly redirected either.)

- [ ] **Step 2: Verify locally**

Run: `npm run dev`, then in another terminal: `curl -sI http://localhost:3000/ | grep -i location` and `curl -sI http://localhost:3000/de/work | grep -i location`
Expected: first command shows a `location: /en` (or `/de` depending on your `Accept-Language`); second shows no `location` header (already locale-prefixed, passes through).

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat(i18n): add locale-negotiation middleware"
```

---

## Task 3: Route Restructuring to `app/[lang]/...`

**Files:**
- Create: `app/[lang]/layout.tsx`, `app/[lang]/not-found.tsx`, `app/[lang]/(site)/layout.tsx`
- Move (git mv, then edit): `app/(site)/page.tsx` → `app/[lang]/(site)/page.tsx`, `app/(site)/contact/page.tsx` → `app/[lang]/(site)/contact/page.tsx`, `app/(site)/experience/page.tsx` → `app/[lang]/(site)/experience/page.tsx`, `app/(site)/network/page.tsx` → `app/[lang]/(site)/network/page.tsx`, `app/(site)/work/page.tsx` → `app/[lang]/(site)/work/page.tsx`, `app/(site)/work/sales-dashboard/layout.tsx` → `app/[lang]/(site)/work/sales-dashboard/layout.tsx`, `app/(site)/work/sales-dashboard/page.tsx` → `app/[lang]/(site)/work/sales-dashboard/page.tsx`
- Delete: `app/layout.tsx`, `app/not-found.tsx`, `app/(site)/layout.tsx` (content moves into the new files above, not left behind)
- Modify: `components/SiteChrome.tsx` (accept a `lang` prop)
- Leave untouched: `app/favicon.ico`, `app/globals.css` (import path changes, file doesn't move), `next.config.ts`'s `/admin` redirects (resolved before any of this renders)

**Interfaces:**
- Produces: `SiteChrome({ lang, children }: { lang: Lang; children: ReactNode })` — new required prop, used by Task 4 (`LangProvider`) and Task 9 (`SiteFooter`).

- [ ] **Step 1: Create `app/[lang]/layout.tsx`** — this is the new root layout (contains `<html>`/`<body>`, the only place that may). Move the fonts, `globals.css` import, and `metadataBase` from the old `app/layout.tsx`, fixing the domain bug found during planning: `metadataBase` currently reads `https://silicortex.com` but the live site is `silicortex.de` (confirmed by `next.config.ts`'s `admin.silicortex.de` redirect target) — use `https://silicortex.de`.

```tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Geist, Geist_Mono } from "next/font/google"
import "../globals.css"
import { siteConfig } from "@/lib/siteConfig"
import { locales, isValidLocale, type Lang } from "@/lib/dictionaries"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  metadataBase: new URL("https://silicortex.de"),
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
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

(Arabic isn't in `locales` yet per Task 1 — the `dir` ternary is written now so Task 11 doesn't need to touch this file again.)

- [ ] **Step 2: Create `app/[lang]/(site)/layout.tsx`**

```tsx
import { SiteChrome } from "@/components/SiteChrome"
import type { Lang } from "@/lib/dictionaries"

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: Lang }>
}) {
  const { lang } = await params
  return <SiteChrome lang={lang}>{children}</SiteChrome>
}
```

- [ ] **Step 3: Modify `components/SiteChrome.tsx`** to accept `lang` and pass it to `LangProvider` (full `LangProvider` rewrite is Task 4 — for this task, just thread the prop through without changing `LangProvider`'s current internals):

```tsx
export function SiteChrome({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider>
        <LangProvider lang={lang}>
          <NavbarClient />
          {children}
          <footer>...</footer>
        </LangProvider>
      </ThemeProvider>
      <SpeedInsights />
      <Analytics />
    </>
  )
}
```

(`LangProvider` doesn't accept a `lang` prop yet — this task will cause a type error until Task 4 lands. Do Task 3 and Task 4 as one combined commit if your reviewer prefers a buildable intermediate state; otherwise it's fine for `tsc` to fail between these two tasks within the same work session, since they ship together.)

- [ ] **Step 4: `git mv` the six route files** into `app/[lang]/(site)/...` at the paths listed above, unchanged in content.

- [ ] **Step 5: Create `app/[lang]/not-found.tsx`**, moving `app/not-found.tsx`'s content, now locale-aware:

```tsx
import Link from "next/link"
import { SiteChrome } from "@/components/SiteChrome"
import { getDictionary, type Lang } from "@/lib/dictionaries"

export default async function NotFound({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
  const dict = getDictionary(lang)
  const n = dict.notFound
  return (
    <SiteChrome lang={lang}>
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-2 font-mono text-sm text-slate-400 dark:text-slate-500">404</p>
        <h1 className="mb-3 text-2xl font-semibold">{n.title}</h1>
        <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">{n.description}</p>
        <Link href={`/${lang}`} className="rounded-full border border-black/10 px-5 py-2 text-sm font-medium transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5">
          {n.backHome}
        </Link>
      </main>
    </SiteChrome>
  )
}
```

Add `notFound: { title: string; description: string; backHome: string }` to `Dictionary` (in `en.ts`/`de.ts`) with the existing English copy ("This page does not exist" / "The link may be outdated, or the address slightly off." / "Back to home") as the `en` values, and reasonable German equivalents for `de`.

- [ ] **Step 6: Delete** `app/layout.tsx`, `app/not-found.tsx`, `app/(site)/layout.tsx`, and the now-empty `app/(site)/` directory.

- [ ] **Step 7: Verify**

Run: `npm run build`
Expected: build succeeds, output lists `/en`, `/de`, `/en/work`, `/de/work`, etc. as statically generated routes. Visiting `http://localhost:3000/xx/work` after `npm run dev` returns the 404 page (confirms the Review Focus item on invalid locales).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(i18n): restructure routes under app/[lang]"
```

---

## Task 4: URL-Driven `LangProvider` + Locale-Aware Navigation

**Files:**
- Modify: `components/providers/LangProvider.tsx`, `components/NavbarClient.tsx`, `components/Hero.tsx`, `components/WorkShowcase.tsx`, `components/FreelanceNetwork.tsx`, `app/[lang]/(site)/work/sales-dashboard/layout.tsx`

**Interfaces:**
- Produces: `useLang()` returns `{ lang: Lang; dict: Dictionary; setLang: (next: Lang) => void; localeHref: (path: string) => string }`. `localeHref("/work")` → `"/en/work"` when `lang === "en"`; `localeHref("/")` → `"/en"`.
- Consumes: `locales` from Task 1 (for the switcher), `isValidLocale`.

- [ ] **Step 1: Rewrite `components/providers/LangProvider.tsx`**

```tsx
"use client"

import { createContext, useCallback, useContext, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getDictionary, type Dictionary, type Lang } from "@/lib/dictionaries"

interface LangContextValue {
  lang: Lang
  dict: Dictionary
  setLang: (next: Lang) => void
  localeHref: (path: string) => string
}

const LangContext = createContext<LangContextValue | null>(null)
const COOKIE_NAME = "silicortex-lang"

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const dict = getDictionary(lang)

  const localeHref = useCallback(
    (path: string) => `/${lang}${path === "/" ? "" : path}`,
    [lang],
  )

  const setLang = useCallback(
    (next: Lang) => {
      document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=31536000`
      const segments = pathname.split("/")
      segments[1] = next // segments[0] is "" before the leading slash, segments[1] is the current lang
      router.push(segments.join("/") || `/${next}`)
    },
    [pathname, router],
  )

  return (
    <LangContext.Provider value={{ lang, dict, setLang, localeHref }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used inside LangProvider")
  return ctx
}
```

- [ ] **Step 2: Modify `components/NavbarClient.tsx`**
  - Destructure `{ lang, setLang, dict, localeHref }` from `useLang()`.
  - Replace every `href="/..."` literal (logo link, nav links, "Sales Dashboard" child link, mobile CTA) with `localeHref("/...")`.
  - Fix `isActive`: compare against `pathname === localeHref(link.href)` (exact) or `pathname.startsWith(localeHref(link.href))` (prefix match for the Work dropdown), instead of the current bare `/`-relative comparison — `pathname` now includes the `/en`/`/de` prefix.
  - Replace the single toggle button with a segmented control driven by `locales`: `{locales.map((l) => <button key={l} onClick={() => setLang(l)} aria-pressed={l === lang}>{l.toUpperCase()}</button>)}` (styling matches the existing single-button pill). This already produces the right EN/DE control with zero further change needed once Task 11 adds `"ar"` to `locales` — only the label map (added in Task 11) needs `ع` instead of `AR`.

- [ ] **Step 3: Modify `components/Hero.tsx`, `components/WorkShowcase.tsx`, `components/FreelanceNetwork.tsx`**
  - Each destructures `localeHref` from `useLang()` alongside the existing `dict` and wraps its `<Link href="/...">` targets with it (Hero: `cta1`/`cta2` targets; WorkShowcase: the sales-dashboard item's `href`; FreelanceNetwork: the `/contact` CTA).

- [ ] **Step 4: Modify `app/[lang]/(site)/work/sales-dashboard/layout.tsx`** (a server component with `lang` available from `params`, not from `useLang()`):

```tsx
export default async function SalesDashboardLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
  // ...existing JSX, with href="/work" becoming href={`/${lang}/work`}
}
```

- [ ] **Step 5: Verify**

Run: `npm run build && npm run dev`. Manually: visit `/en`, click through every nav link and confirm the `/en` prefix is preserved; click "DE" on `/en/work/sales-dashboard` and confirm it lands on `/de/work/sales-dashboard` (Review Focus item); visit `/en/work/sales-dashboard`, click "Work" breadcrumb, confirm it returns to `/en/work`.

- [ ] **Step 6: Commit**

```bash
git add components/providers/LangProvider.tsx components/NavbarClient.tsx components/Hero.tsx components/WorkShowcase.tsx components/FreelanceNetwork.tsx "app/[lang]/(site)/work/sales-dashboard/layout.tsx"
git commit -m "feat(i18n): make LangProvider URL-driven, prefix all internal links"
```

---

## Task 5: Per-Locale Page Metadata

**Files:**
- Create: `lib/i18n/metadata.ts`
- Modify: `lib/dictionaries/en.ts`, `lib/dictionaries/de.ts` (add a `meta` key), each of the 5 page files under `app/[lang]/(site)/`

**Interfaces:**
- Produces: `localizedMetadata(lang: Lang, path: string, title: string, description: string): Metadata` — returns `{ title, description, alternates: { languages: { en: "/en" + path, de: "/de" + path } } }`.
- Consumes: `locales` (Task 1), `Dictionary.meta.<page>.{title,description}` (new).

- [ ] **Step 1: Add `meta` to `Dictionary`** in `en.ts`/`de.ts`: `meta: { home: {title,description}, services: {...}, work: {...}, experience: {...}, network: {...}, contact: {...} }`, carrying over the exact existing English title/description strings from each page's current static `metadata` export (e.g. `work: { title: "Work", description: "AI agents, automation workflows, and dashboards built by Silicortex." }`), plus a new `services` entry (title "Services", description drafted from the spec's Section 2 framing — final wording at implementer's discretion). German versions translate these.

- [ ] **Step 2: Write `lib/i18n/metadata.ts`**

```ts
import type { Metadata } from "next"
import { locales, type Lang } from "@/lib/dictionaries"

export function localizedMetadata(lang: Lang, path: string, title: string, description: string): Metadata {
  const languages: Record<string, string> = {}
  for (const l of locales) languages[l] = `/${l}${path}`
  return { title, description, alternates: { languages } }
}
```

- [ ] **Step 3: Replace each page's static `metadata` export with `generateMetadata`**, e.g. `app/[lang]/(site)/contact/page.tsx`:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  const { meta } = getDictionary(lang)
  return localizedMetadata(lang, "/contact", meta.contact.title, meta.contact.description)
}
```

Repeat for home (`path: "/"`), experience (`/experience`), network (`/network`), work (`/work`). The new `/services` page (Task 7) uses `meta.services` and is written with `generateMetadata` from the start, not retrofitted.

- [ ] **Step 4: Verify**

Run: `npm run build`. Spot-check rendered `<head>` for `/de/contact` via `curl -s http://localhost:3000/de/contact | grep -A2 'alternate'` after `npm run dev` — expect `hreflang="en"` and `hreflang="de"` link tags pointing at `/en/contact` and `/de/contact`.

- [ ] **Step 5: Commit**

```bash
git add lib/i18n/metadata.ts lib/dictionaries/en.ts lib/dictionaries/de.ts "app/[lang]/(site)"
git commit -m "feat(i18n): per-locale page metadata with hreflang alternates"
```

---

## Task 6: Services Catalog Reshape + `BentoGrid` Redesign

**Files:**
- Modify: `lib/dictionaries/en.ts`, `lib/dictionaries/de.ts`, `components/BentoGrid.tsx`

**Interfaces:**
- Produces: `Dictionary["services"]` becomes `{ title: string; subtitle: string; categories: { id: "ai-automation" | "software-dev" | "ecommerce" | "brand-launch"; title: string; description: string; tag: string }[] }` (was `items: {title,description,tag}[]`).
- Consumes: category list fixed by the spec's Section 1 table (4 categories, in this order: AI & Automation, Software & Web Development, E-Commerce, Brand Identity & Business Launch).

- [ ] **Step 1: Rewrite `services` in `en.ts`** to the `categories` shape above. Carry forward the existing `title`/`subtitle` ("What We Build" / existing subtitle). Write one category entry per row of the spec's Section 1 table — `tag` short (e.g. "Core", "Engineering", "New", "New"), `description` 1-2 sentences summarizing what's bundled into that category (not the 5 old granular items verbatim — a category-level summary). Mirror the same shape and equivalent German copy in `de.ts`.

- [ ] **Step 2: Modify `components/BentoGrid.tsx`**
  - Replace `s.items.map(...)` with `s.categories.map(...)`.
  - Drop `spanConfigs` (tuned for 5 items) in favor of a plain `grid grid-cols-1 gap-6 sm:grid-cols-2` (even 2x2 on desktop, stacked on mobile) — delete the `span` prop from `BentoCard`.
  - `accentColors`/`iconBg`/`cardBgs`/`icons` arrays shrink to 4 entries (reuse 4 of the existing 5 color sets; pick icons 🤖 💻 🛒 🚀 per the spec's table).
  - Each `BentoCard` becomes a `<Link>` (it currently renders a plain `<TiltCard>` with no link) wrapping to `localeHref(\`/services#${item.id}\`)` — import `useLang` for `localeHref`.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build`. Manual: visit `/en`, confirm the homepage services section shows exactly 4 cards in a 2x2 grid and each is clickable (the `/services` page doesn't exist until Task 7, so a 404 here is expected and fine for this task's verification — just confirm the link target is `/en/services#<id>`).

- [ ] **Step 4: Commit**

```bash
git add lib/dictionaries/en.ts lib/dictionaries/de.ts components/BentoGrid.tsx
git commit -m "feat(services): reshape homepage services into 4 linked categories"
```

---

## Task 7: New `/services` Page

**Files:**
- Create: `app/[lang]/(site)/services/page.tsx`, `components/ServicesShowcase.tsx`
- Modify: `lib/dictionaries/en.ts`, `lib/dictionaries/de.ts`, `components/NavbarClient.tsx`

**Interfaces:**
- Produces: `Dictionary["servicesPage"]: { header: string; title: string; subtitle: string; categories: { id: string; label: string; title: string; description: string; items: { title: string; description: string; tags: string[] }[] }[] }`. `ids` match `services.categories[].id` from Task 6 exactly (used for the anchor targets `BentoGrid` already links to).
- `Dictionary["nav"]` gains `services: string`.
- Consumes: `WorkShowcase.tsx`'s existing section-pills + grouped-cards pattern (Task 2 of the spec) as the visual/structural model — read it before writing `ServicesShowcase.tsx`.

- [ ] **Step 1: Add `servicesPage` to `en.ts`/`de.ts`.** Four categories, same `id` order as Task 6. For **AI & Automation** and **Software & Web Development**, write expanded `items` pulling relevant detail from the existing `workShowcase.sections.capabilities.items` content (web dev, data engineering, AI/ML, integration) rather than just restating the 5 short homepage blurbs — per the owner's decision that these two shouldn't look thinner than the new ones. For **E-Commerce** and **Brand Identity & Business Launch**, use the spec's Section 2 drafted direction ("Online Stores, Built to Sell" / "Launch With a Real Identity") as the `title`, with 3-4 `items` each covering the specific sub-offerings named in the spec (storefronts/checkout/inventory/custom-features for e-commerce; logo+naming/visual-identity-system/website for brand-launch). No tech-stack-style `tags` for the two non-technical categories' items (brand/e-commerce) — use short descriptive tags instead (e.g. "Any Niche", "Custom Features") where `WorkShowcase`'s `WorkCard` would show tech badges.

- [ ] **Step 2: Add `nav.services`** ("Services" / German equivalent) to both dictionaries.

- [ ] **Step 3: Write `components/ServicesShowcase.tsx`**, modeled on `WorkShowcase.tsx`: section-nav pills that `scrollIntoView` to each category's anchor (`id={category.id}`), header block (label/title/description) per category, a card grid of that category's `items` (title/description/tags, no featured/href/cta fields — simpler than `WorkCard` since there's no linked case-study here), and a `/contact` CTA (via `localeHref`) at the end of each category section.

- [ ] **Step 4: Write `app/[lang]/(site)/services/page.tsx`**

```tsx
import type { Metadata } from "next"
import { ServicesShowcase } from "@/components/ServicesShowcase"
import { getDictionary, type Lang } from "@/lib/dictionaries"
import { localizedMetadata } from "@/lib/i18n/metadata"

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  const { meta } = getDictionary(lang)
  return localizedMetadata(lang, "/services", meta.services.title, meta.services.description)
}

export default function ServicesPage() {
  return (
    <main className="pt-16">
      <ServicesShowcase />
    </main>
  )
}
```

- [ ] **Step 5: Modify `components/NavbarClient.tsx`** — insert a plain `{ href: "/services", label: dict.nav.services }` link (no `children`, no dropdown) into the `links` array between Home and Work.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run build`. Manual: visit `/en/services`, confirm 4 sections render with working nav pills; click a homepage `BentoGrid` card and confirm it scrolls to the right section; confirm `/de/services` shows the German content.

- [ ] **Step 7: Commit**

```bash
git add "app/[lang]/(site)/services" components/ServicesShowcase.tsx lib/dictionaries/en.ts lib/dictionaries/de.ts components/NavbarClient.tsx
git commit -m "feat(services): add /services page with 4 category sections"
```

---

## Task 8: Hero & Brand Repositioning

**Files:**
- Modify: `lib/dictionaries/en.ts`, `lib/dictionaries/de.ts`, `lib/siteConfig.ts`, `components/Hero.tsx`

**Interfaces:**
- Consumes: owner decision (spec Section 3) — broaden `hero.badge`/`hero.title`/`hero.subtitle` and `siteConfig.slogan` to present AI/automation as the flagship specialty within a full digital agency (web/branding/e-commerce/AI), not the only offering.

- [ ] **Step 1: Rewrite `hero.badge`/`hero.title`/`hero.subtitle` in `en.ts`/`de.ts`.** Exact wording is the implementer's call within the direction above; keep the existing confident/concise tone and the `\n` line-break convention already used in `hero.title`.

- [ ] **Step 2: Rewrite `siteConfig.slogan`** in `lib/siteConfig.ts` to match the broadened positioning (this string is English-only/not localized today — it's used directly in `SiteChrome`'s footer and in `app/[lang]/layout.tsx`'s root `description`; leaving it English-only is consistent with its current usage, not a new gap).

- [ ] **Step 3: Modify `components/Hero.tsx`** — change `cta1`'s `href` from `localeHref("/work")` (set in Task 4) to `localeHref("/services")`. `cta2` stays pointed at `/contact`. Update `hero.cta1` copy from "See Our Work" to something matching "Explore Our Services" in both dictionaries.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`. Manual: visit `/en`, confirm the hero's primary button now reads the new label and links to `/en/services`.

- [ ] **Step 5: Commit**

```bash
git add lib/dictionaries/en.ts lib/dictionaries/de.ts lib/siteConfig.ts components/Hero.tsx
git commit -m "feat(brand): reposition hero copy as a full digital agency"
```

---

## Task 9: Dictionary Completeness Pass

**Files:**
- Modify: `lib/dictionaries/en.ts`, `lib/dictionaries/de.ts`, `components/NavbarClient.tsx`, `components/SalesChatbot.tsx`, `app/[lang]/(site)/work/sales-dashboard/page.tsx`
- Create: `components/SiteFooter.tsx`
- Modify: `components/SiteChrome.tsx` (use `SiteFooter` instead of the inline `<footer>`)

**Interfaces:**
- Produces: `Dictionary["navbar"]`: `{ projectsLabel: string; toggleLanguage: string; toggleTheme: string; toggleMenu: string; toggleSubmenu: string }` for the previously-hardcoded dropdown label and aria-labels. `Dictionary["salesDashboard"]` gains 8 `{label,title}` pairs for the dashboard's `SectionHeader` calls (`kpiOverview`, `revenueTrends`, `orderAnalytics`, `productPerformance`, `transactions`, `rawData`, `aiInsightsHeader`, `chatbotHeader` — exact key names at implementer's discretion, values are the existing English pairs: "Key Metrics"/"KPI Overview", "Revenue"/"Revenue Trends", "Order Analytics"/"Orders & Comparisons", "Product Performance"/"Products & Correlations", "Transactions"/"Transaction History", "Raw Data"/"Full Dataset", "AI"/"AI-Powered Insights", "AI Chatbot"/"Ask Your Sales Data"). `Dictionary["salesDashboard"]` also gains `chatbot: { greeting: string; suggestions: string[]; fallback: string; responses: { keywords: string[]; response: string }[] }` — the content currently hardcoded in `SalesChatbot.tsx`'s `STATIC_RESPONSES`/`SUGGESTIONS`/`FALLBACK`/initial greeting message. `keywords` stay English in every language (they match the visitor's typed English demo question, not the UI language).

- [ ] **Step 1: Add the new dictionary keys** described above to `en.ts` (carrying over the exact existing English content verbatim where it's a straight move) and `de.ts` (German translations — note `STATIC_INSIGHTS_DE` in `app/[lang]/(site)/work/sales-dashboard/page.tsx` already demonstrates the house style/tone for translating this kind of sales-analytics prose into German; match it).

- [ ] **Step 2: Modify `components/NavbarClient.tsx`** — replace the hardcoded `"Projects"` dropdown label and the `aria-label` strings (`"Toggle sub-menu"`, `"Toggle language"`, `"Toggle theme"` in the child `ThemeToggle`, `"Toggle menu"`) with `dict.navbar.*`.

- [ ] **Step 3: Modify `components/SalesChatbot.tsx`** — add `useLang()`, delete the local `HOW_IT_WORKS` const (use `dict.salesDashboard.howItWorksSteps`, which already exists and is already translated for `en`/`de`), delete `SUGGESTIONS`/`FALLBACK` consts and the hardcoded greeting message (use `dict.salesDashboard.chatbot.suggestions`/`.fallback`/`.greeting`), and replace the hardcoded headers ("AI Chatbot", "Ask Your Sales Data Anything", "Under the Hood", "How This Chatbot Works", "Architecture:", the demo-mode badge, "Send" button, placeholder text) with the corresponding `dict.salesDashboard.chat*`/`howItWorks*`/`archLabel`/`archAfter` keys — these already exist in the dictionary (verified in `en.ts`) but are currently unused by this component. `STATIC_RESPONSES` becomes `dict.salesDashboard.chatbot.responses` (same `{keywords, response}` shape, no code change to `getStaticResponse`'s matching logic beyond reading from `dict` instead of the module-level const).

- [ ] **Step 4: Modify `app/[lang]/(site)/work/sales-dashboard/page.tsx`**
  - Replace each hardcoded `<SectionHeader label="..." title="..." .../>` pair with the matching new `dict.salesDashboard.*` keys from Step 1.
  - Add a `STATUS_LABEL: Record<StatusKey, string>` built from the already-existing `d.statusCompleted`/`d.statusPending`/`d.statusProcessing`/`d.statusRefunded` dictionary keys, and use `STATUS_LABEL[o.status as StatusKey]` instead of the raw `{o.status}` at the orders-table status badge.

- [ ] **Step 5: Create `components/SiteFooter.tsx`**

```tsx
"use client"
import { useLang } from "@/components/providers/LangProvider"
import { siteConfig } from "@/lib/siteConfig"

export function SiteFooter() {
  const { dict } = useLang()
  return (
    <footer className="border-t border-black/5 bg-white px-6 py-8 text-center dark:border-white/5 dark:bg-slate-950">
      <p className="mb-1 text-xs text-slate-400 dark:text-slate-600">{dict.footer.tagline}</p>
      <p className="text-xs text-slate-300 dark:text-slate-700">{dict.footer.copyright}</p>
    </footer>
  )
}
```

(`dict.footer.tagline`/`.copyright` already exist in `en.ts`/`de.ts` — this task only wires them up, replacing the current direct `siteConfig.name`/`siteConfig.slogan` interpolation that bypasses translation.)

- [ ] **Step 6: Modify `components/SiteChrome.tsx`** to render `<SiteFooter />` (inside `LangProvider`, where `useLang()` is valid) instead of the inline `<footer>...</footer>` JSX, removing the now-unused `siteConfig` import if nothing else in the file needs it.

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit && npm run lint && npm run build`. Manual: open `/en/work/sales-dashboard`, exercise the chatbot's suggestion chips and confirm responses render; switch to `/de/work/sales-dashboard` and confirm the chatbot and section headers are in German; check the footer text changes between `/en` and `/de`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(i18n): move remaining hardcoded strings into the dictionary"
```

---

## Task 10: RTL Logical-Class Fixes

**Files:**
- Modify: `components/NavbarClient.tsx`, `components/Hero.tsx`, `components/ProfileCard.tsx`, `components/Timeline.tsx`, `lib/motion.ts`, `components/SalesChatbot.tsx`, `app/[lang]/(site)/work/sales-dashboard/page.tsx`

This task changes no visible behavior under `dir="ltr"` (the only mode `en`/`de` run in) — it's preparatory for Task 11's Arabic content, verified by eye once Arabic ships (Task 12), but the mechanical class/style changes land now while the diff is small and English/German-only.

- [ ] **Step 1: `components/NavbarClient.tsx`** — `ml-2` (logo text, line ~76) → `ms-2`; the dropdown panel's `left-0 top-full` (line ~145) → `start-0 top-full`; the mobile submenu's `pl-4` (line ~281) → `ps-4`. (The nav-underline's `left-0 right-0`, line ~102, spans both edges and needs no change.)

- [ ] **Step 2: `components/Hero.tsx`** — the typing-cursor's `ml-0.5` (line ~100) → `ms-0.5`. (The three decorative blur blobs in `HeroBackground` keep their `left-`/`right-` classes unchanged per the spec's non-goal.)

- [ ] **Step 3: `components/ProfileCard.tsx`** — `sm:text-left` (line ~21) → `sm:text-start`.

- [ ] **Step 4: `components/Timeline.tsx`** — the vertical rail and dot markers (lines ~35, ~49) combine a logical `start-*` offset with an unconditional `-translate-x-1/2`. Under `dir="rtl"`, `start-*` resolves to `right`, but `translate-x(-50%)` always shifts left regardless of direction, pulling the dot off the line (confirmed by the math: a 12px dot anchored via `right: 6px` and shifted an additional -50%-of-its-own-width left ends up roughly 11-12px away from the 1px line's center, which is anchored the same way but barely moves at that scale). Fix by flipping the transform's sign in RTL using Tailwind's `rtl:` variant: keep `-translate-x-1/2` for LTR and add `rtl:translate-x-1/2` alongside it on both the line and the dot wrapper, so the shift direction always points toward the anchored edge regardless of `dir`.

- [ ] **Step 5: `lib/motion.ts`** — `slideIn(direction)`'s `isX` branch always maps `"left"` to a negative `x` offset and `"right"` to positive, in physical screen coordinates. Add an optional second parameter so callers can request the RTL-flipped sign, e.g. `slideIn(direction: "left" | "right" | "up" | "down", offset = 32, dir: "ltr" | "rtl" = "ltr")`, flipping the sign of `value` when `dir === "rtl"` and `isX` is true. Update `components/Timeline.tsx`'s call site to pass `dir` (available there via `useLang()`'s... note `useLang()` doesn't currently expose `dir` — add it to `LangContextValue` in this step, computed the same way as `app/[lang]/layout.tsx`'s `dir` ternary: `lang === "ar" ? "rtl" : "ltr"`).

- [ ] **Step 6: `components/SalesChatbot.tsx`** — the avatar bubble's `marginRight: 10` (line ~195) → use `marginInlineEnd: 10` (CSS logical property, works in inline `style` objects without a Tailwind class); the "how it works" arrow's `right: -8` (line ~259, inside a `position: "absolute"` block) → `insetInlineEnd: -8`.

- [ ] **Step 7: `app/[lang]/(site)/work/sales-dashboard/page.tsx`** — `DatasetOverview`'s `thS.textAlign: "left"` (line ~274) → `"start"` (a valid CSS value, not Tailwind-specific); the donut legend's `marginLeft: "auto"` (line ~541) → `marginInlineStart: "auto"`; the orders table header's inline `textAlign: "left"` (line ~652) → `"start"`.

- [ ] **Step 8: Verify**

Run: `npx tsc --noEmit && npm run build`. Manual: visit every modified page at `/en/...` and confirm pixel-identical rendering to before this task (these are LTR-invariant fixes; any visible change here is a regression to fix before committing).

- [ ] **Step 9: Commit**

```bash
git add components/NavbarClient.tsx components/Hero.tsx components/ProfileCard.tsx components/Timeline.tsx lib/motion.ts components/SalesChatbot.tsx "app/[lang]/(site)/work/sales-dashboard/page.tsx"
git commit -m "feat(rtl): convert directional classes/styles to logical equivalents"
```

---

## Task 11: Arabic Dictionary, Registration, and Font

**Files:**
- Create: `lib/dictionaries/ar.ts`
- Modify: `lib/dictionaries/index.ts`, `components/NavbarClient.tsx`, `app/[lang]/layout.tsx`
- Modify: `app/[lang]/(site)/work/sales-dashboard/page.tsx` (add `STATIC_INSIGHTS_AR`, extend the `lang === "de" ? ... : ...` ternary to a 3-way lookup)

**Interfaces:**
- Produces: `lib/dictionaries/ar.ts` default-exports a `Dictionary`-typed object (every key `en.ts` has, including everything added in Tasks 5-9). `lib/dictionaries/index.ts`'s `locales` becomes `["en", "de", "ar"] as const`.

- [ ] **Step 1: Write `lib/dictionaries/ar.ts`** as a full Modern Standard Arabic translation, structurally identical to `en.ts` (copy its structure, translate every string value, including `salesDashboard` and all keys added in Tasks 5-9). Numerals stay Western digits (Global Constraint). Wrap phone numbers, the email address, and tech/product names (React, Next.js, etc.) that appear inside otherwise-Arabic sentences in `<bdi>` at render sites that interpolate them directly (primarily `ProfileCard.tsx`'s contact row and any tech-tag lists) — this is a markup change alongside the translation, not a translation-content change, so make it here since it's Arabic-specific.

```ts
import type { Dictionary } from "./en"

const ar: Dictionary = {
  // ...full translation
}

export default ar
```

- [ ] **Step 2: Modify `lib/dictionaries/index.ts`** — add `import ar from "./ar"`, change `locales` to `["en", "de", "ar"] as const`, add `ar` to the `dictionaries` map.

- [ ] **Step 3: Modify `components/NavbarClient.tsx`** — add a `LANG_LABELS: Record<Lang, string> = { en: "EN", de: "DE", ar: "ع" }` map and render `LANG_LABELS[l]` instead of `l.toUpperCase()` in the segmented control built in Task 4 (that control already maps over `locales`, so this is the only change needed there).

- [ ] **Step 4: Modify `app/[lang]/layout.tsx`** to load an Arabic font and expose it as a CSS variable active only under `:lang(ar)`:

```tsx
import { Noto_Sans_Arabic } from "next/font/google"
const notoSansArabic = Noto_Sans_Arabic({ variable: "--font-noto-arabic", subsets: ["arabic"] })
// add notoSansArabic.variable to the <html> className alongside the existing geist variables
```

Then in `app/globals.css`, add a rule scoping the Arabic font to Arabic content without a conditional class:

```css
:lang(ar) {
  font-family: var(--font-noto-arabic), var(--font-geist-sans), sans-serif;
}
```

- [ ] **Step 5: Modify `app/[lang]/(site)/work/sales-dashboard/page.tsx`** — add `STATIC_INSIGHTS_AR` (Arabic translations of the same 4 keys `STATIC_INSIGHTS`/`STATIC_INSIGHTS_DE` already use: `"7D"`, `"30D"`, `"90D"`, `"1Y"`), and change `AIInsights`'s `const insightSet = lang === "de" ? STATIC_INSIGHTS_DE : STATIC_INSIGHTS` to a lookup that also handles `"ar"`:

```ts
const INSIGHT_SETS: Record<Lang, Record<string, string[]>> = { en: STATIC_INSIGHTS, de: STATIC_INSIGHTS_DE, ar: STATIC_INSIGHTS_AR }
const insightSet = INSIGHT_SETS[lang]
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit` — this is the primary check for this task: a missing key anywhere in `ar.ts` is a compile error against the `Dictionary` type (Review Focus item on dictionary-key coverage). Then `npm run build && npm run dev`, visit `/ar`, confirm: the page renders right-to-left, the Arabic font is visibly applied, the language switcher shows `ع` and is pressed/active, and the Timeline/Navbar RTL fixes from Task 10 hold up with real Arabic text (re-check named in Review Focus). Then, with the dev server running, directly navigate (don't click through from `/en`) straight to `http://localhost:3000/ar/contact` and watch the initial paint — confirm it's RTL/Arabic from the very first frame with no visible English-then-flip (Review Focus item on deep links), since `dir` is now set server-side from the URL segment rather than client-side from `localStorage`.

- [ ] **Step 7: Commit**

```bash
git add lib/dictionaries/ar.ts lib/dictionaries/index.ts components/NavbarClient.tsx "app/[lang]/layout.tsx" app/globals.css "app/[lang]/(site)/work/sales-dashboard/page.tsx"
git commit -m "feat(i18n): add Arabic as a third language with RTL support"
```

---

## Task 12: Integration Verification

**Files:** none (verification only)

- [ ] **Step 1: Full build check**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: zero errors across all three.

- [ ] **Step 2: Locale-negotiation edge cases**

With `npm run dev` running: `curl -sI http://localhost:3000/` (expect a redirect to `/en`, `/de`, or `/ar` depending on test `Accept-Language`, or whatever cookie was previously set), `curl -sI http://localhost:3000/en/services` (expect 200, no redirect), `curl -sI http://localhost:3000/xx/services` (expect the `[lang]` layout's `notFound()` to fire — a 404 page, not a crash).

- [ ] **Step 3: Manual RTL pass**

In a browser, visit every route under `/ar/...` (home, services, work, work/sales-dashboard, experience, network, contact) and confirm: text reads right-to-left, the Timeline dot sits on its line, the nav dropdown opens from the correct side, phone/email/tech names inside Arabic text aren't visually reordered.

- [ ] **Step 4: Language-switch round trip**

On each of the 7 routes above, use the switcher to cycle EN → DE → AR → EN and confirm each switch lands on the equivalent page in the new language, never bouncing to the homepage.

- [ ] **Step 5: Hand off for owner translation review**

This plan's job ends with working, type-checked, RTL-correct Arabic content — the spec's Resolved Decision 4 requires an owner (or someone fluent in Arabic) to read through `/ar/...` before this ships to production. Flag that review as the remaining step outside this plan's scope.
