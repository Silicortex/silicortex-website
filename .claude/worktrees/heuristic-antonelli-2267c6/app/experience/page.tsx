import type { Metadata } from "next"
import { Timeline } from "@/components/Timeline"

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Technical mastery in AI, automation, and full-stack development.",
}

export default function ExperiencePage() {
  return (
    <main className="pt-16">
      <Timeline />
    </main>
  )
}
