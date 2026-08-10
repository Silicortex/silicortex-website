import { LangProvider } from "@/components/providers/LangProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { NavbarClient } from "@/components/NavbarClient"
import { siteConfig } from "@/lib/siteConfig"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

// The marketing shell, shared by the (site) layout and the root not-found
// page. Unmatched URLs render app/not-found.tsx inside the ROOT layout, which
// stays deliberately bare so /admin inherits nothing — so the 404 page has to
// bring the chrome with it instead of inheriting it.
export function SiteChrome({
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
