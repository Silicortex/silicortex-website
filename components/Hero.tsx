"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, type Variants } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"
import { wordItem } from "@/lib/motion"

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
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -30, 40, 0], y: [0, 40, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-600/10 blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, 20, -40, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-600/8 blur-[80px]"
      />
    </div>
  )
}

function WordRevealHeading({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const lines = text.split("\n")
  return (
    <h1 className={className} style={style}>
      {lines.map((line, li) => {
        const words = line.split(" ")
        return (
          <span key={li} style={{ display: "block" }}>
            {words.map((word, wi) => (
              <span key={wi} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
                <motion.span
                  variants={wordItem}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: (li * words.length + wi) * 0.07 }}
                  style={{ display: "inline-block" }}
                >
                  {word}{wi < words.length - 1 ? "\u00a0" : ""}
                </motion.span>
              </span>
            ))}
          </span>
        )
      })}
    </h1>
  )
}

function TypingSubtitle({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const delay = 800 // start after heading reveals
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, 22)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timer)
  }, [text])

  return (
    <p
      className="max-w-2xl text-slate-600 dark:text-slate-400"
      style={{ fontSize: "clamp(1rem, 1.5vw + 0.5rem, 1.25rem)", lineHeight: 1.7 }}
    >
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="ml-0.5 inline-block h-[1.1em] w-0.5 translate-y-[0.1em] bg-blue-500"
        />
      )}
    </p>
  )
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
}

export function Hero() {
  const { dict } = useLang()
  const h = dict.hero

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 pt-16 dark:bg-slate-950">
      <HeroBackground />

      <div className="relative mx-auto max-w-5xl px-6 py-24 text-center sm:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-8"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-500 dark:text-blue-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 dark:bg-blue-400" />
              {h.badge}
            </span>
          </motion.div>

          <WordRevealHeading
            text={h.title}
            className="text-balance font-bold tracking-tight text-slate-900 dark:text-white"
            style={{ fontSize: "clamp(2.25rem, 5vw + 1rem, 4.5rem)", lineHeight: 1.1 }}
          />

          <motion.div variants={itemVariants}>
            <TypingSubtitle text={h.subtitle} />
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
            <Link
              href="/work"
              className="glow-border flex min-h-[48px] items-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              {h.cta1}
            </Link>
            <Link
              href="/contact"
              className="flex min-h-[48px] items-center rounded-full border border-black/10 px-8 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-500/40 hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
            >
              {h.cta2}
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-2 text-xs text-slate-400 dark:text-slate-600">
            <span>{h.scrollHint}</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-4 w-px bg-gradient-to-b from-slate-400 to-transparent dark:from-slate-600"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
