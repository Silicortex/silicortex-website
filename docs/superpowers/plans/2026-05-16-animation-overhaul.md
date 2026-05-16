# Animation Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all plain opacity fade+slide animations with a cohesive motion system (clip-path reveals, spring physics, 3D card tilt, glow borders, word-stagger headings, typing subtitle).

**Architecture:** A shared `lib/motion.ts` exports reusable framer-motion variants and factory functions consumed by every animated component. Two new wrapper components (`AnimatedHeading`, `TiltCard`) encapsulate repeating patterns. CSS `@keyframes` handles the rotating glow border with zero JS overhead.

**Tech Stack:** framer-motion ^12, Next.js App Router, Tailwind CSS v4, `@property` CSS Houdini for border animation.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `lib/motion.ts` | Shared variant definitions + slideIn factory |
| Create | `components/AnimatedHeading.tsx` | Word-split clip-reveal heading (whileInView) |
| Create | `components/TiltCard.tsx` | 3D perspective tilt on hover wrapper |
| Modify | `app/globals.css` | `.glow-border` class + @keyframes |
| Modify | `components/Hero.tsx` | Word-split h1, typing subtitle, dot-grid bg |
| Modify | `components/BentoGrid.tsx` | TiltCard + scaleUp + glowBorder on card[0] |
| Modify | `components/FeaturedBuilds.tsx` | TiltCard + scaleUp entrance |
| Modify | `components/AIAgentsSection.tsx` | TiltCard + scaleUp entrance |
| Modify | `components/FreelanceNetwork.tsx` | TiltCard + scaleUp + glow CTA |
| Modify | `components/Timeline.tsx` | Spring slideIn + whileHover lift |
| Modify | `components/WorkShowcase.tsx` | clipReveal sections + layoutId pill selection |
| Modify | `components/WorkflowCanvas.tsx` | scaleUp nodes + glowBorder container |
| Modify | `components/ContactForm.tsx` | clipReveal entrance + glow submit button |
| Modify | `components/NavbarClient.tsx` | layoutId active-link underline |

---

### Task 1: Create `lib/motion.ts`

**Files:**
- Create: `lib/motion.ts`

- [ ] **Step 1: Create the file**

```typescript
import type { Variants } from "framer-motion"

/** Clips content up from behind a mask — element is painted, layout stable. */
export const clipReveal: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
}

/** Card breathes into place via spring — no opacity flash. */
export const scaleUp: Variants = {
  hidden: { scale: 0.94, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 80, damping: 20 },
  },
}

/**
 * Directional spring slide. direction: "left" | "right" | "up" | "down".
 * Returns a fresh Variants object each call — safe to call at module level.
 */
export function slideIn(
  direction: "left" | "right" | "up" | "down" = "up",
  offset = 32,
): Variants {
  const axis = direction === "left" || direction === "right" ? "x" : "y"
  const value = direction === "right" || direction === "down" ? offset : -offset
  return {
    hidden: { [axis]: value, opacity: 0 },
    visible: {
      [axis]: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 60, damping: 18 },
    },
  }
}

/** Orchestrates staggered children. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

/** Parent variant for AnimatedHeading — stagger per word. */
export const wordReveal: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

/** Per-word clip reveal — used as child of wordReveal. */
export const wordItem: Variants = {
  hidden: { clipPath: "inset(110% 0 -10% 0)" },
  visible: {
    clipPath: "inset(0% 0 0% 0)",
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/rose/projects/silicortex-website && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or only pre-existing errors unrelated to motion.ts).

- [ ] **Step 3: Commit**

```bash
git add lib/motion.ts
git commit -m "feat: add shared motion variant library"
```

---

### Task 2: Create `components/AnimatedHeading.tsx`

**Files:**
- Create: `components/AnimatedHeading.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client"

import { motion } from "framer-motion"
import { wordReveal, wordItem } from "@/lib/motion"

interface Props {
  as?: "h1" | "h2" | "h3"
  children: string
  className?: string
  style?: React.CSSProperties
  /** Extra delay before stagger starts (seconds). */
  delay?: number
}

/**
 * Splits a heading string into words and reveals each with a clip-path
 * animation as the element scrolls into view. Use for all section headings
 * that are not above the fold.
 */
export function AnimatedHeading({ as: Tag = "h2", children, className, style, delay = 0 }: Props) {
  const MotionTag = motion[Tag]
  const words = children.split(" ")

  return (
    <MotionTag
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07, delayChildren: delay } },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
      style={style}
    >
      {words.map((word, i) => (
        <span
          key={i}
          style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
        >
          <motion.span variants={wordItem} style={{ display: "inline-block" }}>
            {word}
            {i < words.length - 1 ? "\u00a0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/AnimatedHeading.tsx
git commit -m "feat: add AnimatedHeading word-clip component"
```

---

### Task 3: Create `components/TiltCard.tsx`

**Files:**
- Create: `components/TiltCard.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client"

import { useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

interface Props {
  children: React.ReactNode
  className?: string
}

/**
 * Wraps children in a 3D perspective tilt that follows the cursor.
 * Springs back to flat on mouse leave.
 * Max tilt: ±8°. Perspective: 800px.
 */
export function TiltCard({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const x = useSpring(rawX, { stiffness: 150, damping: 20 })
  const y = useSpring(rawY, { stiffness: 150, damping: 20 })

  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    rawX.set((e.clientX - rect.left) / rect.width - 0.5)
    rawY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseLeave() {
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add components/TiltCard.tsx
git commit -m "feat: add TiltCard 3D perspective hover wrapper"
```

---

### Task 4: Add CSS to `app/globals.css`

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Append the glow-border styles**

Add the following at the end of `app/globals.css`:

```css
/* ─── Pulsing glow border ───────────────────────────────────────────────── */
/* Uses box-shadow so it works regardless of overflow:hidden on the element. */

@keyframes glowPulse {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(99, 102, 241, 0.25),
      0 0 15px rgba(59, 130, 246, 0.08);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(59, 130, 246, 0.55),
      0 0 28px rgba(59, 130, 246, 0.18);
  }
}

.glow-border {
  animation: glowPulse 3s ease-in-out infinite;
}
```

- [ ] **Step 2: Verify the build**

```bash
npm run build 2>&1 | tail -20
```

Expected: build completes without errors.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add rotating glow-border CSS utility"
```

---

### Task 5: Update `components/Hero.tsx`

**Files:**
- Modify: `components/Hero.tsx`

Replace the file entirely with this content:

- [ ] **Step 1: Replace Hero.tsx**

```tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"
import { wordItem } from "@/lib/motion"

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.045] dark:opacity-[0.045]"
        style={{
          backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
          backgroundSize: "28px 28px",
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

const wordContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
}

interface TypingProps {
  text: string
  className?: string
  style?: React.CSSProperties
  speed?: number
}

function TypingText({ text, className, style, speed = 22 }: TypingProps) {
  const [displayed, setDisplayed] = useState("")
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    let i = 0
    setDisplayed("")
    setCursorVisible(true)
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setTimeout(() => setCursorVisible(false), 900)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span className={className} style={style}>
      {displayed}
      {cursorVisible && (
        <span className="ml-0.5 animate-pulse font-light text-blue-400">|</span>
      )}
    </span>
  )
}

export function Hero() {
  const { dict } = useLang()
  const h = dict.hero

  const lines = h.title.split("\n")

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
          {/* Badge */}
          <motion.div variants={itemVariants} style={{ overflow: "hidden" }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-500 dark:text-blue-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 dark:bg-blue-400" />
              {h.badge}
            </span>
          </motion.div>

          {/* Headline — word-by-word clip reveal */}
          <motion.h1
            variants={wordContainerVariants}
            className="font-bold tracking-tight text-slate-900 dark:text-white"
            style={{ fontSize: "clamp(2.25rem, 5vw + 1rem, 4.5rem)", lineHeight: 1.1 }}
          >
            {lines.map((line, li) => (
              <span key={li} style={{ display: "block" }}>
                {line.split(" ").map((word, wi) => (
                  <span
                    key={wi}
                    style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
                  >
                    <motion.span variants={wordItem} style={{ display: "inline-block" }}>
                      {word}
                      {wi < line.split(" ").length - 1 ? "\u00a0" : ""}
                    </motion.span>
                  </span>
                ))}
              </span>
            ))}
          </motion.h1>

          {/* Subtitle — typing effect */}
          <motion.div variants={itemVariants} style={{ overflow: "hidden" }}>
            <TypingText
              text={h.subtitle}
              className="block max-w-2xl text-slate-600 dark:text-slate-400"
              style={{ fontSize: "clamp(1rem, 1.5vw + 0.5rem, 1.25rem)", lineHeight: 1.7 }}
            />
          </motion.div>

          {/* CTAs */}
          <motion.div variants={itemVariants} style={{ overflow: "hidden" }}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/work"
                className="flex min-h-[48px] items-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white shadow-[0_0_0_0px_rgba(59,130,246,0.2)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_0_4px_rgba(59,130,246,0.2),0_0_20px_rgba(59,130,246,0.15)]"
              >
                {h.cta1}
              </Link>
              <Link
                href="/contact"
                className="flex min-h-[48px] items-center rounded-full border border-black/10 px-8 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-500/40 hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
              >
                {h.cta2}
              </Link>
            </div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div variants={itemVariants} style={{ overflow: "hidden" }}>
            <div className="mt-8 flex flex-col items-center gap-2 text-xs text-slate-400 dark:text-slate-600">
              <span>{h.scrollHint}</span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-4 w-px bg-gradient-to-b from-slate-400 to-transparent dark:from-slate-600"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Run dev server and visually verify hero animations**

```bash
npm run dev 2>&1 &
```

Open `http://localhost:3000`. Verify:
- Dot-grid background visible (faint blue dots, not lines)
- Headline words clip up one by one
- Subtitle types out character by character with blinking cursor
- CTA primary button has glow ring on hover

- [ ] **Step 3: Commit**

```bash
git add components/Hero.tsx
git commit -m "feat: Hero word-reveal headline, typing subtitle, dot-grid background"
```

---

### Task 6: Update `components/BentoGrid.tsx`

**Files:**
- Modify: `components/BentoGrid.tsx`

- [ ] **Step 1: Replace BentoGrid.tsx**

```tsx
"use client"

import { motion } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"
import { AnimatedHeading } from "@/components/AnimatedHeading"
import { TiltCard } from "@/components/TiltCard"
import { scaleUp, clipReveal, staggerContainer } from "@/lib/motion"

const glassCard =
  "group relative overflow-hidden rounded-3xl border border-black/5 p-8 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-shadow duration-300 hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.15)] dark:border-white/10 dark:backdrop-blur-xl dark:hover:border-white/20 dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.5)]"

const spanConfigs = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-2",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
]

const accentColors = [
  "text-blue-600 dark:text-blue-400",
  "text-violet-600 dark:text-violet-400",
  "text-cyan-600 dark:text-[#5dcfd6]",
  "text-emerald-600 dark:text-emerald-400",
  "text-amber-600 dark:text-amber-400",
]

const iconBg = [
  "bg-blue-100 dark:bg-blue-500/10",
  "bg-violet-100 dark:bg-violet-500/10",
  "bg-cyan-100 dark:bg-cyan-500/10",
  "bg-emerald-100 dark:bg-emerald-500/10",
  "bg-amber-100 dark:bg-amber-500/10",
]

const cardBgs = [
  "bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900/50",
  "bg-gradient-to-br from-violet-50 to-white dark:from-violet-900/20 dark:to-slate-900/50",
  "bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-900/20 dark:to-slate-900/50",
  "bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900/50",
  "bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900/50",
]

const icons = ["🤖", "⚡", "🛠️", "🧭", "🚀"]

function BentoCard({
  title, description, tag, span, accent, iconBgClass, bgClass, icon, index,
}: {
  title: string; description: string; tag: string; span: string
  accent: string; iconBgClass: string; bgClass: string; icon: string; index: number
}) {
  return (
    <TiltCard className={`${span} h-full`}>
      <motion.div
        variants={scaleUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        style={{ transitionDelay: `${index * 0.06}s` }}
        className={`${glassCard} ${bgClass} ${index === 0 ? "glow-border" : ""} flex h-full flex-col justify-between gap-6`}
      >
        <div className="flex items-start justify-between gap-4">
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/10 ${iconBgClass}`}>
            {icon}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${accent} bg-current/10`}>
            {tag}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className={`font-bold tracking-tight text-slate-900 dark:text-white ${index === 0 ? "text-2xl" : "text-xl"}`}>
            {title}
          </h3>
          <p className={`leading-relaxed text-slate-600 dark:text-slate-400 ${index === 0 ? "text-lg" : "text-sm"}`}>
            {description}
          </p>
        </div>
      </motion.div>
    </TiltCard>
  )
}

export function BentoGrid() {
  const { dict } = useLang()
  const s = dict.services

  return (
    <section className="bg-white px-6 py-24 dark:bg-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <AnimatedHeading
            as="h2"
            className="mb-4 font-bold tracking-tight text-slate-900 dark:text-white"
            style={{ fontSize: "clamp(2rem, 4vw + 0.5rem, 3.5rem)" }}
          >
            {s.title}
          </AnimatedHeading>
          <motion.p
            variants={clipReveal}
            className="mx-auto max-w-2xl text-slate-600 dark:text-slate-400"
            style={{ fontSize: "clamp(1rem, 1.5vw + 0.5rem, 1.25rem)", overflow: "hidden" }}
          >
            {s.subtitle}
          </motion.p>
        </motion.div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-3 snap-y">
          {s.items.map((item, i) => (
            <BentoCard
              key={item.title}
              {...item}
              span={spanConfigs[i]}
              accent={accentColors[i]}
              iconBgClass={iconBg[i]}
              bgClass={cardBgs[i]}
              icon={icons[i]}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add components/BentoGrid.tsx
git commit -m "feat: BentoGrid scaleUp spring entrance, TiltCard hover, glow border on feature card"
```

---

### Task 7: Update `components/FeaturedBuilds.tsx`

**Files:**
- Modify: `components/FeaturedBuilds.tsx`

- [ ] **Step 1: Replace FeaturedBuilds.tsx**

```tsx
"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { AnimatedHeading } from "@/components/AnimatedHeading"
import { TiltCard } from "@/components/TiltCard"
import { scaleUp, clipReveal } from "@/lib/motion"

const BUILDS = [
  {
    href: "/work/sales-dashboard",
    tag: "Data & Analytics",
    title: "AI-Powered Sales Dashboard",
    description:
      "A full-featured sales analytics dashboard with KPI cards, revenue trend charts, order breakdowns, product rankings, and a live Claude AI insights panel.",
    tech: ["React", "Recharts", "Claude AI", "Next.js"],
    gradient: "from-violet-600/20 to-cyan-600/20",
    border: "border-violet-500/20 hover:border-violet-500/50",
    tagColor: "text-violet-400 bg-violet-500/10",
  },
]

export function FeaturedBuilds() {
  return (
    <section className="bg-slate-950 px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14">
          <motion.span
            variants={clipReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ overflow: "hidden", display: "block" }}
            className="mb-3 text-sm font-medium uppercase tracking-widest text-violet-400"
          >
            Featured Builds
          </motion.span>
          <AnimatedHeading
            as="h2"
            className="mb-4 font-bold text-white"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 3rem)" }}
          >
            Real Products, Live Demos
          </AnimatedHeading>
          <motion.p
            variants={clipReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ overflow: "hidden" }}
            className="max-w-2xl text-slate-400"
            style={{ fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" } as React.CSSProperties}
          >
            Interactive examples of dashboards, tools, and AI-integrated interfaces we build for clients.
          </motion.p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BUILDS.map((b, i) => (
            <TiltCard key={b.href} className="h-full">
              <motion.div
                variants={scaleUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                style={{ transitionDelay: `${i * 0.1}s`, height: "100%" }}
              >
                <Link href={b.href} className="group block h-full">
                  <div className={`h-full rounded-2xl border bg-gradient-to-br ${b.gradient} ${b.border} p-6 backdrop-blur-sm transition-all duration-200`}>
                    <span className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${b.tagColor}`}>
                      {b.tag}
                    </span>
                    <h3 className="mb-3 text-lg font-semibold text-white transition-colors group-hover:text-violet-300">
                      {b.title}
                    </h3>
                    <p className="mb-5 text-sm leading-relaxed text-slate-400">{b.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {b.tech.map(t => (
                        <span key={t} className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-400">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-violet-400 transition-all group-hover:gap-2">
                      View live demo
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add components/FeaturedBuilds.tsx
git commit -m "feat: FeaturedBuilds scaleUp spring entrance + TiltCard hover"
```

---

### Task 8: Update `components/AIAgentsSection.tsx`

**Files:**
- Modify: `components/AIAgentsSection.tsx`

- [ ] **Step 1: Replace AIAgentsSection.tsx**

```tsx
"use client"

import { motion } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"
import { AnimatedHeading } from "@/components/AnimatedHeading"
import { TiltCard } from "@/components/TiltCard"
import { scaleUp, clipReveal } from "@/lib/motion"

export function AIAgentsSection() {
  const { dict } = useLang()
  const ai = dict.work.aiAgents

  return (
    <section className="bg-slate-50 px-6 py-24 dark:bg-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14">
          <motion.span
            variants={clipReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ overflow: "hidden", display: "block" }}
            className="mb-3 text-sm font-medium uppercase tracking-widest text-blue-500 dark:text-blue-400"
          >
            {ai.subtitle}
          </motion.span>
          <AnimatedHeading
            as="h2"
            className="mb-4 font-bold text-slate-900 dark:text-white"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 3rem)" }}
          >
            {ai.title}
          </AnimatedHeading>
          <motion.p
            variants={clipReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ overflow: "hidden" }}
            className="max-w-2xl text-slate-600 dark:text-slate-400"
            style={{ fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" } as React.CSSProperties}
          >
            {ai.description}
          </motion.p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {ai.cards.map((card, i) => (
            <TiltCard key={card.title} className="h-full">
              <motion.div
                variants={scaleUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                style={{ transitionDelay: `${i * 0.1}s`, height: "100%" }}
                className="group rounded-2xl border border-black/8 bg-black/[0.03] p-6 backdrop-blur-sm transition-all hover:border-blue-500/30 hover:bg-black/5 dark:border-white/8 dark:bg-white/5 dark:hover:bg-white/8"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
                  {card.icon}
                </div>
                <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">{card.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{card.description}</p>
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add components/AIAgentsSection.tsx
git commit -m "feat: AIAgentsSection scaleUp spring entrance + TiltCard hover"
```

---

### Task 9: Update `components/FreelanceNetwork.tsx`

**Files:**
- Modify: `components/FreelanceNetwork.tsx`

- [ ] **Step 1: Replace FreelanceNetwork.tsx**

```tsx
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"
import { AnimatedHeading } from "@/components/AnimatedHeading"
import { TiltCard } from "@/components/TiltCard"
import { scaleUp, clipReveal } from "@/lib/motion"

export function FreelanceNetwork() {
  const { dict } = useLang()
  const net = dict.network

  return (
    <section className="relative overflow-hidden bg-white px-6 py-24 dark:bg-slate-950 sm:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/6 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <AnimatedHeading
            as="h2"
            className="mb-4 font-bold text-slate-900 dark:text-white"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 3rem)" }}
          >
            {net.title}
          </AnimatedHeading>
          <motion.p
            variants={clipReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ overflow: "hidden" }}
            className="mx-auto max-w-xl text-slate-600 dark:text-slate-400"
            style={{ fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" } as React.CSSProperties}
          >
            {net.subtitle}
          </motion.p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {net.perks.map((perk, i) => (
            <TiltCard key={perk.title} className="h-full">
              <motion.div
                variants={scaleUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                style={{ transitionDelay: `${i * 0.08}s`, height: "100%" }}
                className="rounded-2xl border border-black/8 bg-black/[0.02] p-6 backdrop-blur-sm transition-colors hover:border-blue-500/20 dark:border-white/8 dark:bg-white/5"
              >
                <div className="mb-4 text-3xl">{perk.icon}</div>
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{perk.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{perk.description}</p>
              </motion.div>
            </TiltCard>
          ))}
        </div>

        <motion.div
          variants={clipReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ overflow: "hidden" }}
          className="mt-16 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-8 text-center backdrop-blur-sm sm:p-12"
        >
          <p
            className="mx-auto mb-8 max-w-2xl text-slate-700 dark:text-slate-300"
            style={{ fontSize: "clamp(0.95rem, 1vw + 0.5rem, 1.125rem)" }}
          >
            {net.description}
          </p>
          <Link
            href="/contact"
            className="inline-flex min-h-[48px] items-center rounded-full bg-blue-600 px-10 text-sm font-semibold text-white shadow-[0_0_0_0px_rgba(59,130,246,0.2)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_0_4px_rgba(59,130,246,0.2),0_0_20px_rgba(59,130,246,0.15)]"
          >
            {net.cta}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add components/FreelanceNetwork.tsx
git commit -m "feat: FreelanceNetwork scaleUp + TiltCard + glow CTA button"
```

---

### Task 10: Update `components/Timeline.tsx`

**Files:**
- Modify: `components/Timeline.tsx`

- [ ] **Step 1: Replace Timeline.tsx**

```tsx
"use client"

import { motion } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"
import { AnimatedHeading } from "@/components/AnimatedHeading"
import { clipReveal, slideIn } from "@/lib/motion"

export function Timeline() {
  const { dict } = useLang()
  const exp = dict.experience

  return (
    <section className="bg-slate-50 px-6 py-24 dark:bg-slate-950 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <AnimatedHeading
            as="h2"
            className="mb-4 font-bold text-slate-900 dark:text-white"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 3rem)" }}
          >
            {exp.title}
          </AnimatedHeading>
          <motion.p
            variants={clipReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ overflow: "hidden" }}
            className="text-slate-600 dark:text-slate-400"
            style={{ fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" } as React.CSSProperties}
          >
            {exp.subtitle}
          </motion.p>
        </div>

        <div className="relative">
          <div className="absolute start-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-blue-500/20 to-transparent sm:start-1/2 sm:-translate-x-1/2" />

          <div className="flex flex-col gap-12">
            {exp.items.map((item, i) => {
              const direction = i % 2 === 0 ? "left" : "right"
              const variants = slideIn(direction, 32)
              return (
                <motion.div
                  key={item.title}
                  variants={variants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className={`relative flex gap-6 sm:gap-0 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  <div className="absolute start-6 top-6 -translate-x-1/2 sm:start-1/2">
                    <div className="h-3 w-3 rounded-full border-2 border-blue-500 bg-slate-50 shadow-[0_0_12px_rgba(59,130,246,0.6)] dark:bg-slate-950" />
                  </div>

                  <div className={`hidden w-[calc(50%-2rem)] sm:flex ${i % 2 === 0 ? "justify-end pe-10" : "justify-start ps-10"}`}>
                    <span className="mt-4 text-sm font-semibold text-blue-500 dark:text-blue-400">{item.year}</span>
                  </div>

                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`ms-12 w-full sm:ms-0 sm:w-[calc(50%-2rem)] ${i % 2 === 0 ? "sm:ps-10" : "sm:pe-10"}`}
                  >
                    <div className="rounded-2xl border border-black/8 bg-white p-6 backdrop-blur-sm transition-colors hover:border-blue-500/20 dark:border-white/8 dark:bg-white/5">
                      <span className="mb-2 block text-xs font-semibold text-blue-500 dark:text-blue-400 sm:hidden">
                        {item.year}
                      </span>
                      <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                      {"company" in item && (
                        <p className="mb-3 text-xs font-medium text-blue-500 dark:text-blue-400">{(item as { company: string }).company}</p>
                      )}
                      <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.description}</p>
                      {"link" in item && (
                        <a href={(item as { link: string }).link} target="_blank" rel="noopener noreferrer" className="mb-4 inline-block text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">
                          Verify / View Credential ↗
                        </a>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-black/8 bg-black/[0.03] px-2.5 py-0.5 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add components/Timeline.tsx
git commit -m "feat: Timeline spring slideIn entrance + whileHover lift on cards"
```

---

### Task 11: Update `components/WorkShowcase.tsx`

**Files:**
- Modify: `components/WorkShowcase.tsx`

- [ ] **Step 1: Replace WorkShowcase.tsx**

Replace the file with this content (changes: word-split h1, clipReveal sections, layoutId pill selection):

```tsx
"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useLang } from "@/components/providers/LangProvider"
import { clipReveal, wordItem } from "@/lib/motion"

interface WorkItem {
  tag: string; icon: string; title: string
  description: string; tech: string[]; href?: string; cta?: string
  featured?: boolean; accent: string; accentMuted: string
}

interface Section {
  id: string; icon: string; label: string; title: string; description: string
  accent: string; accentMuted: string; items: WorkItem[]
}

const wordContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0 } },
}

export function WorkShowcase() {
  const { dict } = useLang()
  const ws = dict.workShowcase
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const SECTIONS: Section[] = [
    {
      id: "capabilities",
      icon: "💻",
      label: ws.sections.capabilities.label,
      title: ws.sections.capabilities.title,
      description: ws.sections.capabilities.description,
      accent: "#ec4899",
      accentMuted: "rgba(236,72,153,0.1)",
      items: [
        {
          tag: ws.sections.capabilities.items[0].tag, icon: "🌐",
          title: ws.sections.capabilities.items[0].title,
          description: ws.sections.capabilities.items[0].description,
          tech: ["React", "Next.js", "Vue", "Python", "Java"],
          accent: "#ec4899", accentMuted: "rgba(236,72,153,0.12)",
        },
        {
          tag: ws.sections.capabilities.items[1].tag, icon: "🗄️",
          title: ws.sections.capabilities.items[1].title,
          description: ws.sections.capabilities.items[1].description,
          tech: ["AWS", "Dagster", "PostgreSQL", "MongoDB"],
          accent: "#8b5cf6", accentMuted: "rgba(139,92,246,0.12)",
        },
        {
          tag: ws.sections.capabilities.items[2].tag, icon: "🤖",
          title: ws.sections.capabilities.items[2].title,
          description: ws.sections.capabilities.items[2].description,
          tech: ["GenAI", "Machine Learning", "Predictive Models"],
          accent: "#10b981", accentMuted: "rgba(16,185,129,0.12)",
        },
        {
          tag: ws.sections.capabilities.items[3].tag, icon: "🔗",
          title: ws.sections.capabilities.items[3].title,
          description: ws.sections.capabilities.items[3].description,
          tech: ["REST APIs", "OAuth 2.0", "Shopify", "Meta"],
          accent: "#f59e0b", accentMuted: "rgba(245,158,11,0.12)",
        },
      ],
    },
    {
      id: "dashboards",
      icon: "📊",
      label: ws.sections.dashboards.label,
      title: ws.sections.dashboards.title,
      description: ws.sections.dashboards.description,
      accent: "#a78bfa",
      accentMuted: "rgba(167,139,250,0.1)",
      items: [
        {
          tag: ws.sections.dashboards.items[0].tag, icon: "📊",
          title: ws.sections.dashboards.items[0].title,
          description: ws.sections.dashboards.items[0].description,
          tech: ["Next.js", "Recharts", "Claude AI", "Tool Use"],
          href: "/work/sales-dashboard", cta: ws.sections.dashboards.items[0].cta, featured: true,
          accent: "#a78bfa", accentMuted: "rgba(167,139,250,0.12)",
        },
      ],
    },
    {
      id: "saas",
      icon: "🏢",
      label: ws.sections.saas.label,
      title: ws.sections.saas.title,
      description: ws.sections.saas.description,
      accent: "#14b8a6",
      accentMuted: "rgba(20,184,166,0.1)",
      items: [
        {
          tag: ws.sections.saas.items[0].tag, icon: "🏢",
          title: ws.sections.saas.items[0].title,
          description: ws.sections.saas.items[0].description,
          tech: ["Next.js", "Supabase", "PostgreSQL", "RLS"],
          featured: true,
          accent: "#14b8a6", accentMuted: "rgba(20,184,166,0.12)",
        },
      ],
    },
    {
      id: "ai-agents",
      icon: "🧠",
      label: ws.sections.aiAgents.label,
      title: ws.sections.aiAgents.title,
      description: ws.sections.aiAgents.description,
      accent: "#38bdf8",
      accentMuted: "rgba(56,189,248,0.1)",
      items: [
        {
          tag: ws.sections.aiAgents.items[0].tag, icon: "🧠",
          title: ws.sections.aiAgents.items[0].title,
          description: ws.sections.aiAgents.items[0].description,
          tech: ["LangChain", "LlamaIndex", "Pinecone", "OpenAI"],
          accent: "#38bdf8", accentMuted: "rgba(56,189,248,0.10)",
        },
        {
          tag: ws.sections.aiAgents.items[1].tag, icon: "💬",
          title: ws.sections.aiAgents.items[1].title,
          description: ws.sections.aiAgents.items[1].description,
          tech: ["Claude AI", "GPT-4", "Slack API", "WhatsApp"],
          accent: "#34d399", accentMuted: "rgba(52,211,153,0.10)",
        },
        {
          tag: ws.sections.aiAgents.items[2].tag, icon: "🔍",
          title: ws.sections.aiAgents.items[2].title,
          description: ws.sections.aiAgents.items[2].description,
          tech: ["Anthropic SDK", "Tavily", "Python", "n8n"],
          accent: "#f472b6", accentMuted: "rgba(244,114,182,0.10)",
        },
      ],
    },
    {
      id: "automation",
      icon: "⚡",
      label: ws.sections.automation.label,
      title: ws.sections.automation.title,
      description: ws.sections.automation.description,
      accent: "#fb923c",
      accentMuted: "rgba(251,146,60,0.1)",
      items: [
        {
          tag: ws.sections.automation.items[0].tag, icon: "⚡",
          title: ws.sections.automation.items[0].title,
          description: ws.sections.automation.items[0].description,
          tech: ["n8n", "REST APIs", "Webhooks", "PostgreSQL"],
          accent: "#fb923c", accentMuted: "rgba(251,146,60,0.10)",
        },
      ],
    },
  ]

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-24 dark:bg-[#020617] sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page header — above fold, use animate */}
        <motion.div
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ overflow: "hidden" }}
          className="mb-3"
        >
          <span className="block text-sm font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400">
            {ws.header}
          </span>
        </motion.div>

        <motion.h1
          variants={wordContainerVariants}
          initial="hidden"
          animate="visible"
          className="mb-4 font-extrabold text-slate-900 dark:text-white"
          style={{ fontSize: "clamp(2rem, 4vw + 0.5rem, 3.5rem)" }}
        >
          {ws.title.split(" ").map((word, wi) => (
            <span key={wi} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
              <motion.span variants={wordItem} style={{ display: "inline-block" }}>
                {word}{"\u00a0"}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ overflow: "hidden" }}
          className="mb-14 max-w-2xl text-slate-600 dark:text-slate-400"
          style={{ fontSize: "clamp(0.95rem, 1vw + 0.5rem, 1.15rem)" } as React.CSSProperties}
        >
          {ws.subtitle}
        </motion.p>

        {/* Section nav pills with layoutId selection */}
        <motion.div
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ overflow: "hidden" }}
          className="mb-16 flex flex-wrap gap-3"
        >
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => { scrollTo(s.id); setSelectedId(s.id) }}
              className="relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-transform duration-200 hover:scale-105"
              style={{ borderColor: s.accent + "44", background: s.accentMuted, color: s.accent }}
            >
              {selectedId === s.id && (
                <motion.span
                  layoutId="pill-selection"
                  className="absolute inset-0 rounded-full"
                  style={{ background: s.accent + "22", border: `1px solid ${s.accent}66` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative">{s.icon}</span>
              <span className="relative">{s.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Sections */}
        <div className="space-y-24">
          {SECTIONS.map((section, si) => (
            <motion.div
              key={section.id}
              ref={el => { sectionRefs.current[section.id] = el }}
              variants={clipReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              style={{ overflow: "hidden" }}
            >
              {/* Section header */}
              <div className="mb-8 flex items-start gap-4">
                <div
                  className="mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ background: section.accentMuted, border: `1px solid ${section.accent}33` }}
                >
                  {section.icon}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: section.accent }}>
                      {section.label}
                    </span>
                    <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${section.accent}33, transparent)` }} />
                  </div>
                  <h2 className="mb-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                    {section.title}
                  </h2>
                  <p className="max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {section.description}
                  </p>
                </div>
              </div>

              {/* Cards grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ scale: 0.94, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 80, damping: 20, delay: i * 0.08 }}
                    className={item.featured ? "sm:col-span-2" : ""}
                  >
                    <WorkCard item={item} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

function WorkCard({ item }: { item: WorkItem }) {
  const inner = (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 border-black/8 bg-white dark:border-white/8 dark:bg-white/[0.025] hover:shadow-lg dark:hover:shadow-none"
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = item.accent + "55"
        ;(e.currentTarget as HTMLElement).style.background = item.accentMuted
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = ""
        ;(e.currentTarget as HTMLElement).style.background = ""
      }}
    >
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${item.accent}, transparent)` }} />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide" style={{ background: item.accentMuted, color: item.accent }}>
            {item.tag}
          </span>
          <span className="text-2xl">{item.icon}</span>
        </div>

        <h3 className="mb-3 text-lg font-bold text-slate-900 transition-colors dark:text-white">
          {item.title}
        </h3>

        <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {item.description}
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          {item.tech.map(t => (
            <span key={t} className="rounded-md border border-black/6 bg-black/[0.03] px-2 py-1 text-xs font-medium text-slate-500 dark:border-white/6 dark:bg-white/[0.04] dark:text-slate-500">
              {t}
            </span>
          ))}
        </div>

        {item.cta && (
          <div
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg group-hover:gap-3"
            style={{ background: `linear-gradient(135deg, ${item.accent}, ${item.accent}cc)` }}
          >
            {item.cta}
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )

  if (item.href) return <Link href={item.href} className="block h-full">{inner}</Link>
  return <div className="h-full">{inner}</div>
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add components/WorkShowcase.tsx
git commit -m "feat: WorkShowcase clipReveal sections, word-split h1, layoutId pill selection"
```

---

### Task 12: Update `components/WorkflowCanvas.tsx`

**Files:**
- Modify: `components/WorkflowCanvas.tsx`

- [ ] **Step 1: Replace WorkflowCanvas.tsx**

```tsx
"use client"

import { motion } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"
import { AnimatedHeading } from "@/components/AnimatedHeading"
import { clipReveal } from "@/lib/motion"

interface Node {
  id: string; label: string; color: string; x: number; y: number
}

const NODE_W = 140
const NODE_H = 48
const CANVAS_W = 760
const CANVAS_H = 200

function buildNodes(steps: readonly { label: string; color: string }[]): Node[] {
  const spacing = CANVAS_W / steps.length
  return steps.map((s, i) => ({
    id: `node-${i}`,
    label: s.label,
    color: s.color,
    x: spacing * i + spacing / 2 - NODE_W / 2,
    y: CANVAS_H / 2 - NODE_H / 2,
  }))
}

function EdgePath({ from, to }: { from: Node; to: Node }) {
  const x1 = from.x + NODE_W
  const y1 = from.y + NODE_H / 2
  const x2 = to.x
  const y2 = to.y + NODE_H / 2
  const cx = (x1 + x2) / 2

  return (
    <g>
      <path d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`} fill="none" stroke="rgba(100,116,139,0.2)" strokeWidth={2} />
      <motion.circle
        r={4}
        fill={to.color}
        filter="url(#glow)"
        animate={{ offsetDistance: ["0%", "100%"] }}
        style={{ offsetPath: `path('M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}')` }}
        transition={{ duration: 1.8, delay: 0.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
      />
    </g>
  )
}

export function WorkflowCanvas() {
  const { dict } = useLang()
  const auto = dict.work.automation
  const nodes = buildNodes(auto.steps)

  return (
    <section className="bg-white px-6 py-24 dark:bg-[#020617] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14">
          <motion.span
            variants={clipReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ overflow: "hidden", display: "block" }}
            className="mb-3 text-sm font-medium uppercase tracking-widest text-violet-500 dark:text-violet-400"
          >
            {auto.subtitle}
          </motion.span>
          <AnimatedHeading
            as="h2"
            className="mb-4 font-bold text-slate-900 dark:text-white"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 3rem)" }}
          >
            {auto.title}
          </AnimatedHeading>
          <motion.p
            variants={clipReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ overflow: "hidden" }}
            className="max-w-2xl text-slate-600 dark:text-slate-400"
            style={{ fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" } as React.CSSProperties}
          >
            {auto.description}
          </motion.p>
        </div>

        <motion.div
          variants={clipReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ overflow: "hidden" }}
          className="glow-border overflow-x-auto rounded-2xl border border-black/8 bg-black/[0.02] p-6 backdrop-blur-sm dark:border-white/8 dark:bg-white/3"
        >
          <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} className="w-full min-w-[520px]" style={{ height: CANVAS_H }}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {nodes.slice(0, -1).map((node, i) => (
              <EdgePath key={node.id} from={node} to={nodes[i + 1]} />
            ))}

            {nodes.map((node, i) => (
              <motion.g
                key={node.id}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 80, damping: 20, delay: i * 0.1 }}
                style={{ transformOrigin: `${node.x + NODE_W / 2}px ${node.y + NODE_H / 2}px` }}
              >
                <rect x={node.x} y={node.y} width={NODE_W} height={NODE_H} rx={10} fill="rgba(255,255,255,0.04)" stroke={node.color} strokeWidth={1.5} strokeOpacity={0.5} />
                <circle cx={node.x + 16} cy={node.y + NODE_H / 2} r={5} fill={node.color} />
                <text x={node.x + 28} y={node.y + NODE_H / 2} dominantBaseline="middle" fill="currentColor" fontSize={11} fontFamily="system-ui, sans-serif" fontWeight={500}>
                  {node.label}
                </text>
              </motion.g>
            ))}
          </svg>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add components/WorkflowCanvas.tsx
git commit -m "feat: WorkflowCanvas scaleUp nodes + clipReveal + glowBorder container"
```

---

### Task 13: Update `components/ContactForm.tsx`

**Files:**
- Modify: `components/ContactForm.tsx`

- [ ] **Step 1: Replace ContactForm.tsx**

```tsx
"use client"

import { useState, type FormEvent } from "react"
import { motion } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"
import { siteConfig } from "@/lib/siteConfig"
import { clipReveal } from "@/lib/motion"

export function ContactForm() {
  const { dict } = useLang()
  const f = dict.contact.form
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const res = await fetch("https://formspree.io/f/xojyddpg", {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    })
    if (res.ok) setSubmitted(true)
  }

  return (
    <section className="bg-white px-6 pb-24 pt-0 dark:bg-slate-950 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <motion.div
          variants={clipReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ overflow: "hidden" }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 font-bold text-slate-900 dark:text-white" style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 3rem)" }}>
            {dict.contact.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400" style={{ fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" }}>
            {dict.contact.subtitle}
          </p>
        </motion.div>

        <motion.div
          variants={clipReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ overflow: "hidden" }}
          className="rounded-2xl border border-black/8 bg-black/[0.02] p-8 backdrop-blur-sm dark:border-white/8 dark:bg-white/5"
        >
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <span className="text-4xl">✅</span>
              <p className="text-lg font-medium text-slate-900 dark:text-white">{f.success}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{siteConfig.contactEmail}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label={f.name} name="name" type="text" required />
                <FormField label={f.company} name="company" type="text" />
              </div>
              <FormField label={f.email} name="email" type="email" required />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{f.message}</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder={f.message}
                  className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-600"
                />
              </div>
              <button
                type="submit"
                className="mt-2 flex min-h-[48px] items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white shadow-[0_0_0_0px_rgba(59,130,246,0.2)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_0_4px_rgba(59,130,246,0.2),0_0_20px_rgba(59,130,246,0.15)]"
              >
                {f.submit}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}

function FormField({ label, name, type, required }: { label: string; name: string; type: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={label}
        className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-600"
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add components/ContactForm.tsx
git commit -m "feat: ContactForm clipReveal entrance + glow submit button"
```

---

### Task 14: Update `components/NavbarClient.tsx`

**Files:**
- Modify: `components/NavbarClient.tsx`

- [ ] **Step 1: Add layoutId underline to active desktop nav links**

In `NavbarClient.tsx`, find the desktop nav rendering of links without children (lines 86–101) and replace the `<li>` block:

**Find:**
```tsx
            if (!link.children) {
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isActive
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            }
```

**Replace with:**
```tsx
            if (!link.children) {
              return (
                <li key={link.href} className="relative">
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isActive
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-blue-500"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              )
            }
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add components/NavbarClient.tsx
git commit -m "feat: NavbarClient layoutId sliding underline on active link"
```

---

### Task 15: Final build verification

- [ ] **Step 1: Run full production build**

```bash
npm run build 2>&1 | tail -30
```

Expected: build completes with no errors. Warnings about missing `key` props or `style` prop collisions should be fixed if present.

- [ ] **Step 2: Fix any duplicate `style` prop errors**

Tasks 7, 8, 9, 10, 12 contain `motion.p` elements with two separate `style` props (TypeScript will error). Merge them. Example pattern — apply to every occurrence across those files:

```tsx
// Before (two style props — TypeScript error):
<motion.p
  style={{ overflow: "hidden" }}
  className="..."
  style={{ fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" } as React.CSSProperties}
>

// After (single merged style prop):
<motion.p
  style={{ overflow: "hidden", fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" }}
  className="..."
>
```

- [ ] **Step 3: Re-run build after fixes**

```bash
npm run build 2>&1 | tail -20
```

Expected: ✓ Compiled successfully.

- [ ] **Step 4: Commit final fixes if any**

```bash
git add -A
git commit -m "fix: merge duplicate style props in animated section components"
```

---

## Checklist Summary

- [ ] Task 1: `lib/motion.ts` created
- [ ] Task 2: `AnimatedHeading.tsx` created
- [ ] Task 3: `TiltCard.tsx` created
- [ ] Task 4: `globals.css` glow-border CSS added
- [ ] Task 5: `Hero.tsx` — dot-grid, word reveal h1, typing subtitle, glow CTA
- [ ] Task 6: `BentoGrid.tsx` — TiltCard, scaleUp, glowBorder on card[0]
- [ ] Task 7: `FeaturedBuilds.tsx` — TiltCard, scaleUp
- [ ] Task 8: `AIAgentsSection.tsx` — TiltCard, scaleUp
- [ ] Task 9: `FreelanceNetwork.tsx` — TiltCard, scaleUp, glow CTA
- [ ] Task 10: `Timeline.tsx` — spring slideIn, whileHover lift
- [ ] Task 11: `WorkShowcase.tsx` — word-split h1, clipReveal sections, layoutId pills
- [ ] Task 12: `WorkflowCanvas.tsx` — scaleUp nodes, clipReveal, glowBorder
- [ ] Task 13: `ContactForm.tsx` — clipReveal, glow submit
- [ ] Task 14: `NavbarClient.tsx` — layoutId active underline
- [ ] Task 15: Full production build passes
