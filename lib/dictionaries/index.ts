import type { Dictionary } from "./en"
import en from "./en"
import de from "./de"

export const locales = ["en", "de"] as const
export type Lang = (typeof locales)[number]
export const defaultLocale: Lang = "en"

export type { Dictionary }

const dictionaries: Record<Lang, Dictionary> = { en, de }

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang] ?? dictionaries[defaultLocale]
}

export function isValidLocale(value: string): value is Lang {
  return (locales as readonly string[]).includes(value)
}
