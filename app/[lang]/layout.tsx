import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Geist, Geist_Mono } from "next/font/google"
import "../globals.css"
import { siteConfig } from "@/lib/siteConfig"
import { locales, isValidLocale } from "@/lib/dictionaries"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  metadataBase: new URL("https://silicortex.de"),
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()

  return (
    <html
      lang={lang}
      // `lang` narrows to `Lang` ("en" | "de") here, which has no "ar" member yet —
      // the cast keeps this comparison alive (and the branch reachable) for
      // when Task 11 adds "ar" to `locales`, without widening `lang`'s type now.
      dir={(lang as string) === "ar" ? "rtl" : "ltr"}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full text-slate-900 dark:text-white">
        {children}
      </body>
    </html>
  )
}
