// Runs before every `next build` (see "prebuild" in package.json) and refuses
// to build the site when the business-card source has changed since the PDFs
// under public/downloads were last rendered. No browser needed, so it runs on
// Vercel too. Fix: `npm run cards:build`, then commit the regenerated PDFs.

import { readFile, stat } from "node:fs/promises"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { computeSourceHash, MANIFEST_PATH, OUTPUT_DIR, VARIANTS } from "./business-cards.config.mjs"

const root = fileURLToPath(new URL("..", import.meta.url))

let manifest
try {
  manifest = JSON.parse(await readFile(join(root, MANIFEST_PATH), "utf8"))
} catch {
  fail(`${MANIFEST_PATH} is missing`)
}
for (const { file } of VARIANTS) {
  try {
    if ((await stat(join(root, OUTPUT_DIR, file))).size < 1024) fail(`${OUTPUT_DIR}/${file} is empty`)
  } catch {
    fail(`${OUTPUT_DIR}/${file} is missing`)
  }
}
const current = await computeSourceHash(root)
if (current !== manifest.sourceHash) {
  fail("docs/print/business-card.html (or its assets) changed after the PDFs were rendered")
}
console.log(`business cards up to date (${current.slice(0, 12)}…)`)

function fail(why) {
  console.error(`\nBusiness-card PDFs are out of date: ${why}.\nRun \`npm run cards:build\` and commit public/downloads.\n`)
  process.exit(1)
}
