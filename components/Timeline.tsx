"use client"

import { motion } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"

export function Timeline() {
  const { dict } = useLang()
  const exp = dict.experience

  return (
    <section className="bg-slate-950 px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2
            className="mb-4 font-bold text-white"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 3rem)" }}
          >
            {exp.title}
          </h2>
          <p className="text-slate-400" style={{ fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" }}>
            {exp.subtitle}
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute start-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-blue-500/20 to-transparent sm:start-1/2 sm:-translate-x-1/2" />

          <div className="flex flex-col gap-12">
            {exp.items.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -32 : 32 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`relative flex gap-6 sm:gap-0 ${
                  i % 2 === 0
                    ? "sm:flex-row"
                    : "sm:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div className="absolute start-6 top-6 -translate-x-1/2 sm:start-1/2">
                  <div className="h-3 w-3 rounded-full border-2 border-blue-500 bg-slate-950 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                </div>

                {/* Year label */}
                <div
                  className={`hidden w-[calc(50%-2rem)] sm:flex ${
                    i % 2 === 0 ? "justify-end pe-10" : "justify-start ps-10"
                  }`}
                >
                  <span className="mt-4 text-sm font-semibold text-blue-400">{item.year}</span>
                </div>

                {/* Card */}
                <div
                  className={`ms-12 w-full sm:ms-0 sm:w-[calc(50%-2rem)] ${
                    i % 2 === 0 ? "sm:ps-10" : "sm:pe-10"
                  }`}
                >
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-blue-500/20">
                    <span className="mb-2 block text-xs font-semibold text-blue-400 sm:hidden">
                      {item.year}
                    </span>
                    <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mb-4 text-sm leading-relaxed text-slate-400">{item.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
