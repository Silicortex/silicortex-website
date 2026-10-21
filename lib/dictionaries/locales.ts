// Locale metadata with no dictionary imports. Client components import from
// here (not from ./index) so the en/de/ar dictionaries stay on the server —
// importing index.ts pulled all three (~25 KB gzipped) into every page's
// client bundle even though a page only ever renders one of them.

export const locales = ["en", "de", "ar"] as const
export type Lang = (typeof locales)[number]
export const defaultLocale: Lang = "en"

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
