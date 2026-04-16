"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { getDictionary, type Dictionary, type Lang } from "@/lib/dictionaries"

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  dict: Dictionary
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")

  useEffect(() => {
    const stored = localStorage.getItem("mo-tek-lang") as Lang | null
    if (stored === "en" || stored === "de") setLangState(stored)
  }, [])

  function setLang(next: Lang) {
    setLangState(next)
    localStorage.setItem("mo-tek-lang", next)
  }

  const dict = getDictionary(lang)

  return (
    <LangContext.Provider value={{ lang, setLang, dict }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used inside LangProvider")
  return ctx
}
