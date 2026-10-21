// Renders docs/print/business-card.html into the PDFs the website serves.
//
//   npm run cards:build
//
// The HTML in docs/print is the single source of truth for the business card.
// This script is the only way the PDFs under public/downloads are produced, and
// `npm run cards:check` (run automatically before every `next build`) refuses
// to build the site if the PDFs are older than the source — so a change to the
// card cannot ship without the download on /contact changing with it.
//
// Needs a local Chrome (playwright-core launches the system "chrome" channel,
// it does not download a browser). Set CHROME_PATH to point at another binary.

import { chromium } from "playwright-core"
import { mkdir, writeFile } from "node:fs/promises"
import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, join, normalize } from "node:path"
import { fileURLToPath } from "node:url"
import { computeSourceHash, MANIFEST_PATH, OUTPUT_DIR, SOURCE_DIR, VARIANTS } from "./business-cards.config.mjs"

const root = fileURLToPath(new URL("..", import.meta.url))
const sourceDir = join(root, SOURCE_DIR)
const outputDir = join(root, OUTPUT_DIR)

// Chrome blocks web fonts on file:// pages, so serve docs/print on localhost.
const mime = { ".html": "text/html; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".css": "text/css" }
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "")
  const file = join(sourceDir, path)
  try {
    if (!(await stat(file)).isFile()) throw new Error("not a file")
    res.writeHead(200, { "content-type": mime[extname(file)] ?? "application/octet-stream" })
    res.end(await readFile(file))
  } catch {
    res.writeHead(404).end()
  }
})
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
const base = `http://127.0.0.1:${server.address().port}/business-card.html`

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" },
)
try {
  await mkdir(outputDir, { recursive: true })
  const page = await browser.newPage()
  for (const { lang, theme, file } of VARIANTS) {
    await page.goto(`${base}?lang=${lang}&theme=${theme}`, { waitUntil: "networkidle" })
    await page.emulateMedia({ media: "print" })
    await page.evaluate(() => document.fonts.ready)
    const fonts = await page.evaluate(() => ({
      unbounded: document.fonts.check('700 16px "Unbounded"'),
      readex: document.fonts.check('400 16px "Readex Pro"'),
    }))
    if (!fonts.unbounded || (lang === "ar" && !fonts.readex)) {
      throw new Error(`Fonts did not load for ${file} (${JSON.stringify(fonts)}) — is the machine online?`)
    }
    await page.pdf({ path: join(outputDir, file), printBackground: true, preferCSSPageSize: true })
    console.log(`wrote ${OUTPUT_DIR}/${file}`)
  }
  const hash = await computeSourceHash(root)
  await writeFile(join(root, MANIFEST_PATH), JSON.stringify({ sourceHash: hash, builtAt: new Date().toISOString() }, null, 2) + "\n")
  console.log(`wrote ${MANIFEST_PATH} (${hash.slice(0, 12)}…)`)
} finally {
  await browser.close()
  server.close()
}
