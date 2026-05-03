import type { Metadata } from "next"
import { ContactForm } from "@/components/ContactForm"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Silicortex to start your project.",
}

export default function ContactPage() {
  return (
    <main className="pt-16">
      <ContactForm />
    </main>
  )
}
