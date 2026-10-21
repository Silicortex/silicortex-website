import Link from "next/link"
import { SiteChrome } from "@/components/SiteChrome"
import { getDictionary, defaultLocale } from "@/lib/dictionaries"

// Next.js does not pass `params` (or any props) to not-found.js — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md
// ("not-found.js ... components do not accept any props"). That file also
// calls out our exact situation — a root layout on a top-level dynamic
// segment (app/[lang]/layout.tsx) — as the case `global-not-found.js` exists
// for, because an invalid /xx/... segment makes the root layout itself call
// notFound() before it can render <html>, so there's no parent shell left to
// carry a real `lang` down to this file even if it could receive one. The
// dictionary's own invalid-locale fallback already defaults to English, so
// this 404 page does the same deliberately rather than guessing the locale.
//
// NOTE: this file is currently unreachable dead code. app/global-not-found.tsx
// now handles every real-world 404 (both an invalid /xx/... segment and any
// unmatched path under a valid one), rendering before this file ever gets a
// chance to. We keep this locale-aware version anyway as a defensive
// fallback, in case that global-not-found routing behavior changes in a
// future Next.js release and per-segment not-found.js files start being
// reached again.
export default async function NotFound() {
  const lang = defaultLocale
  const dict = getDictionary(lang)
  const n = dict.notFound
  return (
    <SiteChrome lang={lang}>
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-2 font-mono text-sm text-slate-400 dark:text-slate-500">404</p>
        <h1 className="mb-3 text-2xl font-semibold">{n.title}</h1>
        <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">{n.description}</p>
        <Link href={`/${lang}`} className="rounded-full border border-black/10 px-5 py-2 text-sm font-medium transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5">
          {n.backHome}
        </Link>
      </main>
    </SiteChrome>
  )
}
