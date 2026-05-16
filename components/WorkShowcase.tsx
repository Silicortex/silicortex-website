"use client"

import { useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useLang } from "@/components/providers/LangProvider"
import { AnimatedHeading } from "@/components/AnimatedHeading"
import { clipReveal, scaleUp, staggerContainer } from "@/lib/motion"

interface WorkItem {
  tag: string; icon: string; title: string
  description: string; tech: string[]; href?: string; cta?: string
  featured?: boolean; accent: string; accentMuted: string
}

interface Section {
  id: string; icon: string; label: string; title: string; description: string
  accent: string; accentMuted: string; items: WorkItem[]
}

export function WorkShowcase() {
  const { dict } = useLang()
  const ws = dict.workShowcase

  const SECTIONS: Section[] = [
    {
      id: "capabilities",
      icon: "💻",
      label: ws.sections.capabilities.label,
      title: ws.sections.capabilities.title,
      description: ws.sections.capabilities.description,
      accent: "#ec4899",
      accentMuted: "rgba(236,72,153,0.1)",
      items: [
        {
          tag: ws.sections.capabilities.items[0].tag, icon: "🌐",
          title: ws.sections.capabilities.items[0].title,
          description: ws.sections.capabilities.items[0].description,
          tech: ["React", "Next.js", "Vue", "Python", "Java"],
          accent: "#ec4899", accentMuted: "rgba(236,72,153,0.12)",
        },
        {
          tag: ws.sections.capabilities.items[1].tag, icon: "🗄️",
          title: ws.sections.capabilities.items[1].title,
          description: ws.sections.capabilities.items[1].description,
          tech: ["AWS", "Dagster", "PostgreSQL", "MongoDB"],
          accent: "#8b5cf6", accentMuted: "rgba(139,92,246,0.12)",
        },
        {
          tag: ws.sections.capabilities.items[2].tag, icon: "🤖",
          title: ws.sections.capabilities.items[2].title,
          description: ws.sections.capabilities.items[2].description,
          tech: ["GenAI", "Machine Learning", "Predictive Models"],
          accent: "#10b981", accentMuted: "rgba(16,185,129,0.12)",
        },
        {
          tag: ws.sections.capabilities.items[3].tag, icon: "🔗",
          title: ws.sections.capabilities.items[3].title,
          description: ws.sections.capabilities.items[3].description,
          tech: ["REST APIs", "OAuth 2.0", "Shopify", "Meta"],
          accent: "#f59e0b", accentMuted: "rgba(245,158,11,0.12)",
        },
      ],
    },
    {
      id: "dashboards",
      icon: "📊",
      label: ws.sections.dashboards.label,
      title: ws.sections.dashboards.title,
      description: ws.sections.dashboards.description,
      accent: "#a78bfa",
      accentMuted: "rgba(167,139,250,0.1)",
      items: [
        {
          tag: ws.sections.dashboards.items[0].tag, icon: "📊",
          title: ws.sections.dashboards.items[0].title,
          description: ws.sections.dashboards.items[0].description,
          tech: ["Next.js", "Recharts", "Claude AI", "Tool Use"],
          href: "/work/sales-dashboard", cta: ws.sections.dashboards.items[0].cta, featured: true,
          accent: "#a78bfa", accentMuted: "rgba(167,139,250,0.12)",
        },
      ],
    },
    {
      id: "saas",
      icon: "🏢",
      label: ws.sections.saas.label,
      title: ws.sections.saas.title,
      description: ws.sections.saas.description,
      accent: "#14b8a6",
      accentMuted: "rgba(20,184,166,0.1)",
      items: [
        {
          tag: ws.sections.saas.items[0].tag, icon: "🏢",
          title: ws.sections.saas.items[0].title,
          description: ws.sections.saas.items[0].description,
          tech: ["Next.js", "Supabase", "PostgreSQL", "RLS"],
          featured: true,
          accent: "#14b8a6", accentMuted: "rgba(20,184,166,0.12)",
        },
      ],
    },
    {
      id: "ai-agents",
      icon: "🧠",
      label: ws.sections.aiAgents.label,
      title: ws.sections.aiAgents.title,
      description: ws.sections.aiAgents.description,
      accent: "#38bdf8",
      accentMuted: "rgba(56,189,248,0.1)",
      items: [
        {
          tag: ws.sections.aiAgents.items[0].tag, icon: "🧠",
          title: ws.sections.aiAgents.items[0].title,
          description: ws.sections.aiAgents.items[0].description,
          tech: ["LangChain", "LlamaIndex", "Pinecone", "OpenAI"],
          accent: "#38bdf8", accentMuted: "rgba(56,189,248,0.10)",
        },
        {
          tag: ws.sections.aiAgents.items[1].tag, icon: "💬",
          title: ws.sections.aiAgents.items[1].title,
          description: ws.sections.aiAgents.items[1].description,
          tech: ["Claude AI", "GPT-4", "Slack API", "WhatsApp"],
          accent: "#34d399", accentMuted: "rgba(52,211,153,0.10)",
        },
        {
          tag: ws.sections.aiAgents.items[2].tag, icon: "🔍",
          title: ws.sections.aiAgents.items[2].title,
          description: ws.sections.aiAgents.items[2].description,
          tech: ["Anthropic SDK", "Tavily", "Python", "n8n"],
          accent: "#f472b6", accentMuted: "rgba(244,114,182,0.10)",
        },
      ],
    },
    {
      id: "automation",
      icon: "⚡",
      label: ws.sections.automation.label,
      title: ws.sections.automation.title,
      description: ws.sections.automation.description,
      accent: "#fb923c",
      accentMuted: "rgba(251,146,60,0.1)",
      items: [
        {
          tag: ws.sections.automation.items[0].tag, icon: "⚡",
          title: ws.sections.automation.items[0].title,
          description: ws.sections.automation.items[0].description,
          tech: ["n8n", "REST APIs", "Webhooks", "PostgreSQL"],
          accent: "#fb923c", accentMuted: "rgba(251,146,60,0.10)",
        },
      ],
    },
  ]

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
            {ws.header}
          </span>
          <AnimatedHeading
            as="h1"
            className="mb-4 font-extrabold text-slate-900 dark:text-white"
            style={{ fontSize: "clamp(2rem, 4vw + 0.5rem, 3.5rem)" }}
          >
            {ws.title}
          </AnimatedHeading>
          <p className="max-w-2xl text-slate-600 dark:text-slate-400" style={{ fontSize: "clamp(0.95rem, 1vw + 0.5rem, 1.15rem)" }}>
            {ws.subtitle}
          </p>
        </motion.div>

        {/* Section nav pills with layoutId */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-16 flex flex-wrap gap-3"
        >
          {SECTIONS.map(s => (
            <motion.button
              key={s.id}
              layoutId={`pill-${s.id}`}
              onClick={() => scrollTo(s.id)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
              style={{
                borderColor: s.accent + "44",
                background: s.accentMuted,
                color: s.accent,
              }}
            >
              <span>{s.icon}</span>
              {s.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Sections */}
        <div className="space-y-24">
          {SECTIONS.map((section, si) => (
            <motion.div
              key={section.id}
              ref={el => { sectionRefs.current[section.id] = el }}
              variants={clipReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              {/* Section header */}
              <div className="mb-8 flex items-start gap-4">
                <div
                  className="mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ background: section.accentMuted, border: `1px solid ${section.accent}33` }}
                >
                  {section.icon}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: section.accent }}
                    >
                      {section.label}
                    </span>
                    <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${section.accent}33, transparent)` }} />
                  </div>
                  <h2 className="mb-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                    {section.title}
                  </h2>
                  <p className="max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {section.description}
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
                {section.items.map((item, i) => (
                  <motion.div
                    key={item.title}
                    variants={scaleUp}
                    className={item.featured ? "sm:col-span-2" : ""}
                  >
                    <WorkCard item={item} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

function WorkCard({ item }: { item: WorkItem }) {
  const inner = (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 border-black/8 bg-white dark:border-white/8 dark:bg-white/[0.025] hover:shadow-lg dark:hover:shadow-none"
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = item.accent + "55"
        ;(e.currentTarget as HTMLElement).style.background = item.accentMuted
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = ""
        ;(e.currentTarget as HTMLElement).style.background = ""
      }}
    >
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${item.accent}, transparent)` }} />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide" style={{ background: item.accentMuted, color: item.accent }}>
            {item.tag}
          </span>
          <span className="text-2xl">{item.icon}</span>
        </div>

        <h3 className="mb-3 text-lg font-bold text-slate-900 transition-colors dark:text-white">
          {item.title}
        </h3>

        <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {item.description}
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          {item.tech.map(t => (
            <span key={t} className="rounded-md border border-black/6 bg-black/[0.03] px-2 py-1 text-xs font-medium text-slate-500 dark:border-white/6 dark:bg-white/[0.04] dark:text-slate-500">
              {t}
            </span>
          ))}
        </div>

        {item.cta && (
          <div
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg group-hover:gap-3"
            style={{ background: `linear-gradient(135deg, ${item.accent}, ${item.accent}cc)` }}
          >
            {item.cta}
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )

  if (item.href) return <Link href={item.href} className="block h-full">{inner}</Link>
  return <div className="h-full">{inner}</div>
}
