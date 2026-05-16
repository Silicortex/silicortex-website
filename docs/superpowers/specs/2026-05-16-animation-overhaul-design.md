# Animation Overhaul Design

**Date:** 2026-05-16  
**Style:** D — Micro + Techy (refined micro-interactions + engineering-forward accents)  
**Scope:** All pages — replacing existing plain fade+slide animations with a cohesive motion system

---

## Section 1: Shared Motion System

### `lib/motion.ts` — variant library

A single source of truth for all framer-motion animation variants, imported by every animated component.

**Variants:**

| Name | Description | Config |
|------|-------------|--------|
| `clipReveal` | Content slides out from behind a clip mask | `clipPath: "inset(100% 0 0 0)" → "inset(0% 0 0 0)"`, `duration: 0.6`, `ease: [0.25, 0.1, 0.25, 1]` |
| `scaleUp` | Card breathes into place | `scale: 0.94, opacity: 0 → scale: 1, opacity: 1`, spring: `stiffness: 80, damping: 20` |
| `slideIn(dir)` | Directional spring slide | `x` or `y` offset → 0, spring: `stiffness: 60, damping: 18` |
| `staggerContainer` | Orchestrates children | `staggerChildren: 0.07` |
| `wordReveal` | Per-word clip reveal | Each word wrapped in `<span style="overflow:hidden">`, child clips up with `staggerChildren: 0.07` |

### `<AnimatedHeading>` client component

- Accepts `as` prop (`h1`, `h2`, `h3`), `children`, `className`
- Splits children string into word spans internally
- Applies `wordReveal` variant so server components rendering headings stay server components

---

## Section 2: Entrance Animations (replaces all plain fades)

All `initial={{ opacity: 0, y: X }}` / `whileInView={{ opacity: 1, y: 0 }}` patterns are replaced:

| Element | Old | New |
|---------|-----|-----|
| Section headings (h2) | opacity fade + y slide | `<AnimatedHeading>` word reveal |
| BentoGrid cards | opacity fade + y:32 | `scaleUp` with spring |
| FeaturedBuilds cards | opacity fade + y:32 | `scaleUp` with spring |
| AIAgentsSection cards | opacity fade + y:32 | `scaleUp` with spring |
| FreelanceNetwork perks | opacity fade + y:32 | `scaleUp` with spring |
| Timeline entries | opacity fade + x:±32 | `slideIn` with spring physics, direction preserved |
| WorkShowcase sections | opacity fade + y:32 | `clipReveal` curtain wipe |
| Hero headline | opacity fade stagger | `wordReveal` with 0.1s/word stagger, 0.7s duration |
| ContactForm heading/form | y slide (no opacity) | `clipReveal` |
| WorkflowCanvas nodes | opacity fade + y:12 | `scaleUp` |

**LCP safety:** `clipReveal` uses `clipPath` not `opacity`, so LCP elements are considered painted by the browser from the first frame. No above-the-fold element starts with `opacity: 0`.

---

## Section 3: Hover Micro-interactions

### `<TiltCard>` wrapper component

- `"use client"` wrapper accepting `className` and `children`
- Tracks `onMouseMove` → computes cursor offset from card center
- Applies `rotateX` / `rotateY` (max ±8°) via `useMotionValue` + `useSpring`
- `perspective: 800px` on the wrapper, `transformStyle: "preserve-3d"` on the inner
- `onMouseLeave` springs both values back to 0

**Applied to:** BentoGrid cards, FeaturedBuilds cards, AIAgentsSection cards, FreelanceNetwork perk cards.

### Glow ring on primary CTAs

- `whileHover` adds `boxShadow: "0 0 0 4px rgba(59,130,246,0.2), 0 0 20px rgba(59,130,246,0.15)"`
- Applied to: Hero CTA button, Contact submit button, FreelanceNetwork CTA button

### NavbarClient — sliding indicator pill

- Replace per-link hover underline with a `motion.span` using `layoutId="nav-indicator"`
- On hover (desktop), the pill slides between nav links via shared layout animation
- Active page link keeps the pill visible permanently

### Work page section pills

- Selected section pill uses `layoutId="section-pill"` so it slides between options on click

### Timeline cards

- `whileHover={{ y: -3 }}` with spring — subtle lift on hover

---

## Section 4: Techy Accents

### Animated gradient border

- CSS `@keyframes rotateGradient` spinning `conic-gradient` (4s linear infinite)
- Implemented as a `::before` pseudo-element on a wrapper div
- Exported as a `glowBorder` CSS utility class in `globals.css`
- Applied to: featured BentoGrid cards, WorkflowCanvas container

### `<CountUp>` component

- Shelved — no prominent standalone numeric stats exist in the current content. Can be added if stat content is introduced later.

### Typing cursor on Hero subtitle

- `"use client"` effect on the subtitle line
- `useState` interval types characters one by one at 40ms/char
- Blinking `|` cursor fades out after text is complete
- Runs once on mount

### Dot-grid background on Hero

- Pure CSS: `radial-gradient` dot pattern, 5% opacity
- Added as a `::before` pseudo-element on the Hero section
- Zero JS overhead

### WorkflowCanvas

- Existing dot-along-path animation unchanged
- Node entrance updated to `scaleUp` from section 2

---

## Files to Create

| File | Purpose |
|------|---------|
| `lib/motion.ts` | Shared variant definitions |
| `components/AnimatedHeading.tsx` | Word-split heading client component |
| `components/TiltCard.tsx` | 3D perspective tilt wrapper |

## Files to Modify

| File | Changes |
|------|---------|
| `app/globals.css` | Add `glowBorder` utility + dot-grid CSS |
| `components/Hero.tsx` | Word reveal headline, typing subtitle, dot-grid bg |
| `components/BentoGrid.tsx` | TiltCard wrapper, scaleUp entrance, glowBorder on first card (col-span-2 row-span-2) |
| `components/FeaturedBuilds.tsx` | TiltCard wrapper, scaleUp entrance |
| `components/AIAgentsSection.tsx` | TiltCard wrapper, scaleUp entrance |
| `components/FreelanceNetwork.tsx` | TiltCard wrapper, scaleUp entrance, glow on CTA |
| `components/Timeline.tsx` | slideIn spring entrance, hover lift |
| `components/WorkShowcase.tsx` | clipReveal entrance, layoutId section pills |
| `components/WorkflowCanvas.tsx` | scaleUp node entrance, glowBorder on container |
| `components/ContactForm.tsx` | clipReveal entrance, glow on submit |
| `components/NavbarClient.tsx` | layoutId sliding indicator pill |

---

## Constraints

- No `opacity: 0` initial state on LCP elements (above the fold)
- All new components are `"use client"` only where interactivity is required; server components stay server
- `TiltCard` and `AnimatedHeading` are pure wrappers — they add no DOM structure that affects layout
- The `glowBorder` CSS class uses a pseudo-element so it never triggers reflow
