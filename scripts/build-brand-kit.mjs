// Builds the social-media brand kit from the logo files.
//
//   npm run logo:build && npm run brand:build
//
// Reads the symbols from public/brand/ (written by build-logo.mjs) and renders
// profile pictures and banners at each platform's size into docs/brand/social/.
// Uses Chrome like build-business-cards.mjs, for the Unbounded wordmark; the
// machine must be online for Google Fonts. docs/brand/README.md says which
// file goes where.

import { mkdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright-core"

const root = fileURLToPath(new URL("..", import.meta.url))
const out = join(root, "docs/brand/social")
const svg = (name) => readFile(join(root, "public/brand", name), "utf8")

const NAVY = "#101D46"
const DEEP = "#020617"

// Avatars: the symbol centred at 56 % of the side, so it survives the circle
// crop every platform applies. Banners: symbol + wordmark + one line, kept in
// the middle band because LinkedIn/X/YouTube cover the edges with the profile
// picture or crop by device.
const AVATARS = [
  { file: "avatar-dark-1080.png", size: 1080, theme: "dark", use: "Instagram, Facebook, YouTube, WhatsApp Business" },
  { file: "avatar-dark-500.png", size: 500, theme: "dark", use: "GitHub organisation (Silicortex), Vercel team" },
  { file: "avatar-dark-400.png", size: 400, theme: "dark", use: "LinkedIn company page, X" },
  { file: "avatar-light-1080.png", size: 1080, theme: "light", use: "same places, where a light picture fits better" },
  { file: "avatar-light-500.png", size: 500, theme: "light", use: "" },
  { file: "avatar-light-400.png", size: 400, theme: "light", use: "" },
]
const BANNERS = [
  { file: "banner-linkedin-personal-1584x396.png", w: 1584, h: 396, use: "LinkedIn profile background" },
  { file: "banner-linkedin-company-1128x191.png", w: 1128, h: 191, use: "LinkedIn company page cover" },
  { file: "banner-x-1500x500.png", w: 1500, h: 500, use: "X (Twitter) header" },
  { file: "banner-youtube-2560x1440.png", w: 2560, h: 1440, use: "YouTube channel art (safe area 1546×423 in the middle)" },
  { file: "banner-facebook-1640x624.png", w: 1640, h: 624, use: "Facebook cover" },
  { file: "github-social-preview-1280x640.png", w: 1280, h: 640, use: "GitHub repository social preview" },
  { file: "og-image-1200x630.png", w: 1200, h: 630, use: "Link previews (Open Graph), e.g. for posts" },
]

const FONT = `<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@700&family=Geist:wght@400;500&display=swap" rel="stylesheet">`

const page = (w, h, body, bg) => `<!doctype html><html><head><meta charset="utf-8">${FONT}<style>
  html, body { margin: 0; width: ${w}px; height: ${h}px; overflow: hidden; }
  body { background: ${bg}; display: flex; align-items: center; justify-content: center; }
  .mark svg { display: block; width: 100%; height: 100%; }
  .row { display: flex; align-items: center; }
  .name { font: 700 1em/1 "Unbounded", sans-serif; letter-spacing: -0.01em; color: #fff; }
  .line { font: 400 1em/1.3 "Geist", sans-serif; color: #9fb0d6; letter-spacing: 0.02em; }
</style></head><body>${body}</body></html>`

function avatarHtml(size, theme, symbolDark, symbolLight) {
  const bg = theme === "dark" ? NAVY : "#FFFFFF"
  const mark = theme === "dark" ? symbolDark : symbolLight
  const m = Math.round(size * 0.56)
  return page(size, size, `<div class="mark" style="width:${m}px;height:${m}px">${mark}</div>`, bg)
}

function bannerHtml(w, h, symbol) {
  // Scale everything from the shorter side; YouTube's art is mostly cropped,
  // so size it from its safe area instead.
  const unit = w === 2560 ? 423 : h
  const m = Math.round(unit * 0.42)
  const bg = `radial-gradient(ellipse at 30% 40%, #173a9e 0%, ${NAVY} 45%, ${DEEP} 100%)`
  return page(w, h, `
    <div class="row" style="gap:${Math.round(unit * 0.07)}px">
      <div class="mark" style="width:${m}px;height:${m}px">${symbol}</div>
      <div>
        <div class="name" style="font-size:${Math.round(unit * 0.17)}px">Silicortex</div>
        <div class="line" style="font-size:${Math.round(unit * 0.062)}px;margin-top:${Math.round(unit * 0.05)}px">AI &amp; Automation · Software · E-Commerce</div>
        <div class="line" style="font-size:${Math.round(unit * 0.05)}px;margin-top:${Math.round(unit * 0.025)}px;color:#00D5E8">silicortex.de</div>
      </div>
    </div>`, bg)
}

const [symbolDark, symbolLight] = await Promise.all([svg("silicortex-symbol-dark.svg"), svg("silicortex-symbol-light.svg")])
await mkdir(out, { recursive: true })
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" })
try {
  const tab = await browser.newPage()
  const render = async (html, w, h, file) => {
    await tab.setViewportSize({ width: w, height: h })
    await tab.setContent(html, { waitUntil: "networkidle" })
    await tab.evaluate(() => document.fonts.ready)
    if (html.includes('class="name"') && !(await tab.evaluate(() => document.fonts.check('700 16px "Unbounded"')))) {
      throw new Error(`Unbounded did not load for ${file} — is the machine online?`)
    }
    await tab.screenshot({ path: join(out, file), clip: { x: 0, y: 0, width: w, height: h } })
    console.log("wrote", file)
  }
  for (const a of AVATARS) await render(avatarHtml(a.size, a.theme, symbolDark, symbolLight), a.size, a.size, a.file)
  for (const b of BANNERS) await render(bannerHtml(b.w, b.h, symbolDark), b.w, b.h, b.file)
} finally {
  await browser.close()
}

export { AVATARS, BANNERS }
