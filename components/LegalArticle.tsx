import type { LegalPage } from "@/lib/legal/types"

// Server component. Renders an Impressum / Datenschutzerklärung from
// structured content; RTL comes from the <html dir> set by the root layout.
export function LegalArticle({ page }: { page: LegalPage }) {
  return (
    <main className="pt-16">
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-20 sm:px-8">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {page.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{page.updated}</p>
        {page.note && (
          <p className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
            {page.note}
          </p>
        )}

        {page.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{section.heading}</h2>
            {section.paragraphs?.map((text, i) => (
              <p key={i} className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
                {text}
              </p>
            ))}
            {section.lines && (
              <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
                {section.lines.map((line, i) => (
                  <span key={i}>
                    {/* Addresses, phone numbers and emails stay left-to-right inside Arabic text. */}
                    <bdi>{line}</bdi>
                    {i < section.lines!.length - 1 && <br />}
                  </span>
                ))}
              </p>
            )}
            {section.list && (
              <ul className="mt-3 list-disc space-y-2 ps-6 leading-relaxed text-slate-600 dark:text-slate-400">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
            {section.link && (
              <p className="mt-3">
                <a
                  href={section.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-4 hover:decoration-blue-600 dark:text-blue-400"
                >
                  {section.link.label}
                </a>
              </p>
            )}
          </section>
        ))}
      </article>
    </main>
  )
}
