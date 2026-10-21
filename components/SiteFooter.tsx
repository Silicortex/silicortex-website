"use client"
import Link from "next/link"
import { useLang } from "@/components/providers/LangProvider"

export function SiteFooter() {
  const { dict, localeHref } = useLang()
  const linkClass =
    "text-xs text-slate-500 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-900 dark:text-slate-400 dark:decoration-slate-600 dark:hover:text-white"
  return (
    <footer className="border-t border-black/5 bg-white px-6 py-8 text-center dark:border-white/5 dark:bg-slate-950">
      <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{dict.footer.tagline}</p>
      <p className="text-xs text-slate-500 dark:text-slate-500">{dict.footer.copyright}</p>
      <nav aria-label={dict.footer.legalLabel} className="mt-4 flex justify-center gap-5">
        <Link href={localeHref("/impressum")} className={linkClass}>
          {dict.footer.impressum}
        </Link>
        <Link href={localeHref("/datenschutz")} className={linkClass}>
          {dict.footer.privacy}
        </Link>
      </nav>
    </footer>
  )
}
