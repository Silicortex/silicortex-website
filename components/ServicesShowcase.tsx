"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useLang } from "@/components/providers/LangProvider"
import { AnimatedHeading } from "@/components/AnimatedHeading"
import { clipReveal, scaleUp, staggerContainer } from "@/lib/motion"

interface ServiceItem {
  title: string; description: string; tags: string[]
}

interface Category {
  id: string; icon: string; label: string; title: string; description: string
  accent: string; accentMuted: string; items: ServiceItem[]
}

const ICONS: Record<string, string> = {
  "ai-automation": "🤖",
  "software-dev": "💻",
  ecommerce: "🛒",
  "brand-launch": "🚀",
}

const ACCENTS: Record<string, { accent: string; accentMuted: string }> = {
  "ai-automation": { accent: "#3b82f6", accentMuted: "rgba(59,130,246,0.1)" },
  "software-dev": { accent: "#8b5cf6", accentMuted: "rgba(139,92,246,0.1)" },
  ecommerce: { accent: "#06b6d4", accentMuted: "rgba(6,182,212,0.1)" },
  "brand-launch": { accent: "#10b981", accentMuted: "rgba(16,185,129,0.1)" },
}

export function ServicesShowcase() {
  const { dict, localeHref } = useLang()
  const sp = dict.servicesPage

  const CATEGORIES: Category[] = sp.categories.map(c => ({
    id: c.id,
    icon: ICONS[c.id] ?? "✨",
    label: c.label,
    title: c.title,
    description: c.description,
    accent: ACCENTS[c.id]?.accent ?? "#3b82f6",
    accentMuted: ACCENTS[c.id]?.accentMuted ?? "rgba(59,130,246,0.1)",
    items: c.items,
  }))

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-24 dark:bg-[#020617] sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <span className="mb-3 block text-sm font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400">
            {sp.header}
          </span>
          <AnimatedHeading
            as="h1"
            className="mb-4 font-extrabold text-slate-900 dark:text-white"
            style={{ fontSize: "clamp(2rem, 4vw + 0.5rem, 3.5rem)" }}
          >
            {sp.title}
          </AnimatedHeading>
          <p className="max-w-2xl text-slate-600 dark:text-slate-400" style={{ fontSize: "clamp(0.95rem, 1vw + 0.5rem, 1.15rem)" }}>
            {sp.subtitle}
          </p>
        </motion.div>

        {/* Section nav pills with layoutId */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-16 flex flex-wrap gap-3"
        >
          {CATEGORIES.map(c => (
            <motion.button
              key={c.id}
              layoutId={`pill-${c.id}`}
              onClick={() => scrollTo(c.id)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
              style={{
                borderColor: c.accent + "44",
                background: c.accentMuted,
                color: c.accent,
              }}
            >
              <span>{c.icon}</span>
              {c.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Sections */}
        <div className="space-y-24">
          {CATEGORIES.map(category => (
            <motion.div
              key={category.id}
              id={category.id}
              ref={el => { sectionRefs.current[category.id] = el }}
              variants={clipReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              {/* Section header */}
              <div className="mb-8 flex items-start gap-4">
                <div
                  className="mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ background: category.accentMuted, border: `1px solid ${category.accent}33` }}
                >
                  {category.icon}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: category.accent }}
                    >
                      {category.label}
                    </span>
                    <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${category.accent}33, transparent)` }} />
                  </div>
                  <h2 className="mb-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                    {category.title}
                  </h2>
                  <p className="max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Cards grid */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {category.items.map(item => (
                  <motion.div key={item.title} variants={scaleUp}>
                    <ServiceCard item={item} accent={category.accent} accentMuted={category.accentMuted} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Category CTA */}
              <div className="mt-10 flex justify-center">
                <Link
                  href={localeHref("/contact")}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${category.accent}, ${category.accent}cc)` }}
                >
                  {dict.hero.cta2}
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

function ServiceCard({ item, accent, accentMuted }: { item: ServiceItem; accent: string; accentMuted: string }) {
  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 border-black/8 bg-white dark:border-white/8 dark:bg-white/[0.025] hover:shadow-lg dark:hover:shadow-none"
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = accent + "55"
        ;(e.currentTarget as HTMLElement).style.background = accentMuted
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = ""
        ;(e.currentTarget as HTMLElement).style.background = ""
      }}
    >
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-3 text-lg font-bold text-slate-900 transition-colors dark:text-white">
          {item.title}
        </h3>

        <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {item.tags.map(t => (
            <span key={t} className="rounded-md border border-black/6 bg-black/[0.03] px-2 py-1 text-xs font-medium text-slate-500 dark:border-white/6 dark:bg-white/[0.04] dark:text-slate-500">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
