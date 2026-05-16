"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { TiltCard } from "@/components/TiltCard"
import { AnimatedHeading } from "@/components/AnimatedHeading"
import { scaleUp, staggerContainer } from "@/lib/motion"

const BUILDS = [
  {
    href: "/work/sales-dashboard",
    tag: "Data & Analytics",
    title: "AI-Powered Sales Dashboard",
    description:
      "A full-featured sales analytics dashboard with KPI cards, revenue trend charts, order breakdowns, product rankings, and a live Claude AI insights panel.",
    tech: ["React", "Recharts", "Claude AI", "Next.js"],
    gradient: "from-violet-600/20 to-cyan-600/20",
    border: "border-violet-500/20 hover:border-violet-500/50",
    tagColor: "text-violet-400 bg-violet-500/10",
  },
]

export function FeaturedBuilds() {
  return (
    <section className="bg-slate-950 px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <span className="mb-3 block text-sm font-medium uppercase tracking-widest text-violet-400">
            Featured Builds
          </span>
          <AnimatedHeading
            as="h2"
            className="mb-4 font-bold text-white"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 3rem)" }}
          >
            Real Products, Live Demos
          </AnimatedHeading>
          <p className="max-w-2xl text-slate-400" style={{ fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" }}>
            Interactive examples of dashboards, tools, and AI-integrated interfaces we build for clients.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {BUILDS.map((b) => (
            <motion.div key={b.href} variants={scaleUp}>
              <TiltCard className="h-full">
                <Link href={b.href} className="group block h-full">
                  <div className={`h-full rounded-2xl border bg-gradient-to-br ${b.gradient} ${b.border} p-6 backdrop-blur-sm transition-all duration-200`}>
                    <span className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${b.tagColor}`}>
                      {b.tag}
                    </span>
                    <h3 className="mb-3 text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">
                      {b.title}
                    </h3>
                    <p className="mb-5 text-sm leading-relaxed text-slate-400">{b.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {b.tech.map(t => (
                        <span key={t} className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-400">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-violet-400 group-hover:gap-2 transition-all">
                      View live demo
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
