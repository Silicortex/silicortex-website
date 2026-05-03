import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { MONTHLY, PRODUCTS as PRODUCT_LIST, COMPANY } from "@/lib/dashboardData"

// ─── Shared dataset: Lumina Analytics GmbH (Jan–Dec 2025) ────────────────────
const DB = {
  company: COMPANY,
  monthly: MONTHLY,
  products: PRODUCT_LIST,
  kpis: {
    totalRevenue: 1302400,
    totalOrders: 16848,
    avgOrderValue: 77.30,
    conversionRate: 4.1,
    newCustomers: 2840,
    churnRate: 1.6,
    customerLTV: 620,
    repeatPurchaseRate: 71,
    yoyGrowth: 18.4,
    revenuePerUser: 458,
  },
}

// ─── Tool definitions (OpenAI format) ────────────────────────────────────────
const tools: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "query_sales_by_period",
      description: "Returns monthly revenue, orders, and new customer counts. Use when the user asks about sales or revenue over a time period.",
      parameters: {
        type: "object",
        properties: {
          months: { type: "number", description: "How many recent months to return (1–12). Default 3." },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_product_performance",
      description: "Returns revenue, units sold, and average price per product. Use when the user asks about products or best sellers.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "How many top products to return. Default 5." },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_kpis",
      description: "Returns key business metrics: total revenue, conversion rate, churn, LTV, growth rate, etc.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
]

// ─── Tool executor ─────────────────────────────────────────────────────────────
function executeTool(name: string, args: string): string {
  const input = JSON.parse(args || "{}")
  if (name === "query_sales_by_period") {
    const months = Math.min(Number(input.months ?? 3), 12)
    const rows = DB.monthly.slice(-months)
    const total = rows.reduce((s, r) => s + r.revenue, 0)
    return JSON.stringify({ period: `Last ${months} months`, rows, totalRevenue: total })
  }
  if (name === "query_product_performance") {
    const limit = Math.min(Number(input.limit ?? 5), DB.products.length)
    return JSON.stringify({ products: DB.products.slice(0, limit) })
  }
  if (name === "query_kpis") {
    return JSON.stringify(DB.kpis)
  }
  return JSON.stringify({ error: "Unknown tool" })
}

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const { messages } = await req.json() as { messages: Groq.Chat.Completions.ChatCompletionMessageParam[] }

  const system = `You are a sales analyst for ${COMPANY.name} — ${COMPANY.industry}, ${COMPANY.location}. Dataset: ${COMPANY.period}.
Always call the relevant tool before answering. Format numbers with commas and $ signs. Keep responses to 2–4 sentences unless a breakdown is needed.`

  let currentMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: system },
    ...messages,
  ]

  // Agentic loop: keep running until the model stops calling tools
  while (true) {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      tools,
      tool_choice: "auto",
      messages: currentMessages,
    })

    const choice = response.choices[0]
    const msg = choice.message

    if (choice.finish_reason === "tool_calls" && msg.tool_calls?.length) {
      // Execute all requested tools
      const toolResults: Groq.Chat.Completions.ChatCompletionMessageParam[] = msg.tool_calls.map((tc: Groq.Chat.Completions.ChatCompletionMessageToolCall) => ({
        role: "tool" as const,
        tool_call_id: tc.id,
        content: executeTool(tc.function.name, tc.function.arguments),
      }))

      currentMessages = [...currentMessages, msg, ...toolResults]
      continue
    }

    return NextResponse.json({ reply: msg.content ?? "No response." })
  }
}
