// Companies shown in the "worked with" carousel on the home page.
//
// Only companies that agreed to be named belong here — the owner confirms
// each one (§ 5 UWG: a logo strip implies a real client relationship). The
// projects page shows client work anonymised; nothing here may contradict it.
// While the list is empty the carousel is not rendered at all.

export type Client = {
  name: string
  /** Path under /public, e.g. "/clients/name.svg". Without one, the name is shown as text. */
  logo?: string
}

export const CLIENTS: Client[] = []
