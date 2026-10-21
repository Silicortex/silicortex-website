"use client"

import { createContext, useCallback, useContext, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getDictionary, type Dictionary, type Lang } from "@/lib/dictionaries"

interface LangContextValue {
  lang: Lang
  dict: Dictionary
  dir: "ltr" | "rtl"
  setLang: (next: Lang) => void
  localeHref: (path: string) => string
}

const LangContext = createContext<LangContextValue | null>(null)
const COOKIE_NAME = "silicortex-lang"

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const dict = getDictionary(lang)
  // Same ternary as app/[lang]/layout.tsx's `dir`; the cast keeps this comparison
  // alive (and the branch reachable) for when Task 11 adds "ar" to `Lang`, without
  // widening `lang`'s type now.
  const dir: "ltr" | "rtl" = (lang as string) === "ar" ? "rtl" : "ltr"

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
