import type { Metadata } from "next"
import { ContactForm } from "@/components/ContactForm"
import { ProfileCard } from "@/components/ProfileCard"
import { getDictionary, type Lang } from "@/lib/dictionaries"
import { localizedMetadata } from "@/lib/i18n/metadata"

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  const { meta } = getDictionary(lang)
  return localizedMetadata(lang, "/contact", meta.contact.title, meta.contact.description)
}

export default function ContactPage() {
  return (
    <main className="pt-16">
      <section className="bg-white px-6 pt-24 dark:bg-slate-950 sm:px-8">
        <ProfileCard />
      </section>
      <ContactForm />
    </main>
  )
}
