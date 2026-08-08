import type { Metadata } from "next"
import Link from "next/link"
import { SiteChrome } from "@/components/SiteChrome"

export const metadata: Metadata = {
  title: "Page not found",
}

export default function NotFound() {
  return (
    <SiteChrome>
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-2 font-mono text-sm text-slate-400 dark:text-slate-500">404</p>
        <h1 className="mb-3 text-2xl font-semibold">This page does not exist</h1>
        <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
          The link may be outdated, or the address slightly off.
        </p>
        <Link
          href="/"
          className="rounded-full border border-black/10 px-5 py-2 text-sm font-medium transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
        >
          Back to home
        </Link>
      </main>
    </SiteChrome>
  )
}
