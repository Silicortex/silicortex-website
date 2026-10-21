import type { Metadata } from "next"
import { LegalArticle } from "@/components/LegalArticle"
import { getDictionary, type Lang } from "@/lib/dictionaries"
import { getLegalContent } from "@/lib/legal"
import { localizedMetadata } from "@/lib/i18n/metadata"

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  const { meta } = getDictionary(lang)
  return localizedMetadata(lang, "/impressum", meta.impressum.title, meta.impressum.description)
}

export default async function ImpressumPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
  return <LegalArticle page={getLegalContent(lang).impressum} />
}
