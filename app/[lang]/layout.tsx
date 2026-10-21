import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Geist, Geist_Mono, Readex_Pro } from "next/font/google"
import "../globals.css"
import { siteConfig } from "@/lib/siteConfig"
import { locales, isValidLocale, isRtl } from "@/lib/dictionaries"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
// preload: false — the variable is declared on <html> for every locale, but
// only `:lang(ar)` text uses it (globals.css), so EN/DE pages should not
// download an Arabic font up front. Browsers fetch it when Arabic text renders.
const readexPro = Readex_Pro({ variable: "--font-readex-pro", subsets: ["arabic"], preload: false })

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.slogan,
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
      dir={isRtl(lang) ? "rtl" : "ltr"}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${readexPro.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full text-slate-900 dark:text-white">
        {children}
      </body>
    </html>
  )
}
