"use client"

import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import { MONTHLY, PRODUCTS, KPI_DATA } from "@/lib/dashboardData"

// ─── Computed values from dataset ────────────────────────────────────────────
const _q4Rev    = MONTHLY.slice(9).reduce((s, m) => s + m.revenue, 0)       // 449,200
const _q4Orders = MONTHLY.slice(9).reduce((s, m) => s + m.orders, 0)        // 6,210
const _q3Rev    = MONTHLY.slice(6, 9).reduce((s, m) => s + m.revenue, 0)    // 324,600
const _h1Rev    = MONTHLY.slice(0, 6).reduce((s, m) => s + m.revenue, 0)    // 528,600
const _h2Rev    = MONTHLY.slice(6).reduce((s, m) => s + m.revenue, 0)       // 773,800
const _total    = MONTHLY.reduce((s, m) => s + m.revenue, 0)                // 1,302,400
const _totalOrd = MONTHLY.reduce((s, m) => s + m.orders, 0)                 // 16,848
const _newCust  = MONTHLY.reduce((s, m) => s + m.newCustomers, 0)           // 2,840
const _oct      = MONTHLY[9]
const _nov      = MONTHLY[10]
const _q4pct    = Math.round((_q4Rev / _q3Rev - 1) * 100)                   // +38%
const _novPct   = Math.round((_nov.revenue / _oct.revenue - 1) * 100)       // +17%
const _novOrdPct = Math.round((_nov.orders / _oct.orders - 1) * 100)
const _novNewPct = Math.round((_nov.newCustomers / _oct.newCustomers - 1) * 100)
const $ = (n: number) => n.toLocaleString("en-US")

const _top1 = PRODUCTS[0]
const _top2 = PRODUCTS[1]
const _top3 = PRODUCTS[2]
const _top12pct = Math.round((_top1.revenue + _top2.revenue) / _total * 100)

const _churn     = KPI_DATA.find(k => k.label === "Churn Rate")?.value      // 1.6%
const _ltv       = KPI_DATA.find(k => k.label === "Customer LTV")?.value    // $620
const _repeat    = KPI_DATA.find(k => k.label === "Repeat Purchase")?.value // 71%
const _conv      = KPI_DATA.find(k => k.label === "Conversion Rate")?.value // 4.1%
const _yoy       = KPI_DATA.find(k => k.label === "YoY Growth")?.value      // +18.4%
const _weakMo    = MONTHLY.reduce((a, b) => a.newCustomers < b.newCustomers ? a : b) // Feb

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

const STATIC_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ["q4", "last 3", "last three", "october", "november", "december", "oct", "nov", "dec"],
    response: `In Q4 2025 (Oct–Dec), Mo-Tek-Solutions generated **$${$(_q4Rev)}** in revenue across **${$(_q4Orders)} orders**. October contributed $${$(_oct.revenue)}, November was the strongest month at $${$(_nov.revenue)} driven by a Black Friday spike ($52,400 in one week), and December closed at $148,600. That's a +${_q4pct}% increase compared to Q3's $${$(_q3Rev)}.`,
  },
  {
    keywords: ["product", "plan", "best", "top", "revenue", "subscription", "pro", "enterprise", "starter", "business"],
    response: `The **${_top1.name}** is Lumina's top earner at $${$(_top1.revenue)} in 2025 across ${$(_top1.units)} subscriptions. The ${_top2.name} ranks second at $${$(_top2.revenue)} from ${$(_top2.units)} customers. Together they account for ${_top12pct}% of total revenue. The ${_top3.name} contributes $${$(_top3.revenue)} from only ${_top3.units} clients — the highest revenue-per-customer at €1,200/mo.`,
  },
  {
    keywords: ["november", "october", "compare", "vs", "versus", "month"],
    response: `November significantly outperformed October: revenue grew from $${$(_oct.revenue)} to $${$(_nov.revenue)} (**+${_novPct}%**) and orders jumped from ${$(_oct.orders)} to ${$(_nov.orders)} (+${_novOrdPct}%). The main driver was Black Friday week (Nov 19–25) which alone generated $52,400 — nearly 3× a typical week. New customer acquisitions also surged: ${_nov.newCustomers} in November vs ${_oct.newCustomers} in October (+${_novNewPct}%).`,
  },
  {
    keywords: ["churn", "ltv", "lifetime", "retention", "repeat", "loyal"],
    response: `Lumina's churn rate is **${_churn}** — excellent for B2B SaaS where the industry average is 3–5%. Customer LTV stands at ${_ltv} with a ${_repeat} repeat purchase rate, indicating very strong retention. At the current ${_yoy} YoY growth rate with ${$(_newCust)} new customers in 2025, the revenue base is compounding healthily.`,
  },
  {
    keywords: ["conversion", "rate", "funnel", "lead", "signup"],
    response: `Lumina's conversion rate is **${_conv}** — up +0.4pp year-over-year. With ${$(_totalOrd)} orders from an estimated 410,000 monthly visitors, the funnel is performing above SaaS benchmarks (typically 2–5%). The Pro Plan is the most common entry point; improving the trial-to-paid flow for the Business Plan could yield the highest revenue uplift.`,
  },
  {
    keywords: ["growth", "yoy", "year", "annual", "2025", "total"],
    response: `Mo-Tek-Solutions grew **${_yoy}** year-over-year in 2025, ending at $${$(_total)} in total revenue across ${$(_totalOrd)} orders. H2 ($${$(_h2Rev)}) outperformed H1 ($${$(_h1Rev)}) by ${Math.round(_h2Rev / _h1Rev * 100 - 100)}%, driven by a strong Q4. New customer acquisition grew +22.6% to ${$(_newCust)} while churn dropped to ${_churn}, resulting in strong net revenue retention.`,
  },
  {
    keywords: ["new customer", "acquisition", "acquire", "onboard"],
    response: `Lumina acquired **${$(_newCust)} new customers** in 2025, up +22.6% vs 2024. The strongest acquisition months were November (${_nov.newCustomers} new customers) and October (${_oct.newCustomers}), coinciding with end-of-year B2B budget cycles. ${_weakMo.month} was the weakest month at ${_weakMo.newCustomers} new customers — a good target for a winter onboarding campaign.`,
  },
]

const FALLBACK = "That's a great question! In a real deployment, I'd query the live database and give you a precise answer using the data. For this demo, try one of the suggestion chips below to see example responses."

const SUGGESTIONS = [
  "What were Lumina's total sales in Q4 2025?",
  "Which plan brings the most revenue?",
  "How did November compare to October?",
  "What's the churn rate and customer LTV?",
]

const HOW_IT_WORKS = [
  { step: "01", title: "You ask a question", desc: "Type any natural language question about your sales data — no SQL needed.", color: "#a78bfa" },
  { step: "02", title: "Claude decides what to fetch", desc: "The AI reads your question and picks the right database tool (sales by period, product performance, KPIs).", color: "#22d3ee" },
  { step: "03", title: "Tool queries the database", desc: "A server-side function runs the query against your real database and returns structured JSON.", color: "#4ade80" },
  { step: "04", title: "Claude answers in plain English", desc: "The AI receives the data and writes a clear, human-readable response with numbers formatted nicely.", color: "#fbbf24" },
]

function getStaticResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const item of STATIC_RESPONSES) {
    if (item.keywords.some(k => lower.includes(k))) return item.response
  }
  return FALLBACK
}

export function SalesChatbot() {
  const { resolvedTheme } = useTheme()
  const C = resolvedTheme === "light" ? LIGHT : DARK

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm analyzing Mo-Tek-Solutions's 2025 sales data. Ask me about revenue, orders, top plans, KPIs, or monthly trends — try a suggestion below." },
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
      setMessages(prev => [...prev, { role: "assistant", content: getStaticResponse(text) }])
      setLoading(false)
    }, 700)
  }

  const renderContent = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${C.text2}">${"$1"}</strong>`)
      .replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong style="color:${C.text2}">${m}</strong>`)

  const renderMsg = (content: string) => ({
    __html: content.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${C.text2}">$1</strong>`),
  })

  return (
    <div style={{ padding: "40px 0 0", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: "0 0 3px", color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>AI Chatbot</p>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg,#a78bfa,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Ask Your Sales Data Anything
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
              ⚠ Demo Mode — no live LLM connected
            </span>
            <span style={{ fontSize: 12, color: C.dim }}>Responses are pre-written examples</span>
          </div>
        </div>

        {/* Chat window */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ height: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingRight: 4 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "assistant" && (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginRight: 10, marginTop: 2 }}>✦</div>
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
              {SUGGESTIONS.map(s => (
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
            placeholder="Ask about revenue, orders, products, KPIs…"
            style={{ flex: 1, background: C.inputBg, border: `1px solid ${C.inputBorder}`, borderRadius: 12, padding: "11px 16px", color: C.text, fontSize: 13, outline: "none" }}
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()} style={{
            background: loading || !input.trim() ? "rgba(124,58,237,0.3)" : "linear-gradient(135deg,#7c3aed,#06b6d4)",
            border: "none", borderRadius: 12, padding: "0 20px", color: "#fff",
            fontWeight: 700, fontSize: 13, cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          }}>Send</button>
        </div>

        {/* How it works */}
        <div style={{ marginTop: 40 }}>
          <p style={{ margin: "0 0 3px", color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Under the Hood</p>
          <p style={{ margin: "0 0 20px", color: C.text2, fontWeight: 700, fontSize: 16 }}>How This Chatbot Works</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} style={{ background: C.surface, border: `1px solid ${C.borderLo}`, borderRadius: 14, padding: 18, position: "relative" }}>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{ position: "absolute", top: "50%", right: -8, transform: "translateY(-50%)", color: C.arrowColor, fontSize: 16, zIndex: 1 }}>→</div>
                )}
                <div style={{ fontSize: 11, fontWeight: 800, color: s.color, letterSpacing: 2, marginBottom: 10 }}>{s.step}</div>
                <p style={{ margin: "0 0 6px", color: C.text2, fontWeight: 700, fontSize: 13 }}>{s.title}</p>
                <p style={{ margin: 0, color: C.dim2, fontSize: 12, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.18)", borderRadius: 12, padding: "14px 18px", fontSize: 12, color: C.dim2, lineHeight: 1.7 }}>
            <span style={{ color: "#22d3ee", fontWeight: 700 }}>Architecture: </span>
            Browser → <code style={{ color: "#a78bfa", background: "rgba(139,92,246,0.1)", padding: "1px 6px", borderRadius: 4 }}>/api/chat</code> (Next.js server) → Claude with 3 tools (<code style={{ color: "#a78bfa", background: "rgba(139,92,246,0.1)", padding: "1px 6px", borderRadius: 4 }}>query_sales_by_period</code>, <code style={{ color: "#a78bfa", background: "rgba(139,92,246,0.1)", padding: "1px 6px", borderRadius: 4 }}>query_product_performance</code>, <code style={{ color: "#a78bfa", background: "rgba(139,92,246,0.1)", padding: "1px 6px", borderRadius: 4 }}>query_kpis</code>) → mock DB → Claude formats answer → Browser.{" "}
            The <strong style={{ color: C.text2 }}>agentic loop</strong> means Claude can call multiple tools in one response if the question needs combined data.
          </div>
        </div>
      </div>
    </div>
  )
}
