import { LangProvider } from "@/components/providers/LangProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { NavbarClient } from "@/components/NavbarClient"
import { siteConfig } from "@/lib/siteConfig"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ThemeProvider>
        <LangProvider>
          <NavbarClient />
          {children}
          <footer className="border-t border-black/5 bg-white px-6 py-8 text-center dark:border-white/5 dark:bg-slate-950">
            <p className="mb-1 text-xs text-slate-400 dark:text-slate-600">
              {siteConfig.name} — {siteConfig.slogan}
            </p>
            <p className="text-xs text-slate-300 dark:text-slate-700">
              © 2026 {siteConfig.name}. All rights reserved.
            </p>
          </footer>
        </LangProvider>
      </ThemeProvider>
      <SpeedInsights />
      <Analytics />
    </>
  )
}
