"use client"

import { motion } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"
import { TiltCard } from "@/components/TiltCard"
import { AnimatedHeading } from "@/components/AnimatedHeading"
import { scaleUp, staggerContainer } from "@/lib/motion"

export function AIAgentsSection() {
  const { dict } = useLang()
  const ai = dict.work.aiAgents

  return (
    <section className="bg-slate-50 px-6 py-24 dark:bg-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <span className="mb-3 block text-sm font-medium uppercase tracking-widest text-blue-500 dark:text-blue-400">
            {ai.subtitle}
          </span>
          <AnimatedHeading
            as="h2"
            className="mb-4 font-bold text-slate-900 dark:text-white"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 3rem)" }}
          >
            {ai.title}
          </AnimatedHeading>
          <p className="max-w-2xl text-slate-600 dark:text-slate-400" style={{ fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" }}>
            {ai.description}
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-6 sm:grid-cols-3"
        >
          {ai.cards.map((card) => (
            <motion.div key={card.title} variants={scaleUp}>
              <TiltCard className="h-full">
                <div className="group h-full rounded-2xl border border-black/8 bg-black/[0.03] p-6 backdrop-blur-sm transition-all hover:border-blue-500/30 hover:bg-black/5 dark:border-white/8 dark:bg-white/5 dark:hover:bg-white/8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
                    {card.icon}
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{card.description}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
