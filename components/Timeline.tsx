"use client"

import { motion } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"
import { AnimatedHeading } from "@/components/AnimatedHeading"
import { slideIn } from "@/lib/motion"

export function Timeline() {
  const { dict } = useLang()
  const exp = dict.experience

  return (
    <section className="bg-slate-50 px-6 py-24 dark:bg-slate-950 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <AnimatedHeading
            as="h2"
            className="mb-4 font-bold text-slate-900 dark:text-white"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 3rem)" }}
          >
            {exp.title}
          </AnimatedHeading>
          <p className="text-slate-600 dark:text-slate-400" style={{ fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" }}>
            {exp.subtitle}
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute start-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-blue-500/20 to-transparent sm:start-1/2 sm:-translate-x-1/2" />

          <div className="flex flex-col gap-12">
            {exp.items.map((item, i) => {
              const direction = i % 2 === 0 ? "left" : "right"
              return (
                <motion.div
                  key={item.title}
                  variants={slideIn(direction)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className={`relative flex gap-6 sm:gap-0 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  <div className="absolute start-6 top-6 -translate-x-1/2 sm:start-1/2">
                    <div className="h-3 w-3 rounded-full border-2 border-blue-500 bg-slate-50 shadow-[0_0_12px_rgba(59,130,246,0.6)] dark:bg-slate-950" />
                  </div>

                  <div className={`hidden w-[calc(50%-2rem)] sm:flex ${i % 2 === 0 ? "justify-end pe-10" : "justify-start ps-10"}`}>
                    <span className="mt-4 text-sm font-semibold text-blue-500 dark:text-blue-400">{item.year}</span>
                  </div>

                  <div className={`ms-12 w-full sm:ms-0 sm:w-[calc(50%-2rem)] ${i % 2 === 0 ? "sm:ps-10" : "sm:pe-10"}`}>
                    <motion.div
                      whileHover={{ y: -3 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="rounded-2xl border border-black/8 bg-white p-6 backdrop-blur-sm transition-colors hover:border-blue-500/20 dark:border-white/8 dark:bg-white/5"
                    >
                      <span className="mb-2 block text-xs font-semibold text-blue-500 dark:text-blue-400 sm:hidden">
                        {item.year}
                      </span>
                      <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                      {"company" in item && (
                        <p className="mb-3 text-xs font-medium text-blue-500 dark:text-blue-400">{(item as { company: string }).company}</p>
                      )}
                      <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.description}</p>
                      {"link" in item && (
                        <a href={(item as { link: string }).link} target="_blank" rel="noopener noreferrer" className="mb-4 inline-block text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">
                          Verify / View Credential ↗
                        </a>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-black/8 bg-black/[0.03] px-2.5 py-0.5 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
