import type { MetadataRoute } from "next"
import { locales } from "@/lib/dictionaries/locales"

// For search engines: every page in every language, each naming its two other languages.
// The host is www.silicortex.de, where silicortex.de redirects, so Google reads the final address.
const SITE = "https://www.silicortex.de"

const PAGES = ["", "/services", "/work", "/work/sales-dashboard", "/network", "/contact", "/impressum", "/datenschutz"]

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((path) => {
    const languages = Object.fromEntries(locales.map((l) => [l, `${SITE}/${l}${path}`]))
    return locales.map((lang) => ({
      url: `${SITE}/${lang}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path === "/impressum" || path === "/datenschutz" ? 0.2 : 0.7,
      alternates: { languages },
    }))
  })
}
