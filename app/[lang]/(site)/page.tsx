import type { Metadata } from "next"
import { Hero } from "@/components/Hero"
import { BentoGrid } from "@/components/BentoGrid"
import { getDictionary, type Lang } from "@/lib/dictionaries"
import { localizedMetadata } from "@/lib/i18n/metadata"

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  const { meta } = getDictionary(lang)
  // Deliberately don't pass `title` through: any non-empty string would be
  // merged through the root layout's `title.template` ("%s | Silicortex"),
  // but the homepage should keep the bare brand name it rendered before this
  // task (the root layout's unwrapped `title.default`). Only `description`
  // and `alternates` are locale-specific for this page.
  const { description, alternates } = localizedMetadata(lang, "/", meta.home.title, meta.home.description)
  return { description, alternates }
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
