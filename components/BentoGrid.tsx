"use client"

import { motion } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"
import { TiltCard } from "@/components/TiltCard"
import { AnimatedHeading } from "@/components/AnimatedHeading"
import { scaleUp, staggerContainer } from "@/lib/motion"

const glassCard =
  "group relative overflow-hidden rounded-3xl border border-black/5 p-8 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.15)] dark:border-white/10 dark:backdrop-blur-xl dark:hover:border-white/20 dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.5)]"

const spanConfigs = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-2",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
]

const accentColors = [
  "text-blue-600 dark:text-blue-400",
  "text-violet-600 dark:text-violet-400",
  "text-cyan-600 dark:text-[#5dcfd6]",
  "text-emerald-600 dark:text-emerald-400",
  "text-amber-600 dark:text-amber-400",
]

const iconBg = [
  "bg-blue-100 dark:bg-blue-500/10",
  "bg-violet-100 dark:bg-violet-500/10",
  "bg-cyan-100 dark:bg-cyan-500/10",
  "bg-emerald-100 dark:bg-emerald-500/10",
  "bg-amber-100 dark:bg-amber-500/10",
]

const cardBgs = [
  "bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900/50",
  "bg-gradient-to-br from-violet-50 to-white dark:from-violet-900/20 dark:to-slate-900/50",
  "bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-900/20 dark:to-slate-900/50",
  "bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900/50",
  "bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900/50",
]

const icons = ["🤖", "⚡", "🛠️", "🧭", "🚀"]

function BentoCard({
  title, description, tag, span, accent, iconBgClass, bgClass, icon, index,
}: {
  title: string; description: string; tag: string; span: string
  accent: string; iconBgClass: string; bgClass: string; icon: string; index: number
}) {
  const inner = (
    <div className={`${glassCard} ${span} ${bgClass} ${index === 0 ? "glow-border" : ""} flex flex-col justify-between gap-6 h-full`}>
      <div className="flex items-start justify-between gap-4">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/10 ${iconBgClass}`}>
          {icon}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${accent} bg-current/10`}>
          {tag}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className={`font-bold tracking-tight text-slate-900 dark:text-white ${index === 0 ? "text-2xl" : "text-xl"}`}>
          {title}
        </h3>
        <p className={`leading-relaxed text-slate-600 dark:text-slate-400 ${index === 0 ? "text-lg" : "text-sm"}`}>
          {description}
        </p>
      </div>
    </div>
  )

  return (
    <motion.div variants={scaleUp} className={span}>
      <TiltCard className="h-full">
        {inner}
      </TiltCard>
    </motion.div>
  )
}

export function BentoGrid() {
  const { dict } = useLang()
  const s = dict.services

  return (
    <section className="bg-white px-6 py-24 dark:bg-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <AnimatedHeading
            as="h2"
            className="mb-4 font-bold tracking-tight text-slate-900 dark:text-white"
            style={{ fontSize: "clamp(2rem, 4vw + 0.5rem, 3.5rem)" }}
          >
            {s.title}
          </AnimatedHeading>
          <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-400" style={{ fontSize: "clamp(1rem, 1.5vw + 0.5rem, 1.25rem)" }}>
            {s.subtitle}
          </p>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-3 snap-y"
        >
          {s.items.map((item, i) => (
            <BentoCard key={item.title} {...item} span={spanConfigs[i]} accent={accentColors[i]} iconBgClass={iconBg[i]} bgClass={cardBgs[i]} icon={icons[i]} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
