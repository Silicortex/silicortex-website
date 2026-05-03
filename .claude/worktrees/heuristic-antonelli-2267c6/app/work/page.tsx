import type { Metadata } from "next"
import { WorkShowcase } from "@/components/WorkShowcase"

export const metadata: Metadata = {
  title: "Work",
  description:
    "AI agents, automation workflows, and dashboards built by Silicortex.",
}

export default function WorkPage() {
  return (
    <main className="pt-16">
      <WorkShowcase />
    </main>
  )
}
