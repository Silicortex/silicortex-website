import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google"
import "../globals.css"
import { siteConfig } from "@/lib/siteConfig"
import { locales, isValidLocale, isRtl } from "@/lib/dictionaries"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
const notoSansArabic = Noto_Sans_Arabic({ variable: "--font-noto-arabic", subsets: ["arabic"] })

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
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full text-slate-900 dark:text-white">
        {children}
      </body>
    </html>
  )
}
