import type { Dictionary } from "./en"
import en from "./en"
import de from "./de"
import ar from "./ar"
import { defaultLocale, type Lang } from "./locales"

// Server-side entry point. Client components must import locale helpers from
// ./locales instead, so the dictionaries themselves never enter a client
// bundle; SiteChrome resolves the one dictionary a page needs and hands it to
// LangProvider as a prop.
export { locales, defaultLocale, isValidLocale, isRtl, type Lang } from "./locales"
export type { Dictionary }

const dictionaries: Record<Lang, Dictionary> = { en, de, ar }

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang] ?? dictionaries[defaultLocale]
}
