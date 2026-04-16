import type { Dictionary } from "./en"
import en from "./en"
import de from "./de"

export type { Dictionary }
export type Lang = "en" | "de"

const dictionaries: Record<Lang, Dictionary> = { en, de }

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang] ?? dictionaries.en
}
