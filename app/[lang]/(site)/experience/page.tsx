import type { Metadata } from "next"
import { Timeline } from "@/components/Timeline"
import { getDictionary, type Lang } from "@/lib/dictionaries"
import { localizedMetadata } from "@/lib/i18n/metadata"

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  const { meta } = getDictionary(lang)
  return localizedMetadata(lang, "/experience", meta.experience.title, meta.experience.description)
}

export default function ExperiencePage() {
  return (
    <main className="pt-16">
      <Timeline />
    </main>
  )
}
