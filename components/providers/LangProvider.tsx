"use client"

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react"
import { getDictionary, type Dictionary, type Lang } from "@/lib/dictionaries"

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  dict: Dictionary
}

const LangContext = createContext<LangContextValue | null>(null)

const STORAGE_KEY = "silicortex-lang"
// `storage` events only fire in OTHER tabs, so a same-tab change needs its own
// notification or the provider would not re-render for the tab that made it.
const CHANGE_EVENT = "silicortex-lang-change"
const DEFAULT_LANG: Lang = "en"

function readLang(): Lang {
  return localStorage.getItem(STORAGE_KEY) === "de" ? "de" : DEFAULT_LANG
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(CHANGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(CHANGE_EVENT, onStoreChange)
  }
}

/**
 * The chosen language lives in localStorage, and this subscribes to it rather than
 * mirroring it into React state.
 *
 * The previous version held state and copied localStorage into it from an effect,
 * which is what react-hooks/set-state-in-effect flags: it renders once with the
 * default, then sets state during commit and renders again. Reading the value in
 * the useState initialiser instead is not an option either — the server has no
 * localStorage, so the first client render would disagree with the server's and
 * hydration would mismatch.
 *
 * useSyncExternalStore is built for exactly this: the server snapshot is the
 * default, the client snapshot is the stored value, and React switches after
 * hydrating. Treating localStorage as the single source of truth also makes a
 * language change in one tab follow into the others for free.
 */
export function LangProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readLang, () => DEFAULT_LANG)

  const setLang = useCallback((next: Lang) => {
    localStorage.setItem(STORAGE_KEY, next)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

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
