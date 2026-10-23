import {
  siAndroid, siClaude, siCloudflare, siDocker, siFastapi, siFramer, siGooglecalendar, siGoogledrive,
  siGooglegemini, siGradle, siJavascript, siJetpackcompose, siKotlin, siLaravel, siMedusa, siN8n,
  siNextdotjs, siNodedotjs, siOnnx, siOpencv, siPhp, siPostgresql, siPrisma, siPython, siRaspberrypi,
  siReact, siReactquery, siResend, siRos, siShadcnui, siShopware, siStripe, siTailwindcss, siTypescript,
  siUltralytics, siVercel, siVite, siVitest, siWhatsapp, siWordpress,
  type SimpleIcon,
} from "simple-icons"

// Brand icons for the technology carousel, from Simple Icons (CC0). An icon
// is used only where it is that product or its maker (Framer for Framer
// Motion, Ultralytics for YOLOv8, ROS for rosbridge); anything without one
// gets a neutral dot. Drawn in currentColor, so they follow the theme.

const ICONS: Record<string, SimpleIcon> = {
  "Next.js": siNextdotjs, React: siReact, TypeScript: siTypescript, JavaScript: siJavascript,
  "Tailwind CSS": siTailwindcss, "shadcn/ui": siShadcnui, Stripe: siStripe, "Vercel AI SDK": siVercel,
  Vercel: siVercel, Resend: siResend, Docker: siDocker, Python: siPython, FastAPI: siFastapi,
  PostgreSQL: siPostgresql, "PostgreSQL (Neon)": siPostgresql, Gemini: siGooglegemini, Claude: siClaude,
  Vite: siVite, Prisma: siPrisma, n8n: siN8n, "WhatsApp Business API": siWhatsapp, Vitest: siVitest,
  Laravel: siLaravel, PHP: siPhp, "Medusa v2": siMedusa, "Node.js": siNodedotjs, "React Query": siReactquery,
  "Framer Motion": siFramer, "Cloudflare R2": siCloudflare, "Google Drive API": siGoogledrive,
  "Google Calendar API": siGooglecalendar, Kotlin: siKotlin, "Jetpack Compose": siJetpackcompose,
  "Android TV / Fire OS": siAndroid, Gradle: siGradle, WordPress: siWordpress, Shopware: siShopware,
  "Raspberry Pi 5": siRaspberrypi, "ROS 2 Humble": siRos, "rosbridge / roslibpy": siRos,
  "OpenCV (YuNet, SFace)": siOpencv, YOLOv8: siUltralytics, "ONNX Runtime": siOnnx,
}

export function TechIcon({ name, className = "h-4 w-4" }: { name: string; className?: string }) {
  const icon = ICONS[name]
  if (!icon) return <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="currentColor">
      <path d={icon.path} />
    </svg>
  )
}
