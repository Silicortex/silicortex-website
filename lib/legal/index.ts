import "server-only"
import type { Lang } from "@/lib/dictionaries/locales"
import type { LegalContent } from "./types"
import de from "./de"
import en from "./en"
import ar from "./ar"

export type { LegalContent, LegalPage, LegalSection } from "./types"

// Server-only on purpose: see the note in ./types.ts.
const content: Record<Lang, LegalContent> = { de, en, ar }

export function getLegalContent(lang: Lang): LegalContent {
  return content[lang] ?? content.de
}
