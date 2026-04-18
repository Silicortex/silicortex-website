"use client"

import { motion } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"

const glassCard =
  "rounded-2xl border border-black/8 bg-black/[0.03] p-6 backdrop-blur-sm transition-colors hover:border-blue-500/20 hover:bg-black/5 dark:border-white/8 dark:bg-white/5 dark:hover:bg-white/8"

const spanConfigs = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-2",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
]

const accentColors = [
  "text-blue-500 dark:text-blue-400",
  "text-violet-500 dark:text-violet-400",
  "text-cyan-500 dark:text-cyan-400",
  "text-emerald-500 dark:text-emerald-400",
  "text-amber-500 dark:text-amber-400",
]

const iconBg = [
  "bg-blue-500/10",
  "bg-violet-500/10",
  "bg-cyan-500/10",
  "bg-emerald-500/10",
  "bg-amber-500/10",
]

const icons = ["🤖", "⚡", "🛠️", "🧭", "🚀"]

function BentoCard({
  title, description, tag, span, accent, iconBgClass, icon, index,
}: {
  title: string; description: string; tag: string; span: string
  accent: string; iconBgClass: string; icon: string; index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      className={`${glassCard} ${span} flex flex-col justify-between gap-4`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${iconBgClass}`}>
          {icon}
        </span>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${accent} border-current/20`}>
          {tag}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className={`font-semibold text-slate-900 dark:text-white ${index === 0 ? "text-xl" : "text-base"}`}>
          {title}
        </h3>
        <p className={`leading-relaxed text-slate-600 dark:text-slate-400 ${index === 0 ? "text-base" : "text-sm"}`}>
          {description}
        </p>
      </div>
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
          className="mb-14 text-center"
        >
          <h2 className="mb-4 font-bold text-slate-900 dark:text-white" style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 3rem)" }}>
            {s.title}
          </h2>
          <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-400" style={{ fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" }}>
            {s.subtitle}
          </p>
        </motion.div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-3 snap-y">
          {s.items.map((item, i) => (
            <BentoCard key={item.title} {...item} span={spanConfigs[i]} accent={accentColors[i]} iconBgClass={iconBg[i]} icon={icons[i]} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
