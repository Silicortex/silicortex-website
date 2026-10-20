import type { Metadata } from "next"
import { Hero } from "@/components/Hero"
import { BentoGrid } from "@/components/BentoGrid"
import { getDictionary, type Lang } from "@/lib/dictionaries"
import { localizedMetadata } from "@/lib/i18n/metadata"

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  const { meta } = getDictionary(lang)
  return localizedMetadata(lang, "/", meta.home.title, meta.home.description)
}

export default function Home() {
  return (
    <main>
      <div className="snap-section">
        <Hero />
      </div>
      <div className="snap-section">
        <BentoGrid />
      </div>
    </main>
  )
}
