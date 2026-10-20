import type { Metadata } from "next"
import { locales, type Lang } from "@/lib/dictionaries"

export function localizedMetadata(lang: Lang, path: string, title: string, description: string): Metadata {
  const languages: Record<string, string> = {}
  for (const l of locales) languages[l] = `/${l}${path}`
  return { title, description, alternates: { languages } }
}
