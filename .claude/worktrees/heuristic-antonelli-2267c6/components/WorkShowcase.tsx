"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

interface WorkItem {
  tag: string; icon: string; title: string
  description: string; tech: string[]; href?: string; cta?: string
  featured?: boolean; accent: string; accentMuted: string
}

interface Section {
  id: string; icon: string; label: string; title: string; description: string
  accent: string; accentMuted: string; items: WorkItem[]
}

const SECTIONS: Section[] = [
  {
    id: "dashboards",
    icon: "📊",
    label: "Dashboards",
    title: "Data Dashboards",
    description: "Interactive analytics interfaces with live charts, KPI tracking, and AI-powered insights panels.",
    accent: "#a78bfa",
    accentMuted: "rgba(167,139,250,0.1)",
    items: [
      {
        tag: "Live Demo", icon: "📊",
        title: "AI-Powered Sales Dashboard",
        description: "Full-featured analytics dashboard with KPI cards, revenue trends, order breakdowns, product rankings, a natural-language chatbot that queries the database, and a Claude AI insights panel.",
        tech: ["Next.js", "Recharts", "Claude AI", "Tool Use"],
        href: "/work/sales-dashboard", cta: "View live demo", featured: true,
        accent: "#a78bfa", accentMuted: "rgba(167,139,250,0.12)",
      },
    ],
  },
  {
    id: "ai-agents",
    icon: "🧠",
    label: "AI Agents",
    title: "AI Agents & Assistants",
    description: "Autonomous systems and conversational agents that reason, retrieve data, and act on your behalf — around the clock.",
    accent: "#38bdf8",
    accentMuted: "rgba(56,189,248,0.1)",
    items: [
      {
        tag: "AI Agents", icon: "🧠",
        title: "RAG Knowledge Systems",
        description: "Retrieval-Augmented Generation that connects your private knowledge base to an LLM. Ask questions in natural language, get precise answers from your own data.",
        tech: ["LangChain", "LlamaIndex", "Pinecone", "OpenAI"],
        accent: "#38bdf8", accentMuted: "rgba(56,189,248,0.10)",
      },
      {
        tag: "AI Agents", icon: "💬",
        title: "Chatbots & Assistants",
        description: "Conversational agents that handle support, sales qualification, and onboarding — live on your website, Slack, or WhatsApp 24/7.",
        tech: ["Claude AI", "GPT-4", "Slack API", "WhatsApp"],
        accent: "#34d399", accentMuted: "rgba(52,211,153,0.10)",
      },
      {
        tag: "AI Agents", icon: "🔍",
        title: "Research Agents",
        description: "Autonomous agents that scour the web, aggregate data, write reports, and surface insights — on demand, without manual effort.",
        tech: ["Anthropic SDK", "Tavily", "Python", "n8n"],
        accent: "#f472b6", accentMuted: "rgba(244,114,182,0.10)",
      },
    ],
  },
  {
    id: "automation",
    icon: "⚡",
    label: "Automation",
    title: "Workflow Automation",
    description: "End-to-end pipelines that connect your entire stack — triggered by events, enriched by AI, and delivered without manual work.",
    accent: "#fb923c",
    accentMuted: "rgba(251,146,60,0.1)",
    items: [
      {
        tag: "Automation", icon: "⚡",
        title: "n8n Workflow Automation",
        description: "Visual workflows that connect your entire stack — API triggers, AI processing, data transforms, database writes, and notifications in one canvas.",
        tech: ["n8n", "REST APIs", "Webhooks", "PostgreSQL"],
        accent: "#fb923c", accentMuted: "rgba(251,146,60,0.10)",
      },
    ],
  },
]

export function WorkShowcase() {
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
            Our Work
          </span>
          <h1 className="mb-4 font-extrabold text-slate-900 dark:text-white" style={{ fontSize: "clamp(2rem, 4vw + 0.5rem, 3.5rem)" }}>
            What We Build
          </h1>
          <p className="max-w-2xl text-slate-600 dark:text-slate-400" style={{ fontSize: "clamp(0.95rem, 1vw + 0.5rem, 1.15rem)" }}>
            Real projects, live demos, and the capabilities behind every engagement.
          </p>
        </motion.div>

        {/* Section nav pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-16 flex flex-wrap gap-3"
        >
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105"
              style={{
                borderColor: s.accent + "44",
                background: s.accentMuted,
                color: s.accent,
              }}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </motion.div>

        {/* Sections */}
        <div className="space-y-24">
          {SECTIONS.map((section, si) => (
            <motion.div
              key={section.id}
              ref={el => { sectionRefs.current[section.id] = el }}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: si * 0.05 }}
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
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.08 }}
                    className={item.featured ? "sm:col-span-2" : ""}
                  >
                    <WorkCard item={item} />
                  </motion.div>
                ))}
              </div>
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
          <div className="flex items-center gap-1.5 text-sm font-bold transition-all duration-200 group-hover:gap-2.5" style={{ color: item.accent }}>
            {item.cta}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )

  if (item.href) return <Link href={item.href} className="block h-full">{inner}</Link>
  return <div className="h-full">{inner}</div>
}
