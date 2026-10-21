"use client"

import Link from "next/link"
import { useLang } from "@/components/providers/LangProvider"
import type { Lang } from "@/lib/dictionaries/locales"

// Everything that moves in the hero is a CSS animation (see "Homepage hero" in
// globals.css), deliberately not framer-motion:
//
// - The entrance (badge → headline words → subtitle → buttons) used to be
//   framer `initial="hidden"` variants. Those server-render as opacity:0 /
//   clipped and can't play until the JS bundle has downloaded, parsed and
//   hydrated — on a throttled phone that held the LCP element (the subtitle)
//   invisible for ~3 s after first paint. CSS keyframes with `animation-delay`
//   run from the first frame regardless of hydration.
// - The ambient blobs were `repeat: Infinity` JS animations on
//   `filter: blur(120px)` layers: a JS frame loop re-rasterising three huge
//   blurred surfaces forever, measured at ~21 s of main-thread time (homepage
//   perf 32 vs 93+ on pages without it). The soft edge is now a
//   radial-gradient and the drift a transform keyframe on the compositor.
//
// Users who prefer reduced motion get the static page: globals.css only
// applies the animations under (prefers-reduced-motion: no-preference).

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #3b82f6 1px, transparent 1px),
            linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute left-1/4 top-1/4 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2">
        <div className="hero-blob hero-blob-1" style={{ background: "radial-gradient(circle closest-side, rgba(37,99,235,0.14), transparent)" }} />
      </div>
      <div className="absolute bottom-1/4 right-1/4 h-[580px] w-[580px] translate-x-1/2 translate-y-1/2">
        <div className="hero-blob hero-blob-2" style={{ background: "radial-gradient(circle closest-side, rgba(79,70,229,0.14), transparent)" }} />
      </div>
      <div className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2">
        <div className="hero-blob hero-blob-3" style={{ background: "radial-gradient(circle closest-side, rgba(8,145,178,0.12), transparent)" }} />
      </div>
    </div>
  )
}

const STAGGER = 0.12 // seconds between hero items
const WORD_STAGGER = 0.07 // seconds between headline words

function WordRevealHeading({ text, className, style, lang, delay }: {
  text: string; className?: string; style?: React.CSSProperties; lang: Lang; delay: number
}) {
  const lines = text.split("\n")
  // Arabic diacritics (tashkeel) sit above the letter and extend past the tight
  // line-height tuned for Latin display type — without headroom here, the
  // per-word overflow:hidden clip (needed for the reveal animation) cuts them off.
  const wordLineHeight = lang === "ar" ? 1.6 : undefined
  let wordIndex = 0
  return (
    <h1 className={className} style={style}>
      {lines.map((line, li) => {
        const words = line.split(" ")
        return (
          <span key={li} style={{ display: "block" }}>
            {words.map((word, wi) => {
              const d = delay + wordIndex++ * WORD_STAGGER
              return (
                <span key={wi} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", lineHeight: wordLineHeight }}>
                  <span className="hero-word" style={{ animationDelay: `${d}s` }}>
                    {word}{wi < words.length - 1 ? " " : ""}
                  </span>
                </span>
              )
            })}
          </span>
        )
      })}
    </h1>
  )
}

export function Hero() {
  const { dict, localeHref, lang } = useLang()
  const h = dict.hero
  const wordCount = h.title.split(/\s+/).length
  // Items after the headline wait for the last word to start revealing.
  const afterHeadline = STAGGER + wordCount * WORD_STAGGER

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 pt-16 dark:bg-slate-950">
      <HeroBackground />

      <div className="relative mx-auto max-w-5xl px-6 py-24 text-center sm:px-8">
        <div className="flex flex-col items-center gap-8">
          <div className="hero-item" style={{ animationDelay: "0s" }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-500 dark:text-blue-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 dark:bg-blue-400" />
              {h.badge}
            </span>
          </div>

          <WordRevealHeading
            text={h.title}
            lang={lang}
            delay={STAGGER}
            className="text-balance font-bold tracking-tight text-slate-900 dark:text-white"
            style={{ fontSize: "clamp(2.25rem, 5vw + 1rem, 4.5rem)", lineHeight: lang === "ar" ? 1.3 : 1.1 }}
          />

          <div className="hero-item" style={{ animationDelay: `${afterHeadline}s` }}>
            <p
              className="max-w-2xl text-slate-600 dark:text-slate-400"
              style={{ fontSize: "clamp(1rem, 1.5vw + 0.5rem, 1.25rem)", lineHeight: 1.7 }}
            >
              {h.subtitle}
            </p>
          </div>

          <div className="hero-item flex flex-wrap justify-center gap-4" style={{ animationDelay: `${afterHeadline + STAGGER}s` }}>
            <Link
              href={localeHref("/services")}
              className="glow-border flex min-h-[48px] items-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              {h.cta1}
            </Link>
            <Link
              href={localeHref("/contact")}
              className="flex min-h-[48px] items-center rounded-full border border-black/10 px-8 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-500/40 hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
            >
              {h.cta2}
            </Link>
          </div>

          <div className="hero-item mt-8 flex flex-col items-center gap-2 text-xs text-slate-500 dark:text-slate-400" style={{ animationDelay: `${afterHeadline + STAGGER * 2}s` }}>
            <span>{h.scrollHint}</span>
            <div className="hero-scroll-line h-4 w-px bg-gradient-to-b from-slate-400 to-transparent dark:from-slate-500" />
          </div>
        </div>
      </div>
    </section>
  )
}
