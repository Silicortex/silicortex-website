import { LangProvider } from "@/components/providers/LangProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { NavbarClient } from "@/components/NavbarClient"
import { SiteFooter } from "@/components/SiteFooter"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { getDictionary, type Lang } from "@/lib/dictionaries"

// The marketing shell, shared by the (site) layout. app/[lang]/not-found.tsx
// also renders it, but that page is currently unreachable in practice:
// app/global-not-found.tsx now handles every real-world 404 at the routing
// level, with its own bare <html>/<body> that bypasses this chrome entirely
// (see the comment in app/[lang]/not-found.tsx). We keep wiring SiteChrome
// into app/[lang]/not-found.tsx anyway so it still renders correctly if
// global-not-found's routing precedence ever changes.
export function SiteChrome({
  lang,
  children,
}: {
  lang: Lang
  children: React.ReactNode
}) {
  // Resolved here, on the server, so only this language's strings are
  // serialised to the client.
  const dict = getDictionary(lang)
  return (
    <>
      <ThemeProvider>
        <LangProvider lang={lang} dict={dict}>
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
