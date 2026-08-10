import { Hero } from "@/components/Hero"
import { BentoGrid } from "@/components/BentoGrid"

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
