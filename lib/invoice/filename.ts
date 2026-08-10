// The PDF file name.
//
//   RE-2026-001_2026-08-10_Beispiel-GmbH.pdf
//
// Number first: it is the key the Steuerberater references, and within a year it
// sorts chronologically anyway. Then the ISO date, which sorts correctly and
// cannot be misread as an American date. Then the customer.

/** Reduces any string to `[A-Za-z0-9-]`.
 *
 *  German umlauts are transliterated the way German does it (ä → ae, ß → ss)
 *  rather than stripped, because "Mueller" is a name and "Mller" is not. What is
 *  left of any other accent is removed via NFD decomposition. */
export function slug(value: unknown): string {
  return (
    String(value ?? '')
      // Case-aware, and it has to run BEFORE the NFD pass: normalising first
      // would decompose Ä into A + a combining diaeresis, and stripping the
      // mark would leave a bare "A" — turning Müller into Mller, which is the
      // one outcome worse than an umlaut in a file name.
      //
      // A capital umlaut followed by another capital is inside an all-caps word,
      // where German writes ÖLMÜHLE as OELMUEHLE, not OeLMUeHLE.
      .replace(/[ÄÖÜ]/g, (character, offset: number, whole: string) => {
        const letter = { Ä: 'A', Ö: 'O', Ü: 'U' }[character as 'Ä' | 'Ö' | 'Ü']
        const next = whole.slice(offset + 1, offset + 2)
        return letter + (/[A-ZÄÖÜ]/.test(next) ? 'E' : 'e')
      })
      .replace(/[äöü]/g, (character) => ({ ä: 'ae', ö: 'oe', ü: 'ue' })[character as 'ä' | 'ö' | 'ü'])
      .replace(/ß/g, 'ss')
      .replace(/ẞ/g, 'SS')
      .normalize('NFD')
      // The combining diacritical block, written as escapes: the literal
      // characters are invisible in an editor and survive copy-paste badly.
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-') // everything else -> a single hyphen
      .replace(/^-+|-+$/g, '')
  )
}

/** The file name without the extension — also what `document.title` is set to
 *  before printing, since Chrome uses the title as the default name in its
 *  "Save as PDF" dialog. */
export function invoiceFileBase(args: {
  invoiceNumber: string
  invoiceDate: string // ISO yyyy-mm-dd
  customerName: string
}): string {
  // Every segment is slugged, not just the customer. The invoice number is a
  // free-text field the owner can type into, and a number containing a slash
  // would silently turn the file name into a directory path — the one failure
  // here that loses the file rather than merely misnaming it.
  const segments = [
    slug(args.invoiceNumber),
    slug(args.invoiceDate),
    slug(args.customerName),
  ].filter(Boolean) // an empty customer must not leave a dangling underscore

  // Everything empty would otherwise produce a file called ".pdf", which is
  // hidden on Unix and has no name to search for.
  if (segments.length === 0) return 'Rechnung'

  return segments.join('_')
}

export function invoiceFileName(args: {
  invoiceNumber: string
  invoiceDate: string
  customerName: string
}): string {
  return `${invoiceFileBase(args)}.pdf`
}

/** The characters that must never appear in the result: path separators, the
 *  Windows-reserved set, and spaces. Exported so a test can assert against the
 *  same list the rule is written in terms of. */
export const FORBIDDEN_IN_FILENAME = ['/', '\\', ':', '*', '?', '"', '<', '>', '|', ' ']
