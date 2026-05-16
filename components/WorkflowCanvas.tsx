"use client"

import { motion } from "framer-motion"
import { useLang } from "@/components/providers/LangProvider"
import { AnimatedHeading } from "@/components/AnimatedHeading"
import { scaleUp, staggerContainer } from "@/lib/motion"

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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <span className="mb-3 block text-sm font-medium uppercase tracking-widest text-violet-500 dark:text-violet-400">
            {auto.subtitle}
          </span>
          <AnimatedHeading
            as="h2"
            className="mb-4 font-bold text-slate-900 dark:text-white"
            style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 3rem)" }}
          >
            {auto.title}
          </AnimatedHeading>
          <p className="max-w-2xl text-slate-600 dark:text-slate-400" style={{ fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.125rem)" }}>
            {auto.description}
          </p>
        </motion.div>

        <motion.div
          variants={scaleUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
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
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
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
