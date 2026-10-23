// Companies shown in the "worked with" carousel on the home page.
//
// Only companies that agreed to be named belong here — the owner confirms
// each one (§ 5 UWG: a logo strip implies a real client relationship). The
// projects page names the same clients.
// While the list is empty the carousel is not rendered at all.

export type Client = {
  name: string
  /** Under /public/clients, trimmed PNG. Without one, the name stands alone. */
  logo?: { src: string; width: number; height: number }
}

const logo = (file: string, width: number, height: number) => ({ src: `/clients/${file}`, width, height })

// Confirmed by the owner, 23.10.2026: the clients agree to be shown with their
// logo. Own products are listed too — they are the companies behind the work.
export const CLIENTS: Client[] = [
  { name: "Vibe Center", logo: logo("vibe-center.png", 244, 160) },
  { name: "Misraba", logo: logo("misraba.png", 154, 160) },
  { name: "EuroCura" },
  { name: "Al Sharq", logo: logo("alsharq.png", 75, 160) },
  { name: "Sada", logo: logo("sada.png", 472, 110) },
  { name: "Alsalam School", logo: logo("alsalam-school.png", 160, 160) },
  { name: "DVKZWI Wiesbaden", logo: logo("dvkzwi.png", 160, 160) },
  { name: "PowerSource", logo: logo("powersource.png", 360, 96) },
  { name: "Bayt", logo: logo("bayt.png", 200, 160) },
  { name: "RETO" },
]
