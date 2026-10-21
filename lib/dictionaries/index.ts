import type { Dictionary } from "./en"
import en from "./en"
import de from "./de"
import ar from "./ar"

export const locales = ["en", "de", "ar"] as const
export type Lang = (typeof locales)[number]
export const defaultLocale: Lang = "en"

export type { Dictionary }

const dictionaries: Record<Lang, Dictionary> = { en, de, ar }

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang] ?? dictionaries[defaultLocale]
}

export function isValidLocale(value: string): value is Lang {
  return (locales as readonly string[]).includes(value)
}

// Single source of truth for "is this locale right-to-left" — previously
// duplicated as an identical `(lang as string) === "ar"` ternary in both
// LangProvider.tsx and app/[lang]/layout.tsx. Centralizing it here means the
// two sites can't drift, and a future RTL locale only needs updating here.
export function isRtl(lang: Lang): boolean {
  return lang === "ar"
}
