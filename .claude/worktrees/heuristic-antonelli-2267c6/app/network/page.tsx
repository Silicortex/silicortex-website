import type { Metadata } from "next"
import { FreelanceNetwork } from "@/components/FreelanceNetwork"

export const metadata: Metadata = {
  title: "Network",
  description:
    "Join the Silicortex freelance network. Work remotely on high-value AI and automation projects.",
}

export default function NetworkPage() {
  return (
    <main className="pt-16">
      <FreelanceNetwork />
    </main>
  )
}
