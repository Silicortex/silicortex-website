# Project images on /work

All images live in `public/work/` and are referenced from `lib/projects.ts`.
Rules (owner, 23.10.2026): client projects are shown **anonymised** — no client
name, logo, address, phone number or link. Every screenshot below was checked
by hand; names were painted over with the surrounding background colour, not
blurred. Stock photos are labelled "Symbolbild / Stock photo" on the page until
the owner's own images replace them.

| File | Project | Source | What was hidden |
|---|---|---|---|
| `vibecenter-storefront.webp` | Vibe Center (own) | `vibe-center-app/presentation/screenshots/07-storefront-public.png` (demo tenant) | bottom 62 px cropped (Next.js dev badge) |
| `vibecenter-dashboard.webp` | Vibe Center (own) | `…/17-dashboard-overview.png` | Next.js dev badge |
| `translation-venue-screen.webp` | Live translation (client) | `sada/docs/guides/img/venue-screen.png` | app logo and name, bottom right; mosque name is already the placeholder "Musterstadt-Moschee" |
| `translation-phone.webp` | Live translation (client) | `sada/docs/guides/img/phone-held.png` | — (no name on it) |
| `workshop-hero.webp` | Workshop manager (client) | local run of `misraba-app` (Docker, seed data), 23.10.2026 | in the browser before the screenshot: logo and name in the header hidden, headline shortened to "Heavy Machinery Repair", GPS line and "Since 1987 in Musaffah, Abu Dhabi" hidden; phone number is the seed placeholder |
| `care-platform-home.webp`, `care-platform-admin.webp` | Care platform (client) | local run of `eurocura` (Docker, DemoSeeder data — fictional names), 23.10.2026 | product name replaced by "CarePlatform" in the browser, logo hidden, cookie and notification prompts dismissed |
| `ecommerce-home.webp` | E-commerce platform (own) | local run of `powersource-app` (Docker), 23.10.2026 | product name replaced by "Store", logo hidden, cookie bar declined |
| `tv-launcher-home.webp` | TV launcher (own) | `bayt-launcher/docs/design/theme-preview.html`, dark home screen at 1920×1080 | — (no product name on the screen) |
| `association-website.webp` | Association website (pro bono) | `dvkzwi-website/theme/screenshot.png` | association logo + full name (header), name line in the hero |
| `admin-overview.webp` | Admin & bookkeeping (own) | local screenshot, 23.10.2026 | all euro amounts, dev badge (cropped) |
| `silicortex-website.webp` | silicortex.de (own) | live screenshot, 23.10.2026 | — |

All nine projects now have real screenshots; no stock photos are in use.
The `photo` frame (with its "stock photo" note) stays available for a project
that has nothing to show yet.

Local runs used temporary port overrides kept outside the repos (Sada was
running on 8000/6379); every stack was stopped afterwards with
`docker compose stop`, data volumes untouched.

Earlier placeholders (Unsplash, free licence — removed 23.10.2026) are no
longer used.

To replace a placeholder: put the new image in `public/work/`, update its
entry in `lib/projects.ts` (file, width, height, and `frame` — `"browser"`,
`"phone"`, `"screen"` or `"photo"`; only `"photo"` shows the stock-photo note).
