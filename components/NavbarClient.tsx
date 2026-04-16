"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { siteConfig } from "@/lib/siteConfig"
import { useLang } from "@/components/providers/LangProvider"

export function NavbarClient() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { lang, setLang, dict } = useLang()

  const links = [
    { href: "/", label: dict.nav.home },
    { href: "/work", label: dict.nav.work },
    { href: "/experience", label: dict.nav.experience },
    { href: "/network", label: dict.nav.network },
    { href: "/contact", label: dict.nav.contact },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-blue-500/10 bg-slate-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-white"
          onClick={() => setMenuOpen(false)}
        >
          <span className="text-blue-500">{siteConfig.logoText.split("-")[0]}-</span>
          <span>Tek</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname === link.href
                    ? "text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Lang toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "de" : "en")}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-400 transition-colors hover:border-blue-500/40 hover:text-white"
            aria-label="Toggle language"
          >
            {lang === "en" ? "DE" : "EN"}
          </button>
          <Link
            href="/contact"
            className="min-h-[48px] rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 flex items-center"
          >
            {dict.nav.cta}
          </Link>
        </div>

        {/* Mobile: lang + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setLang(lang === "en" ? "de" : "en")}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-400"
            aria-label="Toggle language"
          >
            {lang === "en" ? "DE" : "EN"}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg text-slate-400 hover:text-white"
            aria-label="Toggle menu"
          >
            <span className="flex flex-col gap-1.5">
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="block h-0.5 w-6 bg-current"
              />
              <motion.span
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block h-0.5 w-6 bg-current"
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="block h-0.5 w-6 bg-current"
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-40 flex flex-col bg-slate-950/95 backdrop-blur-2xl px-6 pt-8 pb-12 md:hidden"
          >
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex min-h-[56px] items-center border-b border-white/5 text-xl font-medium transition-colors ${
                      pathname === link.href
                        ? "text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="mt-8 flex min-h-[56px] items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white hover:bg-blue-500"
            >
              {dict.nav.cta}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
