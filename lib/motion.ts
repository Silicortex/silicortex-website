import type { Variants } from "framer-motion"

export const clipReveal: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export const scaleUp: Variants = {
  hidden: { scale: 0.94, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 80, damping: 20 },
  },
}

export function slideIn(
  direction: "left" | "right" | "up" | "down" = "up",
  offset = 32,
): Variants {
  const isX = direction === "left" || direction === "right"
  const value = direction === "right" || direction === "down" ? offset : -offset
  const springTransition = { type: "spring" as const, stiffness: 60, damping: 18 }
  return {
    hidden: isX ? { x: value, opacity: 0 } : { y: value, opacity: 0 },
    visible: isX
      ? { x: 0, opacity: 1, transition: springTransition }
      : { y: 0, opacity: 1, transition: springTransition },
  }
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

export const wordReveal: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

export const wordItem: Variants = {
  hidden: { clipPath: "inset(110% 0 -10% 0)" },
  visible: {
    clipPath: "inset(0% 0 0% 0)",
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}
