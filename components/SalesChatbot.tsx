"use client"

import { Fragment, useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import { useLang } from "@/components/providers/LangProvider"
import type { ArchSegment } from "@/lib/dictionaries/en"

interface Message {
  role: "user" | "assistant"
  content: string
}

const DARK = {
  bg:          "transparent",
  surface:     "rgba(255,255,255,0.02)",
  surfaceAlt:  "rgba(255,255,255,0.04)",
  border:      "rgba(255,255,255,0.07)",
  borderLo:    "rgba(255,255,255,0.06)",
  inputBg:     "rgba(255,255,255,0.04)",
  inputBorder: "rgba(255,255,255,0.09)",
  text:        "#e2e8f0",
  text2:       "#f1f5f9",
  muted:       "#94a3b8",
  dim:         "#475569",
  dim2:        "#64748b",
  arrowColor:  "#334155",
  strongColor: "#f1f5f9",
  userBubble:  "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(6,182,212,0.2))",
  userBorder:  "rgba(139,92,246,0.3)",
  aiBorder:    "rgba(255,255,255,0.07)",
}
const LIGHT = {
  bg:          "transparent",
  surface:     "rgba(0,0,0,0.03)",
  surfaceAlt:  "rgba(0,0,0,0.04)",
  border:      "rgba(0,0,0,0.09)",
  borderLo:    "rgba(0,0,0,0.07)",
  inputBg:     "#ffffff",
  inputBorder: "rgba(0,0,0,0.12)",
  text:        "#1e293b",
  text2:       "#0f172a",
  muted:       "#64748b",
  dim:         "#94a3b8",
  dim2:        "#94a3b8",
  arrowColor:  "#94a3b8",
  strongColor: "#0f172a",
  userBubble:  "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(6,182,212,0.08))",
  userBorder:  "rgba(124,58,237,0.2)",
  aiBorder:    "rgba(0,0,0,0.08)",
}

function getStaticResponse(
  input: string,
  responses: { keywords: string[]; response: string }[],
  fallback: string,
): string {
  const lower = input.toLowerCase()
  for (const item of responses) {
    if (item.keywords.some(k => lower.includes(k))) return item.response
  }
  return fallback
}

// Renders the mixed prose/code/emphasis segments that make up the
// "architecture callout" sentences (see lib/dictionaries/en.ts's ArchSegment
// type). `code` segments are wrapped in <bdi> so identifiers like
// `query_sales_by_period` — full of slashes and underscores — aren't
// visually reordered when this renders inside an RTL (Arabic) paragraph.
function renderArchSegments(segments: ArchSegment[], C: { text2: string }) {
  return segments.map((seg, i) => {
    if (seg.type === "code") {
      return (
        <bdi key={i}>
          <code style={{ color: "#a78bfa", background: "rgba(139,92,246,0.1)", padding: "1px 6px", borderRadius: 4 }}>
            {seg.value}
          </code>
        </bdi>
      )
    }
    if (seg.type === "strong") {
      return <strong key={i} style={{ color: C.text2 }}>{seg.value}</strong>
    }
    return <Fragment key={i}>{seg.value}</Fragment>
  })
}

export function SalesChatbot() {
  const { resolvedTheme } = useTheme()
  const { dict, dir } = useLang()
  const d = dict.salesDashboard
  const C = resolvedTheme === "light" ? LIGHT : DARK

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: d.chatbot.greeting },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length > 1 || loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, loading])

  const send = (text: string) => {
    if (!text.trim() || loading) return
    setMessages(prev => [...prev, { role: "user", content: text }])
    setInput("")
    setLoading(true)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: getStaticResponse(text, d.chatbot.responses, d.chatbot.fallback) }])
      setLoading(false)
    }, 700)
  }

  const renderMsg = (content: string) => ({
    __html: content.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${C.text2}">$1</strong>`),
  })

  return (
    <div style={{ padding: "40px 0 0", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: "0 0 3px", color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{d.chatLabel}</p>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg,#a78bfa,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {d.chatTitle}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
              {d.demoMode}
            </span>
            <span style={{ fontSize: 12, color: C.dim }}>{d.chatPrewritten}</span>
          </div>
        </div>

        {/* Chat window */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ height: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingRight: 4 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "assistant" && (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginInlineEnd: 10, marginTop: 2 }}>✦</div>
                )}
                <div
                  style={{
                    maxWidth: "78%",
                    background: m.role === "user" ? C.userBubble : C.surfaceAlt,
                    border: `1px solid ${m.role === "user" ? C.userBorder : C.aiBorder}`,
                    borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                    padding: "10px 14px", color: C.text, fontSize: 13, lineHeight: 1.65,
                  }}
                  dangerouslySetInnerHTML={renderMsg(m.content)}
                />
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>✦</div>
                <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: "4px 16px 16px 16px", padding: "10px 16px", display: "flex", gap: 5, alignItems: "center" }}>
                  <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
                  {[0, 0.16, 0.32].map(d => (
                    <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block", animation: `bounce 1.4s ease-in-out ${d}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.borderLo}` }}>
              {d.chatbot.suggestions.map(s => (
                <button key={s} onClick={() => send(s)} style={{
                  background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.22)",
                  borderRadius: 20, padding: "6px 14px", color: "#a78bfa", fontSize: 12, cursor: "pointer",
                }}>{s}</button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            placeholder={d.chatPlaceholder}
            style={{ flex: 1, background: C.inputBg, border: `1px solid ${C.inputBorder}`, borderRadius: 12, padding: "11px 16px", color: C.text, fontSize: 13, outline: "none" }}
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()} style={{
            background: loading || !input.trim() ? "rgba(124,58,237,0.3)" : "linear-gradient(135deg,#7c3aed,#06b6d4)",
            border: "none", borderRadius: 12, padding: "0 20px", color: "#fff",
            fontWeight: 700, fontSize: 13, cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          }}>{d.chatSend}</button>
        </div>

        {/* How it works */}
        <div style={{ marginTop: 40 }}>
          <p style={{ margin: "0 0 3px", color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{d.howItWorksLabel}</p>
          <p style={{ margin: "0 0 20px", color: C.text2, fontWeight: 700, fontSize: 16 }}>{d.howItWorksTitle}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {d.howItWorksSteps.map((s, i) => (
              <div key={s.step} style={{ background: C.surface, border: `1px solid ${C.borderLo}`, borderRadius: 14, padding: 18, position: "relative" }}>
                {i < d.howItWorksSteps.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      insetInlineEnd: -8,
                      transform: `translateY(-50%) ${dir === "rtl" ? "scaleX(-1)" : ""}`,
                      color: C.arrowColor,
                      fontSize: 16,
                      zIndex: 1,
                    }}
                  >
                    →
                  </div>
                )}
                <div style={{ fontSize: 11, fontWeight: 800, color: s.color, letterSpacing: 2, marginBottom: 10 }}>{s.step}</div>
                <p style={{ margin: "0 0 6px", color: C.text2, fontWeight: 700, fontSize: 13 }}>{s.title}</p>
                <p style={{ margin: 0, color: C.dim2, fontSize: 12, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.18)", borderRadius: 12, padding: "14px 18px", fontSize: 12, color: C.dim2, lineHeight: 1.7 }}>
            <span style={{ color: "#22d3ee", fontWeight: 700 }}>{d.archLabel} </span>
            {renderArchSegments(d.archFlow, C)}{" "}
            {renderArchSegments(d.archLoop, C)}
          </div>
        </div>
      </div>
    </div>
  )
}
