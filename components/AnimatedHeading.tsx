"use client"

import { motion } from "framer-motion"
import { wordReveal, wordItem } from "@/lib/motion"

interface Props {
  as?: "h1" | "h2" | "h3"
  children: string
  className?: string
  style?: React.CSSProperties
  delay?: number
}

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
            {word}{i < words.length - 1 ? "\u00a0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  )
}
