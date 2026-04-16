import type { Metadata } from "next"
import { AIAgentsSection } from "@/components/AIAgentsSection"
import { WorkflowCanvas } from "@/components/WorkflowCanvas"

export const metadata: Metadata = {
  title: "Work",
  description:
    "AI Agents and n8n automation workflows built by Mo-Tek-Solutions.",
}

export default function WorkPage() {
  return (
    <main className="pt-16">
      <AIAgentsSection />
      <WorkflowCanvas />
    </main>
  )
}
