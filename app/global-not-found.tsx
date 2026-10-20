import type { Metadata } from "next"
// global-not-found bypasses normal rendering entirely (no shared layout, no
// SiteChrome, no providers) — it has to bring its own <html>/<body> and
// import its own global styles, same as docs/01-app/03-api-reference/
// 03-file-conventions/not-found.md describes. It also never receives props,
// so there's no `lang` to read: this is the catch-all for URLs that don't
// resolve to a `[lang]` segment at all (or a path under one that matches no
// route), and it always renders in the default locale's copy.
import "./globals.css"
import { getDictionary, defaultLocale } from "@/lib/dictionaries"

export const metadata: Metadata = {
  title: "Not Found",
  description: "The page you are looking for does not exist.",
}

export default function GlobalNotFound() {
  const n = getDictionary(defaultLocale).notFound

  return (
    <html lang={defaultLocale} data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
          <p className="mb-2 font-mono text-sm text-slate-400 dark:text-slate-500">404</p>
          <h1 className="mb-3 text-2xl font-semibold">{n.title}</h1>
          <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">{n.description}</p>
          <a
            href={`/${defaultLocale}`}
            className="rounded-full border border-black/10 px-5 py-2 text-sm font-medium transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
          >
            {n.backHome}
          </a>
        </main>
      </body>
    </html>
  )
}
