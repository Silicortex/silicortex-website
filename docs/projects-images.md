# Project images on /work

All images live in `public/work/` and are referenced from `lib/projects.ts`.
Clients are named (owner, 23.10.2026: they agreed to be shown with name and
logo). Until then the projects were anonymised; the screenshots below are the
named originals again. Every screenshot was checked by hand for personal data
(the admin's euro amounts stay hidden).

| File | Project | Source | What was hidden |
|---|---|---|---|
| `vibecenter-storefront.webp` | Vibe Center (own) | `vibe-center-app/presentation/screenshots/07-storefront-public.png` (demo tenant) | bottom 62 px cropped (Next.js dev badge) |
| `vibecenter-dashboard.webp` | Vibe Center (own) | `…/17-dashboard-overview.png` | Next.js dev badge |
| `translation-venue-screen.webp` | Sada (client) | `sada/docs/guides/img/venue-screen.png` | — (mosque name is the placeholder "Musterstadt-Moschee") |
| `translation-phone.webp` | Live translation (client) | `sada/docs/guides/img/phone-held.png` | — (no name on it) |
| `workshop-hero.webp` | Misraba (client) | `misraba-app/docs/screenshots/01-home-en.jpg` (README) | — |
| `care-platform-home.webp`, `care-platform-admin.webp` | EuroCura (client) | local run of `eurocura` (Docker, DemoSeeder data — fictional names), 23.10.2026 | cookie and notification prompts dismissed |
| `ecommerce-home.webp` | PowerSource (own) | local run of `powersource-app` (Docker), 23.10.2026 | cookie bar declined |
| `tv-launcher-home.webp` | TV launcher (own) | `bayt-launcher/docs/design/theme-preview.html`, dark home screen at 1920×1080 | — (no product name on the screen) |
| `association-website.webp` | DVKZWI Wiesbaden (pro bono) | `dvkzwi-website/theme/screenshot.png` | — |
| `robot-dashboard.webp` | Noah robot (own) | `pib-brain` dashboard (`dashboard/app/static/noah.html`) rendered locally with its own identity/capabilities data, 23.10.2026 | the live parts that need the robot (camera, "unreachable" status) hidden; header and tile grid unchanged |
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
