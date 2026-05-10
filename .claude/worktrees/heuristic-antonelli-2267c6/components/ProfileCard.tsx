"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { siteConfig } from "@/lib/siteConfig"

export function ProfileCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mx-auto mb-16 max-w-2xl"
    >
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-black/8 bg-black/[0.02] p-8 backdrop-blur-sm dark:border-white/8 dark:bg-white/3 sm:flex-row sm:items-start">
        {/* Photo */}
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 sm:h-32 sm:w-32">
          <Image
            src="/mohamad.jpg"
            alt="Mohamad Katramez"
            fill
            sizes="(max-width: 640px) 112px, 128px"
            className="object-cover object-top"
            priority
          />
        </div>

        {/* Bio */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="mb-0.5 text-xl font-bold text-slate-900 dark:text-white">Mohamad Katramez</h3>
          <p className="mb-3 text-sm font-medium text-blue-500 dark:text-blue-400">Full-Stack Developer & Data Engineer</p>
          <p className="mb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Based in Wiesbaden, Germany. B.Sc. Applied Informatics from Hochschule RheinMain.
            3+ years at schubwerk GmbH building analytics tools, data warehouses, and AI integrations.
            Passionate about machine learning, automation, and shipping products that matter.
          </p>

          <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
            <a
              href={siteConfig.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-500 transition-all hover:border-blue-500/60 hover:bg-blue-500/20 dark:text-blue-400"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-xs font-semibold text-slate-500 transition-all hover:border-black/20 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              {siteConfig.contactEmail}
            </a>
            <a
              href={`tel:${siteConfig.contactPhone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-xs font-semibold text-slate-500 transition-all hover:border-black/20 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.92z"/>
              </svg>
              {siteConfig.contactPhone}
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
