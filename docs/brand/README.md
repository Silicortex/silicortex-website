# Silicortex brand kit

Everything needed to use the Silicortex logo on social media, GitHub and
elsewhere. All files are generated, so do not edit them by hand:

```
npm run logo:build    # symbol, icons, favicons, business-card symbols
npm run brand:build   # the social-media files in docs/brand/social/ (needs internet, for the fonts)
npm run cards:build   # business-card PDFs, after a logo change
```

`silicortex-styleguide-board.png` here is the approved design reference the
symbol was drawn from.

## The symbol

An interlocking ribbon **S** on a hexagon: two identical hooks, each running
along half the hexagon and turning inward with a rounded end. The symbol
stands alone. It carries no text and needs no background shape.

- **Use the files as they are.** Do not stretch, rotate, recolour, outline,
  add shadows or glow, or put text inside the hexagon.
- **Clear space:** keep at least the height of the symbol's ribbon (about
  one fifth of the symbol) free on every side; in tight places, never less.
- **Minimum size:** 16 px on screen, 6 mm in print.
- **Light or dark:** use `-light` on white and light backgrounds and `-dark`
  on navy and black. The dark edition lifts the deep blue so it stays distinct.
- **One colour** (stamps, engraving, single-colour print): `-mono` (navy),
  `-mono-blue` or `-mono-white`.

## Colours

| Name | Hex | Use |
|---|---|---|
| Navy | `#101D46` | backgrounds of icons and banners, mono symbol, text on light |
| Electric blue | `#174BFF` | primary brand blue, gradient start |
| Cyan | `#00D5E8` | accent, gradient end, links on dark |
| White | `#FFFFFF` | backgrounds, text on dark |
| Deep night | `#020617` | the website's dark theme background |

Gradient: `#174BFF → #00D5E8`. In the symbol it runs along each ribbon from
cyan at the outer end to deep blue at the inner end.

- **Wordmark "Silicortex":** navy on light backgrounds, white on dark. Never
  cyan on white, which is too faint for text.
- **Accents** (icons, links, highlights): cyan on dark, electric blue on light.
- **In code:** the Tailwind classes `brand-navy`, `brand-blue` and
  `brand-cyan` (e.g. `text-brand-navy`), defined in `app/globals.css` of both
  silicortex-website and silicortex-admin. The business card has the same
  values as CSS variables.

## Typography

- **Wordmark and headlines:** Unbounded, Bold (700).
- **Text:** Geist, Regular / Medium.
- **Arabic:** Readex Pro.

All three are free on Google Fonts.

## Which file goes where

Profile pictures are square and keep the symbol inside the circle crop most
platforms apply. Banners keep their content in the middle band, because
profile pictures and device crops cover the edges.

| Where | File |
|---|---|
| GitHub organisation **Silicortex** → Settings → Profile picture | `social/avatar-dark-500.png` |
| GitHub repository → Settings → Social preview | `social/github-social-preview-1280x640.png` |
| LinkedIn company page logo, X profile picture | `social/avatar-dark-400.png` |
| LinkedIn profile background | `social/banner-linkedin-personal-1584x396.png` |
| LinkedIn company page cover | `social/banner-linkedin-company-1128x191.png` |
| X header | `social/banner-x-1500x500.png` |
| Instagram, Facebook, YouTube, WhatsApp Business picture | `social/avatar-dark-1080.png` |
| Facebook cover | `social/banner-facebook-1640x624.png` |
| YouTube channel art | `social/banner-youtube-2560x1440.png` |
| Link previews, post images | `social/og-image-1200x630.png` |
| Vercel team avatar | `social/avatar-dark-500.png` |
| Where a light picture fits better | `social/avatar-light-*.png` |

The vector symbols and app icons are published on the website, so they can
be linked or downloaded directly:

| File | Use |
|---|---|
| [silicortex-symbol-light.svg](https://www.silicortex.de/brand/silicortex-symbol-light.svg) | symbol on light backgrounds |
| [silicortex-symbol-dark.svg](https://www.silicortex.de/brand/silicortex-symbol-dark.svg) | symbol on dark backgrounds |
| [silicortex-symbol-mono.svg](https://www.silicortex.de/brand/silicortex-symbol-mono.svg) | one colour, navy (also `-mono-blue`, `-mono-white`) |
| [silicortex-icon.svg](https://www.silicortex.de/brand/silicortex-icon.svg) | app icon, dark (also `silicortex-icon-light.svg`) |
| [silicortex-symbol-1024.png](https://www.silicortex.de/brand/silicortex-symbol-1024.png) | large PNG with a transparent background, for documents and slides |
| [apple-touch-icon.png](https://www.silicortex.de/brand/apple-touch-icon.png) | iOS home screen |
| [logo-preview.html](https://www.silicortex.de/brand/logo-preview.html) | all variants on one page |

The same files are in `public/brand/` in this repository.

## Where the logo is used

| System | Where | Updated by |
|---|---|---|
| silicortex.de | navbar (one mark per theme), favicon, app icons | `npm run logo:build` |
| Business cards | `docs/print/business-card.html` → PDFs on /contact | `npm run logo:build`, then `npm run cards:build` |
| admin.silicortex.de | header, login page, favicon, app icons | copy `public/brand/silicortex-mark.png`, `app/favicon.ico`, `app/icon.svg` and `app/apple-icon.png` into silicortex-admin |
| GitHub, LinkedIn, X, Vercel and other platforms | profile pictures and banners | upload by hand (table above) |
| Google Cloud OAuth consent screen | intentionally **no** logo: adding one makes Google require brand verification of the app | — |
