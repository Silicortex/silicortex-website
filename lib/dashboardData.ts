// Silicortex — fictional B2B SaaS company used as demo dataset

export const COMPANY = {
  name: "Silicortex",
  industry: "B2B SaaS · Analytics Platform",
  location: "Berlin, Germany",
  period: "Jan – Dec 2025",
  description:
    "Lumina Analytics sells subscription-based data analytics tools to mid-size European companies. Five pricing tiers from €49/mo Starter to €1,200/mo Enterprise.",
}

// ─── Monthly data (full year 2025) ───────────────────────────────────────────
export const MONTHLY = [
  { month: "Jan", revenue: 78400,  orders: 1086, newCustomers: 186 },
  { month: "Feb", revenue: 68200,  orders:  940, newCustomers: 142 },
  { month: "Mar", revenue: 88600,  orders: 1236, newCustomers: 204 },
  { month: "Apr", revenue: 94200,  orders: 1312, newCustomers: 218 },
  { month: "May", revenue: 102800, orders: 1428, newCustomers: 242 },
  { month: "Jun", revenue: 96400,  orders: 1340, newCustomers: 224 },
  { month: "Jul", revenue: 91200,  orders: 1268, newCustomers: 198 },
  { month: "Aug", revenue: 108600, orders: 1502, newCustomers: 256 },
  { month: "Sep", revenue: 124800, orders: 1726, newCustomers: 298 },
  { month: "Oct", revenue: 138200, orders: 1912, newCustomers: 324 },
  { month: "Nov", revenue: 162400, orders: 2242, newCustomers: 386 },
  { month: "Dec", revenue: 148600, orders: 2056, newCustomers: 362 },
]

// ─── Weekly data (last 90 days: Oct – Dec 2025) ───────────────────────────────
export const WEEKLY_90D = [
  { date: "Oct 1",  revenue: 28400, orders: 392 },
  { date: "Oct 8",  revenue: 31200, orders: 432 },
  { date: "Oct 15", revenue: 34600, orders: 478 },
  { date: "Oct 22", revenue: 43200, orders: 610 },
  { date: "Oct 29", revenue: 35800, orders: 496 },
  { date: "Nov 5",  revenue: 38400, orders: 532 },
  { date: "Nov 12", revenue: 40200, orders: 558 },
  { date: "Nov 19", revenue: 52400, orders: 724 }, // Black Friday week
  { date: "Nov 26", revenue: 36200, orders: 502 },
  { date: "Dec 3",  revenue: 33800, orders: 468 },
  { date: "Dec 10", revenue: 41920, orders: 580 },
  { date: "Dec 17", revenue: 36480, orders: 505 },
  { date: "Dec 24", revenue: 28040, orders: 388 }, // Christmas week
]

// ─── Daily data (December 2025) ───────────────────────────────────────────────
export const DAILY_30D = [
  { date: "Dec 1",  revenue: 4820, orders: 67 },
  { date: "Dec 2",  revenue: 5140, orders: 72 },
  { date: "Dec 3",  revenue: 5680, orders: 78 },
  { date: "Dec 4",  revenue: 4960, orders: 69 },
  { date: "Dec 5",  revenue: 6240, orders: 86 },
  { date: "Dec 6",  revenue: 3840, orders: 54 },
  { date: "Dec 7",  revenue: 3120, orders: 43 },
  { date: "Dec 8",  revenue: 5480, orders: 76 },
  { date: "Dec 9",  revenue: 5960, orders: 82 },
  { date: "Dec 10", revenue: 6400, orders: 88 },
  { date: "Dec 11", revenue: 6180, orders: 86 },
  { date: "Dec 12", revenue: 7240, orders: 100 },
  { date: "Dec 13", revenue: 4280, orders: 59 },
  { date: "Dec 14", revenue: 3480, orders: 48 },
  { date: "Dec 15", revenue: 6820, orders: 94 },
  { date: "Dec 16", revenue: 7480, orders: 104 },
  { date: "Dec 17", revenue: 7200, orders: 100 },
  { date: "Dec 18", revenue: 6840, orders: 95 },
  { date: "Dec 19", revenue: 8120, orders: 113 },
  { date: "Dec 20", revenue: 5240, orders: 73 },
  { date: "Dec 21", revenue: 4480, orders: 62 },
  { date: "Dec 22", revenue: 5840, orders: 82 },
  { date: "Dec 23", revenue: 4920, orders: 68 },
  { date: "Dec 24", revenue: 3680, orders: 51 }, // Christmas Eve
  { date: "Dec 25", revenue: 2140, orders: 30 }, // Christmas Day
  { date: "Dec 26", revenue: 6280, orders: 87 },
  { date: "Dec 27", revenue: 7420, orders: 103 },
  { date: "Dec 28", revenue: 8320, orders: 116 },
  { date: "Dec 29", revenue: 7640, orders: 106 },
  { date: "Dec 30", revenue: 7200, orders: 100 },
]

export const DAILY_7D = DAILY_30D.slice(-7) // Dec 24–30

// ─── Products (annual revenue 2025) ───────────────────────────────────────────
// Total: $1,302,400
export const PRODUCTS = [
  { name: "Pro Plan (€149/mo)",       revenue: 486200, units: 3263, avgPrice: 149 },
  { name: "Business Plan (€399/mo)",  revenue: 412800, units: 1034, avgPrice: 399 },
  { name: "Enterprise (€1,200/mo)",   revenue: 228400, units:  190, avgPrice: 1200 },
  { name: "Starter Plan (€49/mo)",    revenue: 124600, units: 2543, avgPrice: 49 },
  { name: "Data Connectors (€299)",   revenue:  50400, units:  168, avgPrice: 299 },
]

// ─── Order status breakdown ───────────────────────────────────────────────────
export const ORDER_STATUS = [
  { name: "Completed",  value: 74, color: "#4ade80" },
  { name: "Processing", value: 12, color: "#818cf8" },
  { name: "Pending",    value: 10, color: "#fbbf24" },
  { name: "Refunded",   value:  4, color: "#f87171" },
]

// ─── Weekly comparison: Dec vs Nov (last 4 weeks) ────────────────────────────
export const WEEKLY_COMPARISON = [
  { week: "Week 1", This: 38400, Last: 40100 },
  { week: "Week 2", This: 39200, Last: 42600 },
  { week: "Week 3", This: 35400, Last: 38200 },
  { week: "Week 4", This: 35600, Last: 41500 },
]

// ─── Recent orders (Dec 2025, B2B customers) ──────────────────────────────────
export const RECENT_ORDERS = [
  { id: "#ORD-9481", customer: "TechVision GmbH",  amount: 1200, status: "Completed",  date: "Dec 28" },
  { id: "#ORD-9480", customer: "DataFlow AG",       amount:  399, status: "Processing", date: "Dec 28" },
  { id: "#ORD-9479", customer: "CloudMind BV",      amount: 4800, status: "Completed",  date: "Dec 27" },
  { id: "#ORD-9478", customer: "Pulse Analytics",   amount:  149, status: "Pending",    date: "Dec 27" },
  { id: "#ORD-9477", customer: "Axis Digital",      amount: 1200, status: "Completed",  date: "Dec 26" },
  { id: "#ORD-9476", customer: "Nexo Systems",      amount:  299, status: "Refunded",   date: "Dec 26" },
  { id: "#ORD-9475", customer: "BrightData Ltd",    amount:  399, status: "Completed",  date: "Dec 25" },
  { id: "#ORD-9474", customer: "Sigma Insights",    amount: 4800, status: "Completed",  date: "Dec 24" },
]

// ─── KPIs (full year 2025) ────────────────────────────────────────────────────
export const KPI_DATA = [
  { label: "Total Revenue",   value: "$1,302,400", change: "+18.4%", up: true,  icon: "💰" },
  { label: "Total Orders",    value: "16,848",     change: "+14.2%", up: true,  icon: "📦" },
  { label: "Avg Order Value", value: "$77.30",     change: "+3.7%",  up: true,  icon: "🛒" },
  { label: "Conversion Rate", value: "4.1%",       change: "+0.4pp", up: true,  icon: "🎯" },
  { label: "New Customers",   value: "2,840",      change: "+22.6%", up: true,  icon: "👥" },
  { label: "Churn Rate",      value: "1.6%",       change: "-0.3pp", up: true,  icon: "📉" },
  { label: "Customer LTV",    value: "$620",       change: "+8.2%",  up: true,  icon: "⭐" },
  { label: "Repeat Purchase", value: "71%",        change: "+5.1%",  up: true,  icon: "🔄" },
  { label: "YoY Growth",      value: "+18.4%",     change: "+2.8pp", up: true,  icon: "📈" },
  { label: "Revenue / User",  value: "$458",       change: "+6.3%",  up: true,  icon: "💵" },
]
