import type { Metadata } from "next"
import { ContactForm } from "@/components/ContactForm"
import { ProfileCard } from "@/components/ProfileCard"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Silicortex to start your project.",
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
