"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"

export function FreelanceNetwork() {
  const { dict } = useLang()
  const net = dict.network

  return (
    <section className="relative overflow-hidden bg-white px-6 py-24 dark:bg-slate-950 sm:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/6 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 font-bold text-slate-900 dark:text-white" style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 3rem)" }}>
            {net.title}
          </h2>
          <p className="mx-auto max-w-xl text-slate-600 dark:text-slate-400" style={{ fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" }}>
            {net.subtitle}
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {net.perks.map((perk, i) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-black/8 bg-black/[0.02] p-6 backdrop-blur-sm transition-colors hover:border-blue-500/20 dark:border-white/8 dark:bg-white/5"
            >
              <div className="mb-4 text-3xl">{perk.icon}</div>
              <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{perk.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{perk.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-8 text-center backdrop-blur-sm sm:p-12"
        >
          <p className="mx-auto mb-8 max-w-2xl text-slate-700 dark:text-slate-300" style={{ fontSize: "clamp(0.95rem, 1vw + 0.5rem, 1.125rem)" }}>
            {net.description}
          </p>
          <Link
            href="/contact"
            className="inline-flex min-h-[48px] items-center rounded-full bg-blue-600 px-10 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            {net.cta}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
