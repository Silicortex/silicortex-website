import { createHash } from "node:crypto"
import { Resend } from "resend"
import { siteConfig } from "@/lib/siteConfig"

// Contact form backend. Replaces the browser-side POST to Formspree, which
// sent every visitor's name, email, message and IP to a US processor with no
// published DPA or transfer mechanism. Now the browser talks only to this
// site; the message leaves as one email through Resend (DPA in its terms,
// EU-U.S. Data Privacy Framework certified, SCCs) to the mailbox in
// siteConfig. Nothing is stored here. The Datenschutzerklärung (lib/legal)
// describes exactly this flow — keep the two in sync.

export const runtime = "nodejs"

const LIMITS = { name: 200, company: 200, email: 254, message: 5000 } as const

type Payload = { name: string; company: string; email: string; message: string; website: string }

function readPayload(body: unknown): Payload | null {
  if (!body || typeof body !== "object") return null
  const b = body as Record<string, unknown>
  const str = (k: keyof Payload) => (typeof b[k] === "string" ? (b[k] as string).trim() : "")
  return { name: str("name"), company: str("company"), email: str("email"), message: str("message"), website: str("website") }
}

function validate(p: Payload): string | null {
  if (!p.name || p.name.length > LIMITS.name) return "name"
  if (p.company.length > LIMITS.company) return "company"
  // Deliberately loose: the mailbox, not a regex, decides what a valid address is.
  if (!p.email || p.email.length > LIMITS.email || !p.email.includes("@") || /\s/.test(p.email)) return "email"
  if (!p.message || p.message.length > LIMITS.message) return "message"
  return null
}

export async function POST(request: Request) {
  let payload: Payload | null = null
  try {
    payload = readPayload(await request.json())
  } catch {
    payload = null
  }
  if (!payload) return Response.json({ ok: false, error: "bad_request" }, { status: 400 })

  // Honeypot: a hidden field real visitors never fill. Bots that do get a
  // success response and no email, so they learn nothing.
  if (payload.website) return Response.json({ ok: true })

  const invalid = validate(payload)
  if (invalid) return Response.json({ ok: false, error: "invalid", field: invalid }, { status: 422 })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("contact: RESEND_API_KEY is not set")
    return Response.json({ ok: false, error: "unavailable" }, { status: 503 })
  }

  const to = process.env.CONTACT_TO || siteConfig.contactEmail
  // onboarding@resend.dev can only deliver to the Resend account owner, which
  // is this mailbox — enough for a contact form. Set CONTACT_FROM to an
  // address on a verified domain to send from silicortex.de instead.
  const from = process.env.CONTACT_FROM || "Silicortex Website <onboarding@resend.dev>"

  const lines = [
    `Name: ${payload.name}`,
    payload.company ? `Firma: ${payload.company}` : null,
    `E-Mail: ${payload.email}`,
    "",
    payload.message,
  ].filter((l): l is string => l !== null)

  // Same message twice within 24 h (double click, retry) sends one email.
  const idempotencyKey = `contact/${createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 48)}`

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send(
    {
      from,
      to: [to],
      replyTo: payload.email,
      subject: `Kontaktanfrage von ${payload.name}${payload.company ? ` (${payload.company})` : ""}`,
      text: lines.join("\n"),
    },
    { idempotencyKey },
  )

  if (error) {
    console.error("contact: send failed", error.name, error.message)
    return Response.json({ ok: false, error: "send_failed" }, { status: 502 })
  }
  return Response.json({ ok: true })
}
