# Project images on /work

All images live in `public/work/` and are referenced from `lib/projects.ts`.
Rules (owner, 23.10.2026): client projects are shown **anonymised** — no client
name, logo, address, phone number or link. Every screenshot below was checked
by hand; names were painted over with the surrounding background colour, not
blurred. Stock photos are labelled "Symbolbild / Stock photo" on the page until
the owner's own images replace them.

| File | Project | Source | What was removed |
|---|---|---|---|
| `vibecenter-storefront.webp` | Vibe Center (own) | `vibe-center-app/presentation/screenshots/07-storefront-public.png` (demo tenant) | bottom 62 px cropped (Next.js dev badge) |
| `vibecenter-dashboard.webp` | Vibe Center (own) | `…/17-dashboard-overview.png` | Next.js dev badge |
| `translation-venue-screen.webp` | Live translation (client) | `sada/docs/guides/img/venue-screen.png` | app logo and name, bottom right; mosque name is already the placeholder "Musterstadt-Moschee" |
| `translation-phone.webp` | Live translation (client) | `sada/docs/guides/img/phone-held.png` | — (no name on it) |
| `workshop-board.webp` | Workshop manager (client) | `misraba-app/docs/screenshots/11-board.jpg` | workshop logo and name in the sidebar |
| `workshop-board-phone.webp` | Workshop manager (client) | `misraba-app/docs/screenshots/19-board-phone.jpg` | workshop logo and name in the header |
| `association-website.webp` | Association website (pro bono) | `dvkzwi-website/theme/screenshot.png` | association logo + full name (header), name line in the hero |
| `admin-overview.webp` | Admin & bookkeeping (own) | local screenshot, 23.10.2026 | all euro amounts, dev badge (cropped) |
| `silicortex-website.webp` | silicortex.de (own) | live screenshot, 23.10.2026 | — |
| `care-platform-photo.webp` | Care platform | Unsplash, free licence: photo `mwGrAl1X514` ("Two hands holding each other with care") | placeholder until own image |
| `ecommerce-photo.webp` | E-commerce platform | Unsplash, free licence: photo `MGaFENpDCsw` ("person holding cardboard box on table") | placeholder until own image |
| `tv-launcher-photo.webp` | TV launcher | Unsplash, free licence: photo `Wx23XPAlseI` ("black flat screen tv turned on near white wooden table") | placeholder until own image |

Unsplash licence: free for commercial use, no permission or attribution
required (https://unsplash.com/license). Only photos marked free were used,
none from Unsplash+.

To replace a placeholder: put the new image in `public/work/`, update its
entry in `lib/projects.ts` (file, width, height, and `frame` — `"browser"`,
`"phone"`, `"screen"` or `"photo"`; only `"photo"` shows the stock-photo note).
