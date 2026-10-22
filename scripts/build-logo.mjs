// Builds every Silicortex logo file from one geometric definition.
//
//   npm run logo:build
//
// The symbol: two point-symmetric ribbon hooks on a hexagon. Each hook runs
// along half the hexagon and turns inward into a bar with a round end; where
// a bar meets the other hook, a slit separates them (the interlocking look).
// The turn height and the slit width are derived, not tuned, so the white
// inner tips are sharp points and each slit continues the inner edge of the
// ribbon above it exactly.
//
// Writes (commit all of them):
//   public/brand/   the files the style board lists, plus a GitHub/Vercel
//                   avatar PNG and logo-preview.html to look at them all
//   public/brand/silicortex-mark{,-dark}.png   navbar (40px slot, 4×), per theme;
//                   a new name, not logo-mark.png, so cached old logos can't linger
//   app/favicon.ico, app/icon.svg, app/apple-icon.png
//   docs/print/assets/silicortex-symbol{,-dark}.svg   business card (vector, for print);
//                   then run `npm run cards:build`
//
// The admin app (silicortex-admin) keeps copies of silicortex-mark.png, the
// favicon and the icons; copy them over after a rebuild.

import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const root = fileURLToPath(new URL("..", import.meta.url))

export const COLORS = { navy: "#101D46", blue: "#174BFF", cyan: "#00D5E8", white: "#FFFFFF" }

// R: circumradius of the centreline hexagon; w: ribbon width; barLen: the
// inner bar's length along its 30° direction; rc: outer corner radius.
const SYMBOL = { R: 100, w: 52, barLen: 66, rc: 14 }
// Small sizes (favicon, app icon): thinner ribbons give a wider slit, so the
// S still reads at 16px. Same construction, different proportions.
const SMALL = { R: 100, w: 46, barLen: 62, rc: 14 }

const c30 = Math.cos(Math.PI / 6)
const f = (n) => +n.toFixed(2)

function geometry(p) {
  const { R, w } = p
  const y1 = -R / 2 + w * Math.tan(Math.PI / 6) // turn height of the upper hook
  const gap = c30 * (R / 2 - y1) - w
  const a = R * c30
  const dir = [c30, 0.5]
  const turn = [-a, y1]
  const end = [-a + dir[0] * p.barLen, y1 + dir[1] * p.barLen]
  // The upper hook starts on the right column at the other hook's turn, so
  // its start is hidden under that hook's bar and shows only as the slit.
  const upper = [[a, -y1], [a, -R / 2], [0, -R], [-a, -R / 2], turn, end]
  const lower = upper.map(([x, y]) => [-x, -y])
  const upperBar = [[turn[0] - dir[0] * w, turn[1] - dir[1] * w], end]
  const lowerBar = upperBar.map(([x, y]) => [-x, -y])
  const Ro = R + w / 2 / c30
  const ao = Ro * c30
  const hex = [[0, -Ro], [ao, -Ro / 2], [ao, Ro / 2], [0, Ro], [-ao, Ro / 2], [-ao, -Ro / 2]]
  return { a, y1, gap, upper, lower, upperBar, lowerBar, hex, half: Math.ceil(Ro) + 1 }
}

const line = (pts) => "M" + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")

function roundedPolygon(pts, r) {
  let out = ""
  pts.forEach(([cx, cy], i) => {
    const [px, py] = pts[(i + pts.length - 1) % pts.length]
    const [nx, ny] = pts[(i + 1) % pts.length]
    const l1 = Math.hypot(px - cx, py - cy), l2 = Math.hypot(nx - cx, ny - cy)
    out += `${i ? "L" : "M"}${f(cx + ((px - cx) / l1) * r)} ${f(cy + ((py - cy) / l1) * r)} `
    out += `Q${f(cx)} ${f(cy)} ${f(cx + ((nx - cx) / l2) * r)} ${f(cy + ((ny - cy) / l2) * r)} `
  })
  return out + "Z"
}

// Gradient stops, cyan at each hook's outer end to deep blue at its inner
// end. The dark variant lifts the deep end so it stays distinct on navy.
const RAMPS = {
  light: [COLORS.cyan, COLORS.blue, "#0E2BC9"],
  dark: [COLORS.cyan, "#2A62FF", "#2350FF"],
}

/**
 * One self-contained SVG.
 * paint: "light" | "dark" (gradients) or a solid colour.
 * bg / radius / pad: optional background square (app icons).
 * id: prefix for ids, so several symbols can share one HTML page.
 */
function symbolSvg({ paint = "light", p = SYMBOL, bg = null, radius = 0, pad = 0, id = "sx" } = {}) {
  const g = geometry(p)
  const half = g.half + pad
  const box = `${-half} ${-half} ${2 * half} ${2 * half}`
  const ramp = RAMPS[paint]
  const fillA = ramp ? `url(#${id}-a)` : paint
  const fillB = ramp ? `url(#${id}-b)` : paint
  const grad = (gid, from, to) => `
    <linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${f(from[0])}" y1="${f(from[1])}" x2="${f(to[0])}" y2="${f(to[1])}">
      <stop offset="0" stop-color="${ramp[0]}"/><stop offset="0.45" stop-color="${ramp[1]}"/><stop offset="1" stop-color="${ramp[2]}"/>
    </linearGradient>`
  const grads = ramp
    ? grad(`${id}-a`, [g.a, -p.R * 0.35], [-g.a, -p.R * 0.2]) + grad(`${id}-b`, [-g.a, p.R * 0.35], [g.a, p.R * 0.2])
    : ""
  const h = g.half
  const mask = (mid, bar) => `
    <mask id="${mid}" maskUnits="userSpaceOnUse" x="${-h}" y="${-h}" width="${2 * h}" height="${2 * h}">
      <rect x="${-h}" y="${-h}" width="${2 * h}" height="${2 * h}" fill="#fff"/>
      <path d="${line(bar)}" fill="none" stroke="#000" stroke-width="${f(p.w + 2 * g.gap)}" stroke-linecap="round"/>
    </mask>`
  const ribbon = (pts, fill, cap) =>
    `<path d="${line(pts)}" fill="none" stroke="${fill}" stroke-width="${p.w}" stroke-linejoin="miter" stroke-miterlimit="10" stroke-linecap="${cap}"/>`
  const back = bg ? `\n  <rect x="${-half}" y="${-half}" width="${2 * half}" height="${2 * half}" rx="${radius}" fill="${bg}"/>` : ""
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" width="${2 * half}" height="${2 * half}">
  <title>Silicortex</title>
  <defs>${grads}
    <clipPath id="${id}-clip"><path d="${roundedPolygon(g.hex, p.rc)}"/></clipPath>${mask(`${id}-mu`, g.lowerBar)}${mask(`${id}-ml`, g.upperBar)}
  </defs>${back}
  <g clip-path="url(#${id}-clip)">
    <g mask="url(#${id}-mu)">${ribbon(g.upper.slice(0, -1), fillA, "butt")}</g>
    ${ribbon(g.upper.slice(-3), fillA, "round")}
    <g mask="url(#${id}-ml)">${ribbon(g.lower.slice(0, -1), fillB, "butt")}</g>
    ${ribbon(g.lower.slice(-3), fillB, "round")}
  </g>
</svg>
`
}

// App icon: the small-size symbol on a rounded navy square, ~62 % of the side.
function iconSvg({ bg = COLORS.navy, paint = "dark", radius = 0.22 } = {}) {
  const half = geometry(SMALL).half
  const pad = Math.round(half * 0.62)
  return symbolSvg({ p: SMALL, paint, bg, pad, radius: Math.round(2 * (half + pad) * radius), id: "si" })
}

const png = (svg, size) => sharp(Buffer.from(svg), { density: 72 * (size / 100) * 2 }).resize(size, size).png().toBuffer()

/** ICO with PNG payloads — every current browser reads these. */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i
    header.writeUInt8(size >= 256 ? 0 : size, e)
    header.writeUInt8(size >= 256 ? 0 : size, e + 1)
    header.writeUInt16LE(1, e + 4) // colour planes
    header.writeUInt16LE(32, e + 6) // bits per pixel
    header.writeUInt32LE(data.length, e + 8)
    header.writeUInt32LE(offset, e + 12)
    offset += data.length
  })
  return Buffer.concat([header, ...images.map((i) => i.data)])
}

function previewHtml(files) {
  const tile = (src, label, bg) =>
    `<figure style="background:${bg}"><img src="${src}" alt=""><figcaption>${label}</figcaption></figure>`
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Silicortex logo files</title>
<style>
  body { margin: 0; padding: 32px 16px; font: 14px/1.5 system-ui, sans-serif; background: #f5f7fb; color: ${COLORS.navy}; }
  h1 { font-size: 18px; margin: 0 0 16px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; max-width: 1100px; }
  figure { margin: 0; border-radius: 12px; padding: 20px; display: grid; place-items: center; gap: 10px; border: 1px solid #e3e7ee; }
  img { width: 120px; height: 120px; }
  figcaption { font-size: 12px; color: #7d8aa3; }
  .sizes { display: flex; align-items: end; gap: 16px; margin-top: 24px; }
</style></head><body>
<h1>Silicortex — logo files (generated by scripts/build-logo.mjs)</h1>
<div class="grid">
${files.map(([src, label, bg]) => tile(src, label, bg)).join("\n")}
</div>
<h1 style="margin-top:24px">App icon at 16, 24, 32, 48, 128 px</h1>
<div class="sizes">${[16, 24, 32, 48, 128].map((s) => `<img src="silicortex-icon.svg" style="width:${s}px;height:${s}px" alt="">`).join("")}</div>
</body></html>
`
}

async function main() {
  const brand = join(root, "public/brand")
  await mkdir(brand, { recursive: true })
  const out = (rel, data) => writeFile(join(root, rel), data)

  const symbol = symbolSvg()
  const symbolDark = symbolSvg({ paint: "dark" })
  const files = {
    "silicortex-symbol.svg": symbol,
    "silicortex-symbol-light.svg": symbol,
    "silicortex-symbol-dark.svg": symbolDark,
    "silicortex-symbol-mono.svg": symbolSvg({ paint: COLORS.navy }),
    "silicortex-symbol-mono-blue.svg": symbolSvg({ paint: COLORS.blue }),
    "silicortex-symbol-mono-white.svg": symbolSvg({ paint: COLORS.white }),
    "silicortex-icon.svg": iconSvg(),
    "silicortex-icon-light.svg": iconSvg({ bg: COLORS.white, paint: "light" }),
    "favicon.svg": symbolSvg({ p: SMALL, paint: "dark", id: "sf" }),
  }
  for (const [name, svg] of Object.entries(files)) await out(`public/brand/${name}`, svg)

  const appleIcon = await png(symbolSvg({ p: SMALL, paint: "dark", bg: COLORS.navy, pad: Math.round(geometry(SMALL).half * 0.5) }), 180)
  await out("public/brand/apple-touch-icon.png", appleIcon)
  await out("public/brand/silicortex-avatar-512.png", await png(iconSvg({ radius: 0 }), 512))
  await out("public/brand/silicortex-symbol-1024.png", await png(symbol, 1024))
  await out("public/brand/logo-preview.html", previewHtml([
    ["silicortex-symbol-light.svg", "symbol · light", "#ffffff"],
    ["silicortex-symbol-dark.svg", "symbol · dark", COLORS.navy],
    ["silicortex-symbol-dark.svg", "symbol · dark (site)", "#020617"],
    ["silicortex-symbol-mono-blue.svg", "mono blue", "#ffffff"],
    ["silicortex-symbol-mono.svg", "mono navy", "#ffffff"],
    ["silicortex-symbol-mono-white.svg", "mono white", COLORS.navy],
    ["silicortex-icon-light.svg", "app icon · light", "#f5f7fb"],
    ["silicortex-icon.svg", "app icon · dark", "#f5f7fb"],
    ["apple-touch-icon.png", "apple touch icon", "#f5f7fb"],
  ]))

  // Where the apps and the business card use the mark.
  await out("public/brand/silicortex-mark.png", await png(symbol, 160))
  await out("public/brand/silicortex-mark-dark.png", await png(symbolDark, 160))
  await out("app/icon.svg", files["favicon.svg"])
  await out("app/apple-icon.png", appleIcon)
  const small = symbolSvg({ p: SMALL, paint: "dark", id: "so" })
  await out("app/favicon.ico", ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(small, size) })))))
  await out("docs/print/assets/silicortex-symbol.svg", symbol)
  await out("docs/print/assets/silicortex-symbol-dark.svg", symbolDark)

  console.log("logo files written: public/brand, app/{favicon.ico,icon.svg,apple-icon.png}, docs/print/assets")
}

await main()
