import { LangProvider } from "@/components/providers/LangProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { NavbarClient } from "@/components/NavbarClient"
import { SiteFooter } from "@/components/SiteFooter"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import type { Lang } from "@/lib/dictionaries"

// The marketing shell, shared by the (site) layout and the root not-found
// page. Unmatched URLs render app/[lang]/not-found.tsx inside the ROOT
// layout, which stays deliberately bare (just <html>/<body>) — so the 404
// page has to bring the chrome with it instead of inheriting it.
export function SiteChrome({
  lang,
  children,
}: {
  lang: Lang
  children: React.ReactNode
}) {
  return (
    <>
      <ThemeProvider>
        <LangProvider lang={lang}>
          <NavbarClient />
          {children}
          <SiteFooter />
        </LangProvider>
      </ThemeProvider>
      <SpeedInsights />
      <Analytics />
    </>
  )
}
