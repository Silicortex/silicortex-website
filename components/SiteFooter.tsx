"use client"
import { useLang } from "@/components/providers/LangProvider"

export function SiteFooter() {
  const { dict } = useLang()
  return (
    <footer className="border-t border-black/5 bg-white px-6 py-8 text-center dark:border-white/5 dark:bg-slate-950">
      <p className="mb-1 text-xs text-slate-400 dark:text-slate-600">{dict.footer.tagline}</p>
      <p className="text-xs text-slate-300 dark:text-slate-700">{dict.footer.copyright}</p>
    </footer>
  )
}
