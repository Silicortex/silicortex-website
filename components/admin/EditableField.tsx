'use client'

import { formatDateDe } from '@/lib/invoice/format.ts'

type Props = {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  placeholder?: string
  type?: 'text' | 'date'
  multiline?: boolean
  readOnly?: boolean
  className?: string
  /** Overrides what is printed; defaults to `value`. */
  printValue?: string
}

// Renders TWO representations of one value: an input for the screen and a
// span for print. The span wraps, is never locale-formatted by the browser,
// and is empty when the value is empty — which is how the print CSS knows
// to hide optional rows.
export function EditableField({
  value,
  onChange,
  ariaLabel,
  placeholder,
  type = 'text',
  multiline = false,
  readOnly = false,
  className = '',
  printValue,
}: Props) {
  const printed = printValue ?? (type === 'date' ? formatDateDe(value) : value)

  return (
    <>
      {multiline ? (
        <textarea
          aria-label={ariaLabel}
          className={`admin-field admin-no-print resize-none ${className}`}
          rows={2}
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          aria-label={ariaLabel}
          type={type}
          className={`admin-field admin-no-print ${className}`}
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <span className="admin-print-only">{printed}</span>
    </>
  )
}
