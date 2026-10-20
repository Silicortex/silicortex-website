import { SiteChrome } from "@/components/SiteChrome"
import type { Lang } from "@/lib/dictionaries"

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  // Next's generated route types require dynamic segments to be typed as
  // `string` here (see app/[lang]/layout.tsx) — the root layout already
  // 404s on an invalid locale before this layout ever renders, so the cast
  // below is safe.
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  return <SiteChrome lang={lang as Lang}>{children}</SiteChrome>
}
