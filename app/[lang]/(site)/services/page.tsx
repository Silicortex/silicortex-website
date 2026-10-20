import type { Metadata } from "next"
import { ServicesShowcase } from "@/components/ServicesShowcase"
import { getDictionary, type Lang } from "@/lib/dictionaries"
import { localizedMetadata } from "@/lib/i18n/metadata"

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  const { meta } = getDictionary(lang)
  return localizedMetadata(lang, "/services", meta.services.title, meta.services.description)
}

export default function ServicesPage() {
  return (
    <main className="pt-16">
      <ServicesShowcase />
    </main>
  )
}
