// Shared by build-business-cards.mjs (writes) and check-business-cards.mjs
// (verifies). Everything that influences the rendered PDFs is listed in
// SOURCE_FILES; change that list if the card ever gains another input.

import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const SOURCE_DIR = "docs/print"
export const OUTPUT_DIR = "public/downloads"
export const MANIFEST_PATH = "public/downloads/business-cards.manifest.json"

export const SOURCE_FILES = [
  "docs/print/business-card.html",
  "docs/print/assets/logo-mark.png",
  "scripts/build-business-cards.mjs",
  "scripts/business-cards.config.mjs",
]

// What the website links from /contact: EN for en + de visitors, AR for ar.
export const VARIANTS = [
  { lang: "en", theme: "dark", file: "silicortex-business-card-en.pdf" },
  { lang: "ar", theme: "dark", file: "silicortex-business-card-ar.pdf" },
  { lang: "en", theme: "light", file: "silicortex-business-card-en-light.pdf" },
  { lang: "ar", theme: "light", file: "silicortex-business-card-ar-light.pdf" },
]

export async function computeSourceHash(root) {
  const h = createHash("sha256")
  for (const rel of SOURCE_FILES) {
    h.update(rel)
    h.update(await readFile(join(root, rel)))
  }
  return h.digest("hex")
}
