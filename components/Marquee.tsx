// An endless horizontal strip ("carousel") in pure CSS — no JavaScript. The
// items are rendered twice and the track slides by exactly one copy, so the
// loop is seamless. It pauses on hover and focus, and with reduced motion it
// becomes a still, wrapping list. Direction is fixed left-to-right so it
// reads the same on Arabic pages.

export function Marquee({ label, items, reverse = false }: { label: string; items: React.ReactNode[]; reverse?: boolean }) {
  return (
    <div dir="ltr" className="marquee group relative overflow-hidden" role="region" aria-label={label}>
      <ul className={`marquee-track flex w-max gap-3 ${reverse ? "marquee-reverse" : ""}`}>
        {[0, 1].map((copy) =>
          items.map((item, i) => (
            <li key={`${copy}-${i}`} aria-hidden={copy === 1 || undefined} className="shrink-0">
              {item}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
