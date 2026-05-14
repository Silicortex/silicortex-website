import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { LangProvider } from "@/components/providers/LangProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { NavbarClient } from "@/components/NavbarClient"
import { siteConfig } from "@/lib/siteConfig"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.slogan,
  metadataBase: new URL("https://silicortex.com"),
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full text-slate-900 dark:text-white">
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
      </body>
    </html>
  )
}
