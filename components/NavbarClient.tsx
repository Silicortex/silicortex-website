"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { siteConfig } from "@/lib/siteConfig"
import { useLang } from "@/components/providers/LangProvider"

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-8 w-8" />

  const isDark = resolvedTheme === "dark"
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-slate-500 transition-colors hover:border-blue-500/40 hover:text-blue-500 dark:border-white/10 dark:text-slate-400 dark:hover:text-white"
    >
      {isDark ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}

interface SubLink { href: string; label: string; icon: string; desc: string }
interface NavLink { href: string; label: string; children?: SubLink[] }

export function NavbarClient() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileWorkOpen, setMobileWorkOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const pathname = usePathname()
  const { lang, setLang, dict } = useLang()

  const links: NavLink[] = [
    { href: "/", label: dict.nav.home },
    {
      href: "/work",
      label: dict.nav.work,
      children: [
        { href: "/work/sales-dashboard", label: "Sales Dashboard", icon: "📊", desc: "AI-powered analytics demo" },
      ],
    },
    { href: "/experience", label: dict.nav.experience },
    { href: "/network", label: dict.nav.network },
    { href: "/contact", label: dict.nav.contact },
  ]

  const toggleDropdown = () => setDropdownOpen(o => !o)
  const closeDropdown = () => setDropdownOpen(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b border-blue-500/10 transition-colors ${menuOpen ? "bg-white dark:bg-slate-950" : "bg-white/80 backdrop-blur-xl dark:bg-slate-950/80"}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center" onClick={() => setMenuOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.ico" alt="Mo-Tek Solutions" className="h-10 w-auto" />
          <span className="ml-2 text-sm font-bold tracking-tight">
            <span className="text-blue-500">Mo-Tek</span>
            <span className="text-slate-400">-Solutions</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)

            if (!link.children) {
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isActive
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            }

            // Nav item with dropdown
            return (
              <li key={link.href} className="relative flex items-center gap-0.5">
                <Link
                  href={link.href}
                  className={`text-sm transition-colors ${
                    isActive
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
                <button
                  onClick={toggleDropdown}
                  aria-label="Toggle sub-menu"
                  className={`flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-slate-100 dark:hover:bg-white/10 ${
                    isActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  <svg
                    width="12" height="12" viewBox="0 0 12 12" fill="none"
                    className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-black/8 bg-white p-2 shadow-lg dark:border-white/8 dark:bg-slate-900"
                    >
                      <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Projects
                      </p>
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
                            pathname === child.href ? "bg-violet-50 dark:bg-violet-500/10" : ""
                          }`}
                        >
                          <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-violet-100 text-sm dark:bg-violet-500/15">
                            {child.icon}
                          </span>
                          <span>
                            <span className={`block text-sm font-semibold ${pathname === child.href ? "text-violet-600 dark:text-violet-400" : "text-slate-800 dark:text-slate-200"}`}>
                              {child.label}
                            </span>
                            <span className="block text-xs text-slate-400">{child.desc}</span>
                          </span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>

        {/* Desktop right */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <button
            onClick={() => setLang(lang === "en" ? "de" : "en")}
            className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-slate-500 transition-colors hover:border-blue-500/40 hover:text-blue-500 dark:border-white/10 dark:text-slate-400 dark:hover:text-white"
            aria-label="Toggle language"
          >
            {lang === "en" ? "DE" : "EN"}
          </button>
          <Link
            href="/contact"
            className="flex min-h-[40px] items-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            {dict.nav.cta}
          </Link>
        </div>

        {/* Mobile: theme + lang + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setLang(lang === "en" ? "de" : "en")}
            className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-slate-500 dark:border-white/10 dark:text-slate-400"
            aria-label="Toggle language"
          >
            {lang === "en" ? "DE" : "EN"}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            aria-label="Toggle menu"
          >
            <span className="flex flex-col gap-1.5">
              <motion.span animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} className="block h-0.5 w-6 bg-current" />
              <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} className="block h-0.5 w-6 bg-current" />
              <motion.span animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} className="block h-0.5 w-6 bg-current" />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-40 flex flex-col bg-white px-6 pb-12 pt-8 dark:bg-slate-950 md:hidden"
          >
            <ul className="flex flex-col gap-2">
              {links.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)

                if (!link.children) {
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex min-h-[56px] items-center border-b border-black/5 text-xl font-medium transition-colors dark:border-white/5 ${
                          isActive
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                }

                // Mobile: expandable work item
                return (
                  <li key={link.href}>
                    <div
                      className={`flex min-h-[56px] cursor-pointer items-center justify-between border-b border-black/5 text-xl font-medium transition-colors dark:border-white/5 ${
                        isActive
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                      onClick={() => setMobileWorkOpen(o => !o)}
                    >
                      <Link href={link.href} onClick={() => setMenuOpen(false)} className="flex-1">
                        {link.label}
                      </Link>
                      <svg
                        width="16" height="16" viewBox="0 0 12 12" fill="none"
                        className={`transition-transform duration-200 ${mobileWorkOpen ? "rotate-180" : ""}`}
                      >
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <AnimatePresence>
                      {mobileWorkOpen && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-4"
                        >
                          {link.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 py-3 text-base font-medium transition-colors ${
                                  pathname === child.href
                                    ? "text-violet-600 dark:text-violet-400"
                                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                }`}
                              >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-sm dark:bg-violet-500/15">
                                  {child.icon}
                                </span>
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                )
              })}
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
