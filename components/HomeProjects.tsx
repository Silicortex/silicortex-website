import Image from "next/image"
import Link from "next/link"
import type { Dictionary, Lang } from "@/lib/dictionaries"
import { CLIENTS } from "@/lib/clients"
import { PROJECTS, techOverview, type ProjectId } from "@/lib/projects"
import { Marquee } from "@/components/Marquee"

// The home page's projects section: three highlights that lead into /work,
// then the carousels — the companies we worked with (only once the owner has
// named them in lib/clients.ts) and the technologies from our projects.

const HIGHLIGHTS: ProjectId[] = ["vibecenter", "translation", "workshop"]

const KIND_STYLE = {
  own: "bg-brand-cyan/10 text-[#0A7F8C] ring-brand-cyan/30 dark:text-brand-cyan",
  project: "bg-violet-500/10 text-violet-700 ring-violet-500/25 dark:text-violet-300",
  client: "bg-brand-blue/10 text-brand-blue ring-brand-blue/25 dark:text-[#7DA2FF]",
  voluntary: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
} as const

// Technologies we know beyond the nine projects shown (owner's experience).
const MORE_TECH = ["Shopware", "n8n"]

export function HomeProjects({ lang, dict }: { lang: Lang; dict: Dictionary }) {
  const p = dict.projects
  const all = Object.values(techOverview()).flat().map((t) => t.name)
  const tech = [...new Set([...MORE_TECH, ...all])]

  return (
    <section className="bg-slate-50 px-6 py-24 dark:bg-[#030a1f] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontSize: "clamp(1.875rem, 2.5vw + 1rem, 3rem)" }}>
              {p.homeTitle}
            </h2>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">{p.homeIntro}</p>
          </div>
          <Link href={`/${lang}/work`} className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2A62FF]">
            {p.homeAll}
          </Link>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {HIGHLIGHTS.map((id) => {
            const project = PROJECTS.find((x) => x.id === id)!
            const t = p.items[id]
            return (
              <li key={id}>
                <Link
                  href={`/${lang}/work#${id}`}
                  className="group block h-full overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-brand-blue/40 hover:shadow-xl hover:shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900 dark:hover:border-brand-cyan/40"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-900">
                    <Image
                      src={project.main.src}
                      width={project.main.width}
                      height={project.main.height}
                      alt={t.name}
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-6">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${KIND_STYLE[project.kind]}`}>{p.kinds[project.kind]}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{t.sector}</span>
                    </p>
                    <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white">{t.name}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t.summary}</p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>

        {CLIENTS.length > 0 && (
          <div className="mt-20">
            <h3 className="mb-6 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">{p.clientsCarousel}</h3>
            <Marquee
              label={p.clientsCarousel}
              items={CLIENTS.map((c) => (
                <span
                  key={c.name}
                  className="flex h-28 w-44 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm dark:border-white/10"
                >
                  {c.logo ? (
                    <Image src={c.logo.src} alt="" width={c.logo.width} height={c.logo.height} className="h-12 w-auto max-w-[8.5rem] object-contain" />
                  ) : (
                    <span className="flex h-12 items-center text-xl font-bold tracking-tight text-brand-navy">{c.name}</span>
                  )}
                  <span className="text-xs font-medium text-slate-500">{c.logo ? c.name : "\u00a0"}</span>
                </span>
              ))}
            />
          </div>
        )}

        <div className="mt-20">
          <h3 className="mb-6 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">{p.techCarousel}</h3>
          <Marquee
            label={p.techCarousel}
            items={tech.map((name) => (
              <span key={name} className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                {name}
              </span>
            ))}
          />
          <Marquee
            label={p.techCarousel}
            reverse
            items={[...tech].reverse().map((name) => (
              <span key={name} className="mt-3 inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                {name}
              </span>
            ))}
          />
        </div>
      </div>
    </section>
  )
}
