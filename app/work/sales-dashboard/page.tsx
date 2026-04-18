"use client"

import { useState, useContext, createContext } from "react"
import { useTheme } from "next-themes"
import { useLang } from "@/components/providers/LangProvider"
import { SalesChatbot } from "@/components/SalesChatbot"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  ScatterChart, Scatter,
} from "recharts"
import {
  COMPANY, KPI_DATA as KPI, PRODUCTS, ORDER_STATUS as DONUT_DATA,
  WEEKLY_COMPARISON as COMPARISON, RECENT_ORDERS as ORDERS,
  DAILY_7D, DAILY_30D, WEEKLY_90D, MONTHLY,
} from "@/lib/dashboardData"

// ─── Range data ───────────────────────────────────────────────────────────────
const RANGE_DATA = {
  "7D":  DAILY_7D,
  "30D": DAILY_30D,
  "90D": WEEKLY_90D,
  "1Y":  MONTHLY.map(m => ({ date: m.month, revenue: m.revenue, orders: m.orders })),
}

type StatusKey = "Completed" | "Pending" | "Processing" | "Refunded"
const STATUS_COLORS: Record<StatusKey, { bg: string; text: string }> = {
  Completed:  { bg: "rgba(74,222,128,0.15)",  text: "#4ade80" },
  Pending:    { bg: "rgba(251,191,36,0.15)",  text: "#fbbf24" },
  Processing: { bg: "rgba(129,140,248,0.15)", text: "#818cf8" },
  Refunded:   { bg: "rgba(248,113,113,0.15)", text: "#f87171" },
}

// ─── Theme color sets ─────────────────────────────────────────────────────────
const DARK = {
  bg:            "#080b18",
  surface:       "rgba(255,255,255,0.03)",
  surfaceAlt:    "rgba(255,255,255,0.04)",
  surfaceLo:     "rgba(255,255,255,0.025)",
  border:        "rgba(255,255,255,0.07)",
  borderLo:      "rgba(255,255,255,0.06)",
  borderMed:     "rgba(255,255,255,0.1)",
  text:          "#e2e8f0",
  text2:         "#f1f5f9",
  text3:         "#cbd5e1",
  muted:         "#94a3b8",
  dim:           "#475569",
  dim2:          "#64748b",
  gridStroke:    "rgba(255,255,255,0.04)",
  tooltipBg:     "rgba(15,15,35,0.97)",
  tooltipBorder: "rgba(139,92,246,0.4)",
  tooltipBorderC:"rgba(6,182,212,0.4)",
  axisColor:     "#475569",
  selectBg:      "rgba(255,255,255,0.05)",
  selectBorder:  "rgba(255,255,255,0.1)",
  selectColor:   "#94a3b8",
  optionBg:      "#0f172a",
  rowHover:      "rgba(139,92,246,0.06)",
}
const LIGHT = {
  bg:            "#f1f5f9",
  surface:       "rgba(255,255,255,0.85)",
  surfaceAlt:    "rgba(0,0,0,0.03)",
  surfaceLo:     "rgba(0,0,0,0.02)",
  border:        "rgba(0,0,0,0.09)",
  borderLo:      "rgba(0,0,0,0.07)",
  borderMed:     "rgba(0,0,0,0.12)",
  text:          "#1e293b",
  text2:         "#0f172a",
  text3:         "#334155",
  muted:         "#64748b",
  dim:           "#94a3b8",
  dim2:          "#94a3b8",
  gridStroke:    "rgba(0,0,0,0.07)",
  tooltipBg:     "rgba(255,255,255,0.98)",
  tooltipBorder: "rgba(124,58,237,0.25)",
  tooltipBorderC:"rgba(6,182,212,0.3)",
  axisColor:     "#94a3b8",
  selectBg:      "rgba(0,0,0,0.04)",
  selectBorder:  "rgba(0,0,0,0.1)",
  selectColor:   "#64748b",
  optionBg:      "#ffffff",
  rowHover:      "rgba(124,58,237,0.04)",
}
type Colors = typeof DARK
const ThemeCtx = createContext<Colors>(DARK)

// ─── Tooltips ─────────────────────────────────────────────────────────────────
function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  const C = useContext(ThemeCtx)
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: C.tooltipBg, border: `1px solid ${C.tooltipBorder}`, borderRadius: 10, padding: "10px 14px" }}>
      <p style={{ color: "#a78bfa", fontSize: 12, margin: "0 0 4px" }}>{label}</p>
      <p style={{ color: C.text2, fontWeight: 700, margin: 0 }}>${payload[0].value.toLocaleString("en-US")}</p>
    </div>
  )
}

function CompTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  const C = useContext(ThemeCtx)
  const { dict } = useLang()
  const d = dict.salesDashboard
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: C.tooltipBg, border: `1px solid ${C.tooltipBorder}`, borderRadius: 10, padding: "10px 14px", minWidth: 140 }}>
      <p style={{ color: "#a78bfa", fontSize: 12, margin: "0 0 6px" }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.name === "This" ? "#a78bfa" : C.dim2, fontWeight: 700, margin: "2px 0", fontSize: 13 }}>
          {p.name === "This" ? d.thisMonth : d.lastMonth}: ${p.value.toLocaleString("en-US")}
        </p>
      ))}
    </div>
  )
}

function ScatterTooltip({ active, payload }: { active?: boolean; payload?: { payload: { orders: number; revenue: number; date: string } }[] }) {
  const C = useContext(ThemeCtx)
  const { dict } = useLang()
  const d = dict.salesDashboard
  if (!active || !payload?.length) return null
  const { orders, revenue, date } = payload[0].payload
  return (
    <div style={{ background: C.tooltipBg, border: `1px solid ${C.tooltipBorderC}`, borderRadius: 10, padding: "10px 14px" }}>
      <p style={{ color: "#22d3ee", fontSize: 12, margin: "0 0 4px" }}>{date}</p>
      <p style={{ color: C.text, margin: "2px 0", fontSize: 13 }}>{d.ordersTooltip} <b>{orders}</b></p>
      <p style={{ color: C.text, margin: 0, fontSize: 13 }}>{d.revenueTooltip} <b>${revenue.toLocaleString("en-US")}</b></p>
    </div>
  )
}

// ─── Donut center label ───────────────────────────────────────────────────────
function DonutLabel({ cx, cy }: { cx?: number; cy?: number }) {
  const C = useContext(ThemeCtx)
  const { dict } = useLang()
  return (
    <>
      <text x={cx} y={(cy ?? 0) - 8} textAnchor="middle" fill={C.text2} fontSize={20} fontWeight={800}>16,848</text>
      <text x={cx} y={(cy ?? 0) + 14} textAnchor="middle" fill={C.dim2} fontSize={11}>{dict.salesDashboard.totalOrdersDonut}</text>
    </>
  )
}

// ─── Insights computed from the actual dataset ────────────────────────────────
const $ = (n: number) => `$${n.toLocaleString("en-US")}`
const _7D  = DAILY_7D
const _30D = DAILY_30D
const _q3  = MONTHLY.slice(6, 9).reduce((s, m) => s + m.revenue, 0)
const _q4  = MONTHLY.slice(9).reduce((s, m) => s + m.revenue, 0)
const _h1  = MONTHLY.slice(0, 6).reduce((s, m) => s + m.revenue, 0)
const _h2  = MONTHLY.slice(6).reduce((s, m) => s + m.revenue, 0)
const _h2pct = Math.round((_h2 / _h1 - 1) * 100)
const _7Dtotal = _7D.reduce((s, d) => s + d.revenue, 0)
const _7Dpeak  = _7D.reduce((a, b) => b.revenue > a.revenue ? b : a)
const _30Dpeak = _30D.reduce((a, b) => b.revenue > a.revenue ? b : a)

const STATIC_INSIGHTS: Record<string, string[]> = {
  "7D": [
    `Christmas Day (Dec 25) saw the lowest revenue at ${$(DAILY_7D[1].revenue)} — schedule proactive re-engagement for Dec 26.`,
    `${_7Dpeak.date} hit the weekly peak at ${$(_7Dpeak.revenue)} — post-holiday B2B budget renewals are driving recovery.`,
    "Orders/day are rebounding +185% from Christmas trough — momentum heading into New Year is strong.",
    `Weekly revenue of ${$(_7Dtotal)} is on track; push annual-plan upsells before Dec 31 budget deadlines.`,
  ],
  "30D": [
    `${_30Dpeak.date} was December's peak day at ${$(_30Dpeak.revenue)} — pre-Christmas urgency drives end-of-year B2B closings.`,
    "Weekends consistently drop 40–50% vs weekdays — shift ad spend and outreach to Mon–Thu windows.",
    "Pro Plan renewals dominate December orders; target Business Plan upsell before Jan 1 budget resets.",
    "Revenue recovery post-Christmas (Dec 26–28: +191%) confirms strong pipeline entering Q1 2026.",
  ],
  "90D": [
    `Black Friday week (Nov 19) spiked to ${$(WEEKLY_90D[7].revenue)} — highest weekly revenue in Q4; replicate with Q1 campaign.`,
    `October end-of-quarter surge (${$(WEEKLY_90D[3].revenue)} in week 4) shows B2B budget-flush behaviour — plan campaigns for Mar/Jun/Sep.`,
    `Christmas week dip to ${$(WEEKLY_90D[12].revenue)} is expected — front-load December outreach to weeks 1–2 to compensate.`,
    `Q4 total of ${$(_q4)} is +${Math.round((_q4/_q3-1)*100)}% vs Q3's ${$(_q3)} — strongest quarter driven by seasonality and product-market fit.`,
  ],
  "1Y": [
    `February dip (${$(MONTHLY[1].revenue)}) is the annual low — introduce a renewal incentive in January to smooth the trough.`,
    `H2 outperformed H1 by +${_h2pct}%: ${$(_h2)} vs ${$(_h1)} — accelerate sales hiring ahead of next H2.`,
    `November Black Friday surge (+${Math.round((MONTHLY[10].revenue/MONTHLY[9].revenue-1)*100)}% MoM) and September rebound (+${Math.round((MONTHLY[8].revenue/MONTHLY[7].revenue-1)*100)}%) are the two biggest growth moments.`,
    "YoY revenue growth of +18.4% with churn at 1.6% signals healthy net revenue retention — maintain product investment.",
  ],
}

const STATIC_INSIGHTS_DE: Record<string, string[]> = {
  "7D": [
    `Weihnachten (25. Dez) war mit ${$(DAILY_7D[1].revenue)} der umsatzschwächste Tag — Reaktivierungskampagne für den 26. Dez einplanen.`,
    `${_7Dpeak.date} erreichte mit ${$(_7Dpeak.revenue)} den Wochenhöchstwert — Erholung durch B2B-Budgeterneuerungen nach den Feiertagen.`,
    "Bestellungen/Tag erholen sich um +185% vom Weihnachtstief — starke Dynamik in Richtung Jahreswechsel.",
    `Wochenumsatz ${$(_7Dtotal)} liegt im Plan — Jahresperson-Upsells vor dem 31. Dez-Budgetschluss pushen.`,
  ],
  "30D": [
    `${_30Dpeak.date} war mit ${$(_30Dpeak.revenue)} der stärkste Dezembertag — Vorweihnachts-Dringlichkeit treibt B2B-Jahresabschlüsse.`,
    "Wochenenden liegen konstant 40–50% unter Werktagen — Werbeausgaben und Outreach auf Mo–Do konzentrieren.",
    "Pro-Plan-Verlängerungen dominieren Dezemberbestellungen; Business-Plan-Upsell vor Jahresbudget-Reset am 1. Jan anvisieren.",
    "Umsatzerholung nach Weihnachten (26.–28. Dez: +191%) bestätigt eine starke Pipeline für Q1 2026.",
  ],
  "90D": [
    `Black-Friday-Woche (19. Nov) erzielte mit ${$(WEEKLY_90D[7].revenue)} den höchsten Wochenumsatz in Q4 — mit Q1-Kampagne wiederholen.`,
    `Quartalsend-Surge im Oktober (${$(WEEKLY_90D[3].revenue)} in Woche 4) zeigt B2B-Budgetausschöpfungsverhalten — Kampagnen für Mär/Jun/Sep planen.`,
    `Weihnachtswochen-Einbruch auf ${$(WEEKLY_90D[12].revenue)} ist saisonbedingt — Dezember-Outreach auf Wochen 1–2 vorziehen.`,
    `Q4-Gesamtumsatz ${$(_q4)} ist +${Math.round((_q4/_q3-1)*100)}% gegenüber Q3's ${$(_q3)} — stärkstes Quartal dank Saisonalität und Produkt-Market-Fit.`,
  ],
  "1Y": [
    `Februar-Einbruch (${$(MONTHLY[1].revenue)}) ist das Jahrestief — Verlängerungsanreiz im Januar einführen, um den Einbruch abzufedern.`,
    `H2 übertraf H1 um +${_h2pct}%: ${$(_h2)} vs. ${$(_h1)} — Vertriebserweiterung vor dem nächsten H2 beschleunigen.`,
    `Black-Friday-Surge im November (+${Math.round((MONTHLY[10].revenue/MONTHLY[9].revenue-1)*100)}% MoM) und September-Rebound (+${Math.round((MONTHLY[8].revenue/MONTHLY[7].revenue-1)*100)}%) sind die zwei größten Wachstumsmomente.`,
    "YoJ-Umsatzwachstum von +18,4% bei einer Abwanderungsrate von 1,6% signalisiert gesunde Netto-Umsatzbindung — Produktinvestitionen aufrechterhalten.",
  ],
}

// ─── AI Insights ─────────────────────────────────────────────────────────────
function AIInsights({ range }: { range: string }) {
  const C = useContext(ThemeCtx)
  const { lang, dict } = useLang()
  const d = dict.salesDashboard
  const [shown, setShown] = useState(false)
  const [animating, setAnimating] = useState(false)

  const analyze = () => {
    setAnimating(true)
    setTimeout(() => { setShown(true); setAnimating(false) }, 900)
  }

  const insightSet = lang === "de" ? STATIC_INSIGHTS_DE : STATIC_INSIGHTS
  const insights = insightSet[range] ?? insightSet["1Y"]

  return (
    <div style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.22)", borderRadius: 16, padding: 22, marginBottom: 20 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:.25}50%{opacity:1}} @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <p style={{ margin: "0 0 3px", color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{d.aiInsights}</p>
          <p style={{ margin: "0 0 6px", color: C.text2, fontWeight: 700, fontSize: 16 }}>{d.analysis} · {range}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
              {d.demoMode}
            </span>
            <span style={{ fontSize: 12, color: C.dim }}>{d.prewrittenExamples}</span>
          </div>
        </div>
        <button onClick={analyze} disabled={animating} style={{
          background: animating ? "rgba(124,58,237,0.3)" : "linear-gradient(135deg,#7c3aed,#06b6d4)",
          border: "none", borderRadius: 10, padding: "8px 18px", color: "#fff",
          fontWeight: 700, fontSize: 13, cursor: animating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6,
        }}>
          {animating
            ? <>{[0, 0.3, 0.6].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block", animation: `pulse 1.4s ease-in-out ${i}s infinite` }} />)}</>
            : d.analyzeBtn}
        </button>
      </div>
      {!shown && !animating && <p style={{ color: C.dim2, fontSize: 13, margin: 0 }}>{d.clickAnalyze.replace("{range}", range)}</p>}
      {animating && <p style={{ color: C.dim2, fontSize: 13, margin: 0 }}>{d.readingData}</p>}
      {shown && !animating && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
          {insights.map((line, i) => (
            <div key={i} style={{ background: C.surfaceAlt, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.borderLo}`, animation: `fadeIn .4s ease ${i * 0.08}s both` }}>
              <span style={{ color: "#a78bfa", marginRight: 6 }}>✦</span>
              <span style={{ color: C.text3, fontSize: 13, lineHeight: 1.6 }}>{line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Dataset Overview ─────────────────────────────────────────────────────────
function DatasetOverview() {
  const C = useContext(ThemeCtx)
  const { dict } = useLang()
  const d = dict.salesDashboard
  const [open, setOpen] = useState(false)
  const card = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }
  const thS: React.CSSProperties = { textAlign: "left", color: C.dim, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, paddingBottom: 10, borderBottom: `1px solid ${C.borderLo}` }
  const tdS: React.CSSProperties = { padding: "9px 8px", borderBottom: `1px solid ${C.borderLo}`, fontSize: 13 }

  return (
    <div style={{ ...card, marginBottom: 20 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }}>
        <div>
          <p style={{ margin: "0 0 3px", color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{d.rawDataset}</p>
          <p style={{ margin: 0, color: C.text2, fontWeight: 700, fontSize: 16 }}>{d.datasetTitle}</p>
        </div>
        <span style={{ color: C.dim2, fontSize: 18, transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </button>

      {open && (
        <div style={{ marginTop: 20 }}>
          <p style={{ margin: "0 0 8px", color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{d.monthlyRevOrders}</p>
          <div style={{ overflowX: "auto", marginBottom: 24 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr>{[d.colMonth, d.colRevenue, d.colOrders, d.colNewCustomers, d.colAvgOrder].map(h => <th key={h} style={thS}>{h}</th>)}</tr></thead>
              <tbody>
                {MONTHLY.map(m => (
                  <tr key={m.month}>
                    <td style={{ ...tdS, color: "#a78bfa", fontWeight: 700 }}>{m.month} 2025</td>
                    <td style={{ ...tdS, color: C.text2, fontWeight: 700 }}>${m.revenue.toLocaleString("en-US")}</td>
                    <td style={{ ...tdS, color: C.text3 }}>{m.orders.toLocaleString("en-US")}</td>
                    <td style={{ ...tdS, color: C.text3 }}>{m.newCustomers}</td>
                    <td style={{ ...tdS, color: C.dim2 }}>${(m.revenue / m.orders).toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: `2px solid ${C.borderMed}` }}>
                  <td style={{ ...tdS, color: "#22d3ee", fontWeight: 800 }}>{d.total2025}</td>
                  <td style={{ ...tdS, color: "#22d3ee", fontWeight: 800 }}>${MONTHLY.reduce((s, m) => s + m.revenue, 0).toLocaleString("en-US")}</td>
                  <td style={{ ...tdS, color: "#22d3ee", fontWeight: 800 }}>{MONTHLY.reduce((s, m) => s + m.orders, 0).toLocaleString("en-US")}</td>
                  <td style={{ ...tdS, color: "#22d3ee", fontWeight: 800 }}>{MONTHLY.reduce((s, m) => s + m.newCustomers, 0).toLocaleString("en-US")}</td>
                  <td style={{ ...tdS, color: C.dim2 }}>—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ margin: "0 0 8px", color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{d.productRevBreakdown}</p>
          <div style={{ overflowX: "auto", marginBottom: 24 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr>{[d.colProduct, d.colAnnualRevenue, d.colUnitsSold, d.colAvgPrice, d.colRevenueShare].map(h => <th key={h} style={thS}>{h}</th>)}</tr></thead>
              <tbody>
                {PRODUCTS.map(p => (
                  <tr key={p.name}>
                    <td style={{ ...tdS, color: C.text2, fontWeight: 600 }}>{p.name}</td>
                    <td style={{ ...tdS, color: "#4ade80", fontWeight: 700 }}>${p.revenue.toLocaleString("en-US")}</td>
                    <td style={{ ...tdS, color: C.text3 }}>{p.units.toLocaleString("en-US")}</td>
                    <td style={{ ...tdS, color: C.text3 }}>${p.avgPrice}</td>
                    <td style={{ ...tdS, color: C.dim2 }}>{((p.revenue / 1302400) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ margin: "0 0 8px", color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{d.kpiSummary}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {KPI.map(k => (
              <div key={k.label} style={{ background: C.surfaceAlt, border: `1px solid ${C.borderLo}`, borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ margin: "0 0 4px", fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1 }}>{d.kpiLabels[k.label] ?? k.label}</p>
                <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 800, color: C.text2 }}>{k.value}</p>
                <span style={{ fontSize: 11, fontWeight: 700, color: k.up ? "#4ade80" : "#f87171" }}>{k.change}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Section helpers ─────────────────────────────────────────────────────────
function SectionDivider() {
  const C = useContext(ThemeCtx)
  return <div style={{ borderTop: `1px solid ${C.borderLo}`, margin: "32px 0 24px" }} />
}

function SectionHeader({ icon, label, title, accent }: {
  icon: string; label: string; title: string; accent: string
}) {
  const C = useContext(ThemeCtx)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: accent + "18",
        border: `1px solid ${accent}33`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 17, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" as const, color: accent }}>
            {label}
          </span>
          <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${accent}44, transparent)` }} />
        </div>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.text2 }}>{title}</p>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function SalesDashboard() {
  const { resolvedTheme } = useTheme()
  const { lang, dict } = useLang()
  const dark = resolvedTheme !== "light"
  const C = dark ? DARK : LIGHT
  const d = dict.salesDashboard

  const card: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }
  const sectionLabel: React.CSSProperties = { margin: "0 0 3px", color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }
  const sectionTitle: React.CSSProperties = { margin: "0 0 18px", color: C.text2, fontWeight: 700, fontSize: 16 }

  const [range, setRange] = useState("30D")
  const [filter, setFilter] = useState("All")
  const data = RANGE_DATA[range]
  const scatterData = RANGE_DATA["30D"].map(d => ({ orders: d.orders, revenue: d.revenue, date: d.date }))
  const filteredOrders = filter === "All" ? ORDERS : ORDERS.filter(o => o.status === filter)

  return (
    <ThemeCtx.Provider value={C}>
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.text, boxSizing: "border-box" }}>
        <style>{`
          @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
          .kpi{animation:fadeUp .45s ease both;}
          .kpi:hover{transform:translateY(-3px)!important;transition:transform .18s;}
          ::-webkit-scrollbar{width:5px;height:5px}
          ::-webkit-scrollbar-thumb{background:rgba(124,58,237,.35);border-radius:3px}
        `}</style>

        {/* Project Intro Hero */}
        <div style={{ borderBottom: `1px solid ${C.borderLo}`, padding: "48px 24px 40px", animation: "fadeIn .6s ease" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#a78bfa" }}>{d.heroBadge}</span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#a78bfa", opacity: 0.5 }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.dim }}>{d.heroCrumb}</span>
            </div>
            <h1 style={{ margin: "0 0 12px", fontWeight: 800, background: "linear-gradient(135deg,#a78bfa 0%,#22d3ee 60%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.15, fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
              {d.heroTitle}
            </h1>
            <p style={{ margin: "0 0 24px", color: C.muted, fontSize: "clamp(0.875rem, 1.5vw, 1rem)", lineHeight: 1.7, maxWidth: 640 }}>
              {d.heroSubtitle}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Next.js", "Recharts", "Claude AI", "Tool Use", "TypeScript", "React"].map(t => (
                <span key={t} style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: C.surfaceAlt, border: `1px solid ${C.borderMed}`, color: C.muted }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div style={{ padding: "28px 24px" }}>

          {/* Company context banner */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, padding: "14px 18px", background: C.surfaceLo, border: `1px solid ${C.border}`, borderRadius: 14, flexWrap: "wrap" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📊</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: C.text2 }}>{COMPANY.name}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: C.dim }}>{COMPANY.industry} · {COMPANY.location} · {d.analyzing} {COMPANY.period}</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: d.annualRevenue,   val: "$1,302,400", color: "#4ade80" },
                { label: d.totalOrdersStat, val: "16,848",     color: "#818cf8" },
                { label: d.yoyGrowth,       val: "+18.4%",     color: "#a78bfa" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center", padding: "6px 14px", background: C.surfaceAlt, borderRadius: 10, border: `1px solid ${C.borderLo}` }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: s.color }}>{s.val}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Header + range selector */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text2 }}>{d.salesOverview}</h2>
              <p style={{ margin: "4px 0 0", color: C.dim, fontSize: 13 }}>{d.fullYearDataset}</p>
            </div>
            <div style={{ display: "flex", gap: 4, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
              {["7D", "30D", "90D", "1Y"].map(r => (
                <button key={r} onClick={() => setRange(r)} style={{
                  background: range === r ? "linear-gradient(135deg,#7c3aed,#0891b2)" : "transparent",
                  border: "none", borderRadius: 8, padding: "6px 14px",
                  color: range === r ? "#fff" : C.dim2,
                  fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all .2s",
                }}>{r}</button>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <SectionDivider />
          <SectionHeader icon="📈" label="Key Metrics" title="KPI Overview" accent="#a78bfa" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
            {KPI.map((k, i) => (
              <div key={k.label} className="kpi" style={{ ...card, animationDelay: `${i * 0.05}s`, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <p style={{ ...sectionLabel, marginBottom: 0 }}>{d.kpiLabels[k.label] ?? k.label}</p>
                  <span style={{ fontSize: 16 }}>{k.icon}</span>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: C.text2 }}>{k.value}</p>
                <span style={{ fontSize: 11, fontWeight: 700, color: k.up ? "#4ade80" : "#f87171", background: k.up ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)", padding: "2px 8px", borderRadius: 20 }}>
                  {k.change}
                </span>
              </div>
            ))}
          </div>

          {/* Revenue Area Chart */}
          <SectionDivider />
          <SectionHeader icon="📉" label="Revenue" title="Revenue Trends" accent="#7c3aed" />
          <div style={{ ...card, marginBottom: 20 }}>
            <p style={sectionLabel}>{d.revenueTrend}</p>
            <p style={sectionTitle}>{d.revenueOverTime} · {range}</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data} margin={{ top: 0, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.gridStroke} />
                <XAxis dataKey="date" tick={{ fill: C.axisColor, fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: C.axisColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<RevenueTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#aGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Donut + Bar */}
          <SectionDivider />
          <SectionHeader icon="🔄" label="Order Analytics" title="Orders & Comparisons" accent="#22d3ee" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16, marginBottom: 20 }}>
            <div style={card}>
              <p style={sectionLabel}>{d.breakdown}</p>
              <p style={sectionTitle}>{d.orderStatusMix}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={DONUT_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" paddingAngle={3} labelLine={false} label={<DonutLabel />}>
                      {DONUT_DATA.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ background: C.tooltipBg, border: `1px solid ${C.tooltipBorder}`, borderRadius: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {DONUT_DATA.map(d => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: C.muted }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.text2, marginLeft: "auto" }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={card}>
              <p style={sectionLabel}>{d.comparison}</p>
              <p style={sectionTitle}>{d.decVsNov}</p>
              <ResponsiveContainer width="100%" height={185}>
                <BarChart data={COMPARISON} barCategoryGap="30%" margin={{ top: 0, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.gridStroke} vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: C.axisColor, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: C.axisColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CompTooltip />} />
                  <Bar dataKey="This" name="This" fill="url(#bGrad)" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="Last" name="Last" fill={dark ? "rgba(100,116,139,0.35)" : "rgba(148,163,184,0.4)"} radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                {[{ label: d.thisMonth, c: "#a78bfa" }, { label: d.lastMonth, c: C.dim }].map(l => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: l.c }} />
                    <span style={{ fontSize: 11, color: C.dim2 }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Products + Scatter */}
          <SectionDivider />
          <SectionHeader icon="📦" label="Product Performance" title="Products & Correlations" accent="#4ade80" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16, marginBottom: 20 }}>
            <div style={card}>
              <p style={sectionLabel}>{d.products}</p>
              <p style={sectionTitle}>{d.topByRevenue}</p>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={PRODUCTS} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.gridStroke} horizontal={false} />
                  <XAxis type="number" tick={{ fill: C.axisColor, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} axisLine={false} width={148} />
                  <Tooltip formatter={v => [`$${Number(v).toLocaleString("en-US")}`]} contentStyle={{ background: C.tooltipBg, border: `1px solid ${C.tooltipBorder}`, borderRadius: 10 }} labelStyle={{ display: "none" }} />
                  <Bar dataKey="revenue" fill="url(#pGrad)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={card}>
              <p style={sectionLabel}>{d.correlationLabel}</p>
              <p style={sectionTitle}>{d.ordersVsRevenue}</p>
              <ResponsiveContainer width="100%" height={190}>
                <ScatterChart margin={{ top: 0, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <radialGradient id="dotGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.5} />
                    </radialGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.gridStroke} />
                  <XAxis type="number" dataKey="orders" name={d.ordersAxisLabel} tick={{ fill: C.axisColor, fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: d.ordersAxisLabel, position: "insideBottomRight", offset: -4, fill: C.axisColor, fontSize: 11 }} />
                  <YAxis type="number" dataKey="revenue" name="Revenue" tick={{ fill: C.axisColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ScatterTooltip />} />
                  <Scatter data={scatterData} fill="url(#dotGrad)" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Table */}
          <SectionDivider />
          <SectionHeader icon="🧾" label="Transactions" title="Transaction History" accent="#fbbf24" />
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <p style={sectionLabel}>{d.orders}</p>
                <p style={{ ...sectionTitle, marginBottom: 0 }}>{d.recentTransactions}</p>
              </div>
              <select value={filter} onChange={e => setFilter(e.target.value)} style={{
                background: C.selectBg, border: `1px solid ${C.selectBorder}`,
                borderRadius: 8, color: C.selectColor, padding: "5px 10px", fontSize: 12, cursor: "pointer",
              }}>
                {([
                  { value: "All",        label: d.statusAll },
                  { value: "Completed",  label: d.statusCompleted },
                  { value: "Pending",    label: d.statusPending },
                  { value: "Processing", label: d.statusProcessing },
                  { value: "Refunded",   label: d.statusRefunded },
                ] as { value: string; label: string }[]).map(s => (
                  <option key={s.value} value={s.value} style={{ background: C.optionBg }}>{s.label}</option>
                ))}
              </select>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {[d.colOrder, d.colCustomer, d.colAmount, d.colStatus, d.colDate].map(h => (
                      <th key={h} style={{ textAlign: "left", color: C.dim, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, paddingBottom: 10, borderBottom: `1px solid ${C.borderLo}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => (
                    <tr key={o.id}
                      onMouseEnter={e => (e.currentTarget.style.background = C.rowHover)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      style={{ borderBottom: `1px solid ${C.borderLo}`, transition: "background .15s" }}>
                      <td style={{ padding: "10px 8px 10px 0", color: "#a78bfa", fontWeight: 700 }}>{o.id}</td>
                      <td style={{ padding: "10px 8px", color: C.text3 }}>{o.customer}</td>
                      <td style={{ padding: "10px 8px", color: C.text2, fontWeight: 700 }}>${o.amount.toLocaleString("en-US")}</td>
                      <td style={{ padding: "10px 8px" }}>
                        <span style={{ background: STATUS_COLORS[o.status as StatusKey].bg, color: STATUS_COLORS[o.status as StatusKey].text, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{o.status}</span>
                      </td>
                      <td style={{ padding: "10px 0 10px 8px", color: C.dim2 }}>{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dataset Overview */}
          <SectionDivider />
          <SectionHeader icon="🗂️" label="Raw Data" title="Full Dataset" accent="#94a3b8" />
          <DatasetOverview />

          {/* AI Insights */}
          <SectionDivider />
          <SectionHeader icon="✦" label="AI" title="AI-Powered Insights" accent="#a78bfa" />
          <AIInsights range={range} />

          {/* Sales Chatbot */}
          <SectionDivider />
          <SectionHeader icon="💬" label="AI Chatbot" title="Ask Your Sales Data" accent="#38bdf8" />
          <SalesChatbot />
        </div>
      </div>
    </ThemeCtx.Provider>
  )
}
