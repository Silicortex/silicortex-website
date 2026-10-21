"use client"

import { createContext, useCallback, useContext, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isRtl, type Lang } from "@/lib/dictionaries/locales"
import type { Dictionary } from "@/lib/dictionaries/en"

interface LangContextValue {
  lang: Lang
  dict: Dictionary
  dir: "ltr" | "rtl"
  setLang: (next: Lang) => void
  localeHref: (path: string) => string
}

const LangContext = createContext<LangContextValue | null>(null)
const COOKIE_NAME = "silicortex-lang"

// `dict` arrives from the server (SiteChrome) so the client bundle carries only
// the one language the page renders, not all three.
export function LangProvider({ lang, dict, children }: { lang: Lang; dict: Dictionary; children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const dir: "ltr" | "rtl" = isRtl(lang) ? "rtl" : "ltr"

  const localeHref = useCallback(
    (path: string) => `/${lang}${path === "/" ? "" : path}`,
    [lang],
  )

  const setLang = useCallback(
    (next: Lang) => {
      document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=31536000`
      const segments = pathname.split("/")
      segments[1] = next // segments[0] is "" before the leading slash, segments[1] is the current lang
      router.push(segments.join("/") || `/${next}`)
    },
    [pathname, router],
  )

  return (
    <LangContext.Provider value={{ lang, dict, dir, setLang, localeHref }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used inside LangProvider")
  return ctx
}
