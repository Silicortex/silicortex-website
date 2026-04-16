import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { LangProvider } from "@/components/providers/LangProvider"
import { NavbarClient } from "@/components/NavbarClient"
import { siteConfig } from "@/lib/siteConfig"

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
  metadataBase: new URL("https://mo-tek.solutions"),
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 text-white">
        <LangProvider>
          <NavbarClient />
          {children}
          <footer className="border-t border-white/5 bg-slate-950 px-6 py-8 text-center">
            <p className="mb-1 text-xs text-slate-600">
              {siteConfig.name} — {siteConfig.slogan}
            </p>
            <p className="text-xs text-slate-700">
              © 2026 {siteConfig.name}. All rights reserved.
            </p>
          </footer>
        </LangProvider>
      </body>
    </html>
  )
}
