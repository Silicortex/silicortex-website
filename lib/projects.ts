// The projects on /work, in the order they appear. Only the language-neutral
// facts live here — images, frames, stack, links; the words are in the
// dictionaries under `projects.items[id]`.
//
// Honesty rules (owner, 23.10.2026): clients are named — they agreed to be
// shown with name and logo. A stock photo would be marked as such on the page
// (the "photo" frame); today every project has its own screenshot. Every
// technology listed is one the project's code really uses. Sources of all
// images: docs/projects-images.md.

export type ProjectKind = "own" | "client" | "voluntary"
export type Frame = "browser" | "phone" | "screen" | "photo"
export type TechGroup = "frontend" | "backend" | "ai" | "automation" | "robotics" | "payments" | "infra" | "mobile"

export type ProjectImage = {
  src: string
  width: number
  height: number
  frame: Frame
  /** Shown in the browser frame's address bar; anonymised projects show none. */
  url?: string
}

export type Project = {
  id: ProjectId
  kind: ProjectKind
  /** Public link, own products only. */
  href?: string
  main: ProjectImage
  /** A second view, laid over the main one (a phone next to a browser). */
  inset?: ProjectImage
  stack: { name: string; group: TechGroup }[]
}

export type ProjectId =
  | "vibecenter" | "website" | "admin" | "care" | "commerce"
  | "translation" | "tvLauncher" | "workshop" | "association" | "robot"

const img = (src: string, width: number, height: number, frame: Frame, url?: string): ProjectImage => ({
  src: `/work/${src}`, width, height, frame, url,
})

export const PROJECTS: Project[] = [
  {
    id: "vibecenter",
    kind: "own",
    href: "https://vibecenter.de",
    main: img("vibecenter-storefront.webp", 1440, 838, "browser", "vibecenter.de"),
    inset: img("vibecenter-dashboard.webp", 1440, 900, "browser", "vibecenter.de/dashboard"),
    stack: [
      { name: "Next.js", group: "frontend" }, { name: "React", group: "frontend" },
      { name: "TypeScript", group: "frontend" }, { name: "Tailwind CSS", group: "frontend" },
      { name: "shadcn/ui", group: "frontend" }, { name: "next-intl", group: "frontend" },
      { name: "Stripe", group: "payments" }, { name: "Vercel AI SDK", group: "ai" },
      { name: "Resend", group: "infra" }, { name: "Docker", group: "infra" },
    ],
  },
  {
    id: "robot",
    kind: "own",
    // The owner's LinkedIn post about Noah (video and details).
    href: "https://www.linkedin.com/posts/mohamad-katramez-a24705215_robotics-pibrocks-ros2-activity-7511658836634714112-PWnQ",
    main: img("robot-dashboard.webp", 1280, 800, "browser", "noah.local:8080"),
    stack: [
      { name: "Raspberry Pi 5", group: "robotics" }, { name: "ROS 2", group: "robotics" },
      { name: "rosbridge", group: "robotics" }, { name: "OAK-D Lite (DepthAI)", group: "robotics" },
      { name: "Tinkerforge", group: "robotics" }, { name: "Python", group: "backend" },
      { name: "FastAPI", group: "backend" }, { name: "ONNX Runtime", group: "ai" },
      { name: "Computer Vision", group: "ai" }, { name: "GPT-4o", group: "ai" }, { name: "Claude", group: "ai" },
      { name: "Docker", group: "infra" },
    ],
  },
  {
    id: "translation",
    kind: "client",
    main: img("translation-venue-screen.webp", 1600, 900, "screen"),
    inset: img("translation-phone.webp", 585, 1266, "phone"),
    stack: [
      { name: "Python", group: "backend" }, { name: "FastAPI", group: "backend" },
      { name: "WebSockets", group: "backend" }, { name: "PostgreSQL", group: "backend" },
      { name: "Speechmatics", group: "ai" }, { name: "Soniox", group: "ai" },
      { name: "Gemini", group: "ai" }, { name: "OpenAI", group: "ai" }, { name: "Claude", group: "ai" },
      { name: "TypeScript", group: "frontend" }, { name: "Vite", group: "frontend" },
      { name: "Docker", group: "infra" },
    ],
  },
  {
    id: "workshop",
    kind: "client",
    main: img("workshop-hero.webp", 1440, 900, "browser"),
    stack: [
      { name: "Next.js", group: "frontend" }, { name: "TypeScript", group: "frontend" },
      { name: "next-intl", group: "frontend" }, { name: "shadcn/ui", group: "frontend" },
      { name: "Prisma", group: "backend" }, { name: "PostgreSQL", group: "backend" },
      { name: "Claude", group: "ai" }, { name: "n8n", group: "automation" },
      { name: "WhatsApp Business API", group: "automation" }, { name: "Resend", group: "infra" },
      { name: "Playwright", group: "infra" }, { name: "Vitest", group: "infra" }, { name: "Docker", group: "infra" },
    ],
  },
  {
    id: "care",
    kind: "client",
    main: img("care-platform-home.webp", 1440, 900, "browser"),
    inset: img("care-platform-admin.webp", 1440, 900, "browser"),
    stack: [
      { name: "Laravel", group: "backend" }, { name: "PHP", group: "backend" },
      { name: "Sanctum", group: "backend" }, { name: "Next.js", group: "frontend" },
      { name: "React", group: "frontend" }, { name: "TypeScript", group: "frontend" },
      { name: "next-intl", group: "frontend" }, { name: "Stripe", group: "payments" },
      { name: "Docker", group: "infra" },
    ],
  },
  {
    id: "admin",
    kind: "own",
    main: img("admin-overview.webp", 1440, 770, "browser", "admin.silicortex.de"),
    stack: [
      { name: "Next.js", group: "frontend" }, { name: "TypeScript", group: "frontend" },
      { name: "Tailwind CSS", group: "frontend" }, { name: "PostgreSQL (Neon)", group: "backend" },
      { name: "Cloudflare R2", group: "infra" }, { name: "Google Drive API", group: "backend" },
      { name: "Google Calendar API", group: "backend" }, { name: "Gemini", group: "ai" },
      { name: "Playwright", group: "infra" }, { name: "Vercel", group: "infra" },
    ],
  },
  {
    id: "commerce",
    kind: "own",
    main: img("ecommerce-home.webp", 1440, 900, "browser"),
    stack: [
      { name: "Medusa v2", group: "backend" }, { name: "Node.js", group: "backend" },
      { name: "Next.js", group: "frontend" }, { name: "React Query", group: "frontend" },
      { name: "TypeScript", group: "frontend" }, { name: "next-intl", group: "frontend" },
      { name: "Claude", group: "ai" }, { name: "Vitest", group: "infra" }, { name: "Docker", group: "infra" },
    ],
  },
  {
    id: "website",
    kind: "own",
    href: "https://www.silicortex.de",
    main: img("silicortex-website.webp", 1440, 900, "browser", "silicortex.de"),
    stack: [
      { name: "Next.js", group: "frontend" }, { name: "React", group: "frontend" },
      { name: "TypeScript", group: "frontend" }, { name: "Tailwind CSS", group: "frontend" },
      { name: "Framer Motion", group: "frontend" }, { name: "Recharts", group: "frontend" },
      { name: "Resend", group: "infra" }, { name: "Playwright", group: "infra" }, { name: "Vercel", group: "infra" },
    ],
  },
  {
    id: "tvLauncher",
    kind: "own",
    main: img("tv-launcher-home.webp", 1920, 1080, "screen"),
    stack: [
      { name: "Kotlin", group: "mobile" }, { name: "Jetpack Compose", group: "mobile" },
      { name: "Android TV / Fire OS", group: "mobile" }, { name: "Gradle", group: "infra" },
    ],
  },
  {
    id: "association",
    kind: "voluntary",
    main: img("association-website.webp", 1200, 900, "browser"),
    stack: [
      { name: "WordPress", group: "backend" }, { name: "PHP", group: "backend" },
      { name: "Block Theme", group: "frontend" }, { name: "Block Bindings", group: "frontend" },
      { name: "Custom Plugin", group: "backend" }, { name: "Docker", group: "infra" },
    ],
  },
]

/** Every technology with the number of projects that use it, per group. */
export function techOverview(): Record<TechGroup, { name: string; count: number }[]> {
  const out: Record<TechGroup, Map<string, number>> = {
    frontend: new Map(), backend: new Map(), ai: new Map(), automation: new Map(), robotics: new Map(), payments: new Map(), infra: new Map(), mobile: new Map(),
  }
  for (const p of PROJECTS) for (const t of p.stack) out[t.group].set(t.name, (out[t.group].get(t.name) ?? 0) + 1)
  return Object.fromEntries(
    Object.entries(out).map(([g, m]) => [g, [...m].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))])
  ) as Record<TechGroup, { name: string; count: number }[]>
}
