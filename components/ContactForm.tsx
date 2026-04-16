"use client"

import { useState, type FormEvent } from "react"
import { motion } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"
import { siteConfig } from "@/lib/siteConfig"

export function ContactForm() {
  const { dict } = useLang()
  const f = dict.contact.form
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // In production, wire to an API route or form service
    setSubmitted(true)
  }

  return (
    <section className="bg-slate-950 px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2
            className="mb-4 font-bold text-white"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 3rem)" }}
          >
            {dict.contact.title}
          </h2>
          <p className="text-slate-400" style={{ fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" }}>
            {dict.contact.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-white/8 bg-white/5 p-8 backdrop-blur-sm"
        >
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <span className="text-4xl">✅</span>
              <p className="text-lg font-medium text-white">{f.success}</p>
              <p className="text-sm text-slate-400">
                {siteConfig.contactEmail}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label={f.name} name="name" type="text" required />
                <FormField label={f.company} name="company" type="text" />
              </div>
              <FormField label={f.email} name="email" type="email" required />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">
                  {f.message}
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder={f.message}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-blue-500/50 focus:bg-white/8"
                />
              </div>
              <button
                type="submit"
                className="mt-2 flex min-h-[48px] items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
              >
                {f.submit}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}

function FormField({
  label,
  name,
  type,
  required,
}: {
  label: string
  name: string
  type: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={label}
        className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-blue-500/50 focus:bg-white/8"
      />
    </div>
  )
}
