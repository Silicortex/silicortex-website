import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { messages, max_tokens } = await req.json()

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: max_tokens ?? 400,
      messages,
    })

    const text = response.choices[0]?.message?.content ?? ""
    return NextResponse.json({ text })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
