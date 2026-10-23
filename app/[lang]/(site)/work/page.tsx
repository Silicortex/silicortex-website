import type { Metadata } from "next"
import { ProjectsShowcase } from "@/components/ProjectsShowcase"
import { getDictionary, type Lang } from "@/lib/dictionaries"
import { localizedMetadata } from "@/lib/i18n/metadata"

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  const { meta } = getDictionary(lang)
  return localizedMetadata(lang, "/work", meta.work.title, meta.work.description)
}

export default async function WorkPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
  return (
    <main className="pt-16">
      <ProjectsShowcase lang={lang} dict={getDictionary(lang)} />
    </main>
  )
}
