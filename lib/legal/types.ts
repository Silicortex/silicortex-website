// Legal pages (Impressum, Datenschutzerklärung) are deliberately NOT part of
// the dictionaries: SiteChrome serialises the whole dictionary into every
// page's client payload, and ~15 KB of legal prose per language would ride
// along on every route. These files are imported only by the two server
// components that render them.

export type LegalSection = {
  heading: string
  /** Plain paragraphs, rendered as <p>. */
  paragraphs?: string[]
  /** An address-style block, one line each, rendered with <br>. */
  lines?: string[]
  /** Bullet points, rendered as <ul>. */
  list?: string[]
  /** A link shown after the paragraphs. */
  link?: { label: string; href: string }
}

export type LegalPage = {
  title: string
  /** e.g. "Stand: Oktober 2026" */
  updated: string
  /** Shown above the text on translated versions: the German text is binding. */
  note?: string
  sections: LegalSection[]
}

export type LegalContent = {
  impressum: LegalPage
  privacy: LegalPage
}
