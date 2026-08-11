'use client'

import { useId } from 'react'

/** A "?" that explains the control beside it on hover or keyboard focus.
 *
 *  The visible box is drawn by CSS from the `data-hint` attribute, not from a child
 *  node, so nothing has to be hidden when the document goes to paper beyond the "?"
 *  itself.
 *
 *  Two things about the accessibility wiring, both learned the hard way:
 *
 *  The accessible NAME is the short, fixed word "Erklärung", with the explanation
 *  attached as a description instead. Putting the whole paragraph in `aria-label`
 *  made the button findable by any word inside it — "Steuernummer" matched both the
 *  field and its hint — and, worse, folded the paragraph into the accessible name of
 *  whatever it sat beside.
 *
 *  Which is why this must NEVER be rendered inside a `<label>`. Everything inside a
 *  label becomes part of the labelled control's accessible name, so a hint in there
 *  turns "Steuernummer" into "Steuernummer Vom Finanzamt vergeben. § 14 UStG …" for
 *  a screen reader. Render it as a SIBLING of the label. */
export function InfoHint({ hint, className = '' }: { hint: string; className?: string }) {
  const descriptionId = useId()

  return (
    <span className={`admin-hint-wrap admin-no-print ${className}`}>
      <button
        type="button"
        // Purely explanatory: clicking must not submit anything or move the page.
        onClick={(event) => event.preventDefault()}
        className="admin-hint"
        data-hint={hint}
        aria-label="Erklärung"
        aria-describedby={descriptionId}
      >
        ?
      </button>
      {/* The same text for a screen reader, which cannot read a CSS
          pseudo-element. */}
      <span id={descriptionId} className="admin-sr-only">
        {hint}
      </span>
    </span>
  )
}
