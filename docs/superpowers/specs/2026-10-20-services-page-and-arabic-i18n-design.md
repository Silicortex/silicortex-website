# Services Page + Arabic Language Support — Design

**Date:** 2026-10-20
**Scope:** New `/services` page, expanded service catalog (branding, business launch packages, e-commerce), homepage/hero repositioning, locale-prefixed routing for all three languages, and full Arabic (RTL) translation alongside the existing EN/DE support.

---

## Intent & Why

Silicortex is expanding beyond AI/automation work into three new service lines the owner already delivers for clients: brand identity (logo + naming), building websites and identity for new companies ("launch packages"), and e-commerce builds for any niche with custom features. The owner is also now targeting Arabic-speaking clients specifically.

Three problems today:
1. **Nothing on the site sells the new services**, and the hero pitch is AI/automation-only — a prospect looking for a logo or an online store has no reason to think Silicortex does that.
2. **No Arabic support**, and Arabic means right-to-left (RTL) layout, not just translated strings.
3. **No language is actually discoverable.** `en`/`de` both exist today, but only via a client-side `localStorage` toggle — the server always renders English, so none of the three languages are indexable or linkable on their own.

## Goals

- A new `/services` page that reads like a clear, modern agency services page (Stripe/Vercel-style clarity, consistent with the site's existing visual language).
- A prospect can look at the homepage and know within seconds whether their need (AI, a business website, a logo, an online store) is something Silicortex does.
- The homepage pitch reads as a full digital agency, with AI/automation as the flagship specialty rather than the whole story.
- Arabic as a full third language (`ar`), with real RTL layout, alongside `en`/`de`.
- All three languages live at their own URLs (`/en/...`, `/de/...`, `/ar/...`), indexable and directly linkable — not a client-only toggle.
- All three dictionaries (`en`, `de`, `ar`) stay structurally identical and fully translated — the `Dictionary` type already enforces this.

## Non-goals

- Not redesigning the `/work` portfolio page's visuals, `/experience`, `/network`, or the sales-dashboard demo's layout — they keep their current design, just gain translated strings, locale routing, and RTL-safe layout fixes.
- Not building per-service quote forms or pricing calculators — each new service links to the existing `/contact` page.
- Not pursuing pixel-perfect mirrored RTL on decorative/symmetric elements (background grid, blurred gradient blobs) — already visually symmetric.

## Anti-goals (would mean this failed even if it "works")

- A `/services` page so dense with every granular offering that a visitor can't tell what Silicortex does in 5 seconds.
- Arabic text rendered left-to-right, or with layout/numeral conventions that read as a literal, un-reviewed translation.
- Three dictionaries drifting out of sync.
- `/ar` existing but not actually reachable by search engines or shareable links — the whole point of Decision 1 below.

---

## Section 1: Service Catalog Restructuring

Today `dict.services.items` is a flat list of 5 granular items (AI Agents, n8n Automation, Custom Development, AI Consulting, Rapid Deployment) rendered in `BentoGrid` on the homepage. Adding 2-3 more flat items makes that grid cluttered and defeats "simple to scan."

**My call:** regroup into 4 clear categories, each bundling the existing granular items plus the new ones:

| Category | Icon | Contains |
|---|---|---|
| **AI & Automation** | 🤖 | AI Agents, n8n Automation, AI Consulting *(existing)* |
| **Software & Web Development** | 💻 | Custom Development, Rapid Deployment *(existing)* |
| **E-Commerce** | 🛒 | *(new)* Online stores for any niche — product catalogs, checkout/payments, custom features per business |
| **Brand Identity & Business Launch** | 🚀 | *(new)* Logo design, naming, visual identity, and a full website for new companies launching from scratch |

This reshapes the `services` dictionary key (homepage teaser) from a flat `items[]` to `categories[]` (title, description, tag, icon, href anchor into `/services`) — a breaking shape change to `Dictionary`, applied identically across `en`/`de`/`ar` in the same commit.

`BentoGrid` renders 4 larger category cards instead of 5 small ones (same glass-card/tilt-card visual style, even 2x2 grid on desktop instead of the current uneven `spanConfigs` tuned for 5 items). Each card links to its anchor on `/services`.

## Section 2: New `/services` Page

New route, new component `components/ServicesShowcase.tsx`, modeled on the existing `WorkShowcase.tsx` pattern (section nav pills that scroll to anchors, grouped card sections).

Structure per category section:
- Header: icon, label, title, description (same visual treatment as `WorkShowcase` section headers)
- Grid of sub-service cards: title, description, 2-4 "what's included" bullet tags (no tech-stack badges for the non-technical services like branding — those only make sense for AI/Automation and Software Dev)
- Each section ends with a CTA linking to `/contact`

**Owner decision: all 4 categories get real, comparably substantial written copy** — the two existing categories (AI & Automation, Software & Web Development) are expanded beyond the 5 short homepage blurbs, pulling relevant detail from `/work`'s existing "capabilities" section (web dev, data engineering, AI/ML, system integration), so they read as fully fleshed-out as the two new ones rather than looking thin next to them.

Drafted direction for the two new categories:
- **E-Commerce**: "Online Stores, Built to Sell" — custom storefronts for any niche, product catalogs, secure checkout and payments, inventory and order management, and the specific features a business needs (subscriptions, bookings, marketplaces, multi-vendor).
- **Brand Identity & Business Launch**: "Launch With a Real Identity" — logo design and naming, a complete visual identity system (colors, typography, guidelines), and a professional website — everything a new company needs to look credible from day one.

## Section 3: Homepage & Hero Repositioning

**Owner decision: broaden the pitch.** The current hero badge ("AI & Automation Agency"), headline, subtitle, and `siteConfig.slogan` are all AI/automation-only. These get rewritten (across `en`/`de`/`ar`) to present Silicortex as a full digital agency — AI & automation, software/web development, e-commerce, and brand identity — with AI/automation framed as the flagship specialty, not the only offering. Exact final copy is mine to write; direction: lead with the breadth, keep the confident/concise tone already established.

- `BentoGrid` reshaped per Section 1.
- `Hero` primary CTA (`cta1`, currently "See Our Work" → `/work`) now points to `/services` as the main conversion path; secondary CTA stays "Contact Us".

## Section 4: Navigation Changes

`NavbarClient` link order becomes: **Home → Services → Work → Experience → Network → Contact**. `dict.nav` gains a `services` key. `/services` is a plain link, no dropdown (unlike `/work`'s "Sales Dashboard" child link).

## Section 5: Locale-Prefixed Routing

**Owner decision: dedicated URLs for all three languages, not just Arabic.** Having `/ar/...` be indexable while `/en`/`/de` stay a client-side-only toggle would be inconsistent, and it improves German/English SEO too. This replaces the originally-assumed "keep `LangProvider` as-is, just add an `ar` dictionary entry" approach with real per-locale routes:

- **Route restructuring:** `app/layout.tsx` (currently the root layout holding `<html>`/`<body>`/fonts) becomes `app/[lang]/layout.tsx` — the outermost layout with `<html>` has to live at the locale segment, since `<html lang>`/`dir` need to be set server-side per locale with zero client flash. Everything under `app/(site)/*` moves to `app/[lang]/(site)/*` unchanged otherwise. `generateStaticParams` returns `en`/`de`/`ar` so all three render statically at build time.
- **Middleware:** new root `middleware.ts` handles the un-prefixed entry point (`/`) — reads a previously-set locale cookie if present, else negotiates from `Accept-Language`, and redirects to `/en`, `/de`, or `/ar`. A direct visit to `/ar/services` just renders, no redirect.
- **`LangProvider` becomes URL-driven.** Seeded from the `[lang]` route param (passed down server-side) instead of reading `localStorage` on mount. The language switcher navigates to the same path under the other locale prefix (`router.push` to `/${newLang}${pathWithoutCurrentLangPrefix}`) instead of flipping local state. The cookie is still written on switch, purely so a later unprefixed `/` visit returns to that choice — it's no longer the source of truth.
- **Per-locale metadata:** each page's metadata returns the translated title/description for its locale, plus `alternates.languages` hreflang entries pointing at the `en`/`de`/`ar` versions of that page.
- **`dir` is set server-side, not a client effect:** `app/[lang]/layout.tsx` sets `<html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>` directly from the route param.
- `next.config.ts`'s existing `/admin` → `admin.silicortex.de` redirects are unaffected — unprefixed, external, resolved before locale routing applies.

## Section 6: Arabic Translation & RTL

### Dictionary
`lib/dictionaries/ar.ts`: full Modern Standard Arabic translation, structurally identical to `en.ts`/`de.ts` — including `salesDashboard`, `workShowcase`, `experience`, etc., not just the marketing pages, because the shared `Dictionary` type requires full coverage. `lib/dictionaries/index.ts`'s `Lang` becomes `"en" | "de" | "ar"`.

**Owner decision: the owner will review this translation before launch** — go-live is gated on that review. Numeral style (Western `1,2,3` vs. Eastern Arabic-Indic `١,٢,٣`) defaults to Western for now, reviewable/changeable at that step.

### Language switcher
Segmented control (`EN | DE | ع`) replacing the current `en ↔ de` toggle button, same visual slot and minimal pill styling, now driving navigation (Section 5) instead of local state.

### RTL layout
- Non-logical directional Tailwind classes (`pl-`/`pr-`/`ml-`/`mr-`/`text-left`/`text-right`/`left-`/`right-`) convert to logical equivalents (`ps-`/`pe-`/`ms-`/`me-`/`text-start`/`text-end`/`start-`/`end-`) so they flip correctly under `dir="rtl"`. Files needing this: `Hero.tsx`, `NavbarClient.tsx`, `FreelanceNetwork.tsx`, `ProfileCard.tsx`, `Timeline.tsx` (its `-translate-x-1/2` centering paired with a logical offset leaves the dot off-center otherwise), the sales-dashboard page's inline `textAlign`/`marginLeft` styles, `SalesChatbot.tsx`'s absolutely-positioned arrow icon, plus the new `ServicesShowcase.tsx` and reshaped `BentoGrid.tsx`.
- `lib/motion.ts`'s `slideIn(dir)` animates the physical x-axis today (used by `Timeline`) — needs to flip under RTL.
- Symmetric decorative elements (background grid, blurred gradient blobs) are left as-is.
- Phone numbers, email addresses, and tech/product names (React, Next.js, etc.) inside Arabic paragraphs get wrapped in `dir="ltr"` (or `<bdi>`) so they aren't visually reordered by the surrounding RTL context.
- Arabic font: Noto Sans Arabic (or similar) via `next/font/google`, applied through a CSS variable keyed on `:lang(ar)` — no conditional load, no layout-shift risk.
- **Bug fix:** `readLang()` in `LangProvider.tsx` only recognizes `"de"` today and falls back to `"en"` for anything else — a stored `"ar"` would silently load English. Needs a proper whitelist check against all three codes (this logic also moves/adapts into the new URL-driven seeding in Section 5).

## Section 7: Hardcoded Strings to Move Into the Dictionary

Found during review — English text that bypasses `useLang()` entirely today, which would stay stuck in English even after Arabic ships:
- `SalesChatbot.tsx` doesn't use the dictionary at all yet.
- `NavbarClient.tsx`'s "Projects" dropdown label, and the "Sales Dashboard" / "AI-powered analytics demo" child-link text, are hardcoded.
- Various `aria-label`s (`"Toggle language"`, `"Toggle theme"`, etc.) are hardcoded English.

All of these move into the dictionary across `en`/`de`/`ar`.

---

## What's Left to the Builder

- Exact Arabic copy wording (mine to write, formal business MSA, matching the existing confident/concise tone) — subject to the owner's pre-launch review (Section 6).
- Exact broadened hero/tagline copy (Section 3) across all three languages.
- Final icon choices for the 2 new service categories (🛒 / 🚀 proposed, can swap during implementation).
- Minor spacing/layout tuning of the 4-category `BentoGrid` on mobile breakpoints.
- Section anchor ids on `/services`, its metadata, and accent color per category card — cosmetic.
- Exact middleware locale-negotiation logic (cookie vs. `Accept-Language` precedence) — standard pattern, no behavior ambiguity worth flagging.
