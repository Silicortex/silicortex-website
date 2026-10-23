import Image from "next/image"
import Link from "next/link"
import type { Dictionary, Lang } from "@/lib/dictionaries"
import { PROJECTS, techOverview, type Project, type ProjectImage, type TechGroup } from "@/lib/projects"

// /work: the projects page. A server component — no client JavaScript. Each
// project is a wide band: its picture in a frame that matches where it runs
// (browser, a screen on the wall, a phone, or a stock photo until the real
// screenshots exist), next to what it is, what was built and with what. The
// bands alternate sides; the frames are the one visual idea, the rest stays
// quiet.

type P = Dictionary["projects"]

const KIND_STYLE: Record<Project["kind"], string> = {
  own: "bg-brand-cyan/10 text-[#0A7F8C] ring-brand-cyan/30 dark:text-brand-cyan",
  client: "bg-brand-blue/10 text-brand-blue ring-brand-blue/25 dark:text-[#7DA2FF]",
  voluntary: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
}

function Browser({ image, alt, priority }: { image: ProjectImage; alt: string; priority?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-2xl shadow-slate-900/15 ring-1 ring-black/10 dark:bg-slate-900 dark:shadow-black/40 dark:ring-white/10">
      <div className="flex h-8 items-center gap-1.5 border-b border-black/5 bg-slate-100 px-3 dark:border-white/5 dark:bg-slate-800">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
        <span dir="ltr" className="mx-auto h-5 w-1/2 truncate rounded-md bg-white px-2 text-center text-[11px] leading-5 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          {image.url ?? ""}
        </span>
      </div>
      <Image src={image.src} width={image.width} height={image.height} alt={alt} priority={priority} sizes="(min-width: 1024px) 58vw, 100vw" className="block h-auto w-full" />
    </div>
  )
}

function Screen({ image, alt }: { image: ProjectImage; alt: string }) {
  return (
    <div>
      <div className="rounded-xl bg-slate-950 p-2 shadow-2xl shadow-slate-900/20 ring-1 ring-black/20 dark:ring-white/10">
        <Image src={image.src} width={image.width} height={image.height} alt={alt} sizes="(min-width: 1024px) 58vw, 100vw" className="block h-auto w-full rounded-md" />
      </div>
      <div className="mx-auto h-6 w-10 bg-gradient-to-b from-slate-700 to-slate-800" />
      <div className="mx-auto h-1.5 w-32 rounded-full bg-slate-700" />
    </div>
  )
}

function Phone({ image, alt, className = "" }: { image: ProjectImage; alt: string; className?: string }) {
  return (
    <div className={`rounded-[1.75rem] bg-slate-950 p-1.5 shadow-2xl shadow-slate-900/30 ring-1 ring-white/10 ${className}`}>
      <Image src={image.src} width={image.width} height={image.height} alt={alt} sizes="12rem" className="block h-auto w-full rounded-[1.4rem]" />
    </div>
  )
}

function Photo({ image, alt, note }: { image: ProjectImage; alt: string; note: string }) {
  return (
    <figure className="relative overflow-hidden rounded-2xl shadow-2xl shadow-slate-900/15 ring-1 ring-black/10 dark:ring-white/10">
      <Image src={image.src} width={image.width} height={image.height} alt={alt} sizes="(min-width: 1024px) 58vw, 100vw" className="block h-auto w-full" />
      <figcaption className="absolute bottom-3 start-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs text-white backdrop-blur">{note}</figcaption>
    </figure>
  )
}

function Media({ project, name, p, priority }: { project: Project; name: string; p: P; priority: boolean }) {
  const { main, inset } = project
  const mainEl =
    main.frame === "browser" ? <Browser image={main} alt={name} priority={priority} />
    : main.frame === "screen" ? <Screen image={main} alt={name} />
    : main.frame === "phone" ? <Phone image={main} alt={name} className="mx-auto w-56" />
    : <Photo image={main} alt={name} note={p.stockPhoto} />
  if (!inset) return mainEl
  // The second view overlaps the first's lower corner — a phone, or a
  // smaller browser window — and sits below it on narrow screens.
  return (
    <div className="relative pb-10 sm:pb-16">
      <div className={inset.frame === "phone" ? "sm:me-16" : "sm:me-24"}>{mainEl}</div>
      <div className={`mt-6 sm:absolute sm:bottom-0 sm:end-0 sm:mt-0 ${inset.frame === "phone" ? "mx-auto w-36 sm:w-40" : "w-full sm:w-1/2"}`}>
        {inset.frame === "phone" ? <Phone image={inset} alt={name} /> : <Browser image={inset} alt={name} />}
      </div>
    </div>
  )
}

function Check() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue dark:text-brand-cyan" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function ProjectBand({ project, index, p }: { project: Project; index: number; p: P }) {
  const t = p.items[project.id]
  const flip = index % 2 === 1
  return (
    <article id={project.id} className="scroll-mt-24 border-t border-slate-200 py-16 dark:border-white/10 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className={`lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
          <Media project={project} name={t.name} p={p} priority={index === 0} />
        </div>
        <div className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${KIND_STYLE[project.kind]}`}>{p.kinds[project.kind]}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{t.sector}</span>
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{t.name}</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{t.summary}</p>

          <h3 className="mt-8 text-sm font-semibold text-slate-900 dark:text-white">{p.builtTitle}</h3>
          <ul className="mt-3 space-y-2">
            {t.built.map((line) => (
              <li key={line} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                <Check />
                {line}
              </li>
            ))}
          </ul>

          <h3 className="mt-8 text-sm font-semibold text-slate-900 dark:text-white">{p.stackTitle}</h3>
          <ul className="mt-3 flex flex-wrap gap-2" dir="ltr">
            {project.stack.map((s) => (
              <li key={s.name} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {s.name}
              </li>
            ))}
          </ul>

          {(t.note || project.href) && (
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              {project.href && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-4 py-2 font-semibold text-white transition hover:bg-[#2A62FF]"
                >
                  {p.visit} <span dir="ltr">{project.href.replace(/^https:\/\/(www\.)?/, "")}</span>
                  <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </a>
              )}
              {t.note && <span className="text-slate-500 dark:text-slate-400">{t.note}</span>}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

const GROUP_ORDER: TechGroup[] = ["frontend", "backend", "ai", "automation", "infra", "payments", "mobile"]

export function ProjectsShowcase({ lang, dict }: { lang: Lang; dict: Dictionary }) {
  const p = dict.projects
  const tech = techOverview()

  return (
    <div className="bg-white px-6 dark:bg-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="pb-14 pt-16 sm:pt-24">
          <h1 className="font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontSize: "clamp(2.5rem, 5vw + 1rem, 4.5rem)" }}>
            {p.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl">{p.intro}</p>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            {p.stats.map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white" dir="ltr">{s.value}</dd>
                <dd className="text-sm text-slate-500 dark:text-slate-400">{s.label}</dd>
              </div>
            ))}
          </dl>
          <nav aria-label={p.title} className="mt-10 flex flex-wrap gap-2">
            {PROJECTS.map((project) => (
              <a
                key={project.id}
                href={`#${project.id}`}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:border-brand-blue/50 hover:text-brand-blue dark:border-white/10 dark:text-slate-300 dark:hover:text-brand-cyan"
              >
                {p.items[project.id].name}
              </a>
            ))}
          </nav>
        </header>

        {PROJECTS.map((project, i) => (
          <ProjectBand key={project.id} project={project} index={i} p={p} />
        ))}

        <section className="border-t border-slate-200 py-16 dark:border-white/10 sm:py-20">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{p.techTitle}</h2>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">{p.techIntro}</p>
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {GROUP_ORDER.map((g) => (
              <div key={g}>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{p.groups[g]}</h3>
                <ul className="mt-3 flex flex-wrap gap-2" dir="ltr">
                  {tech[g].map((t) => (
                    <li key={t.name} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 py-1 ps-2.5 pe-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                      {t.name}
                      <span className="rounded bg-slate-200 px-1.5 text-[11px] tabular-nums text-slate-600 dark:bg-white/10 dark:text-slate-300">{t.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-10 text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white">{p.techExtraLabel}:</span> {p.techExtra}
          </p>
        </section>

        <section className="grid gap-6 border-t border-slate-200 py-16 dark:border-white/10 sm:py-20 lg:grid-cols-2">
          <Link
            href={`/${lang}/work/sales-dashboard`}
            className="group rounded-3xl border border-slate-200 p-8 transition hover:border-brand-blue/40 dark:border-white/10 dark:hover:border-brand-cyan/40"
          >
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{p.demoTitle}</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">{p.demoText}</p>
            <span className="mt-6 inline-block font-semibold text-brand-blue group-hover:underline dark:text-brand-cyan">{p.demoCta}</span>
          </Link>
          <div className="rounded-3xl bg-brand-navy p-8 text-white">
            <h2 className="text-2xl font-bold tracking-tight">{p.ctaTitle}</h2>
            <p className="mt-3 text-white/75">{p.ctaText}</p>
            <Link
              href={`/${lang}/contact`}
              className="mt-6 inline-block rounded-full bg-white px-5 py-2.5 font-semibold text-brand-navy transition hover:bg-brand-cyan"
            >
              {p.ctaButton}
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
