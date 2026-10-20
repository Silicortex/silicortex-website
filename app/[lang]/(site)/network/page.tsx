import type { Metadata } from "next"
import { FreelanceNetwork } from "@/components/FreelanceNetwork"
import { getDictionary, type Lang } from "@/lib/dictionaries"
import { localizedMetadata } from "@/lib/i18n/metadata"

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  const { meta } = getDictionary(lang)
  return localizedMetadata(lang, "/network", meta.network.title, meta.network.description)
}

export default function NetworkPage() {
  return (
    <main className="pt-16">
      <FreelanceNetwork />
    </main>
  )
}
