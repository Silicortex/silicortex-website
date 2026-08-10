'use client'

import { useState } from 'react'
import { EditableField } from './EditableField.tsx'
import { formatAmount, formatCurrency, formatQuantity } from '@/lib/invoice/format.ts'
import { parseNum } from '@/lib/invoice/parseNum.ts'
import { emptyItem } from '@/lib/invoice/types.ts'
import { round2, round3 } from '@/lib/invoice/totals.ts'
import type { InvoiceItemInput } from '@/lib/invoice/totals.ts'

const VAT_RATES = [19, 7, 0]

export function ItemsTable({
  items,
  lineNets,
  defaultVatRate,
  readOnly,
  onChange,
}: {
  items: InvoiceItemInput[]
  lineNets: number[]
  defaultVatRate: number
  readOnly: boolean
  onChange: (items: InvoiceItemInput[]) => void
}) {
  // Raw text per numeric cell so typing "80," is not clobbered mid-keystroke.
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  function update(index: number, patch: Partial<InvoiceItemInput>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function removeRow(index: number) {
    const remaining = items.filter((_, i) => i !== index)
    // Deleting the last row immediately yields a fresh empty one.
    onChange(remaining.length ? remaining : [emptyItem(defaultVatRate)])
    setDrafts({})
  }

  function numericCell(
    index: number,
    field: 'quantity' | 'unitPrice',
    display: (value: number) => string
  ) {
    const key = `${index}-${field}`
    const raw = drafts[key]
    return (
      <>
        <input
          aria-label={`${field === 'quantity' ? 'Menge' : 'Einzelpreis'} Position ${index + 1}`}
          type="text"
          inputMode="decimal"
          className="admin-field admin-no-print text-right"
          readOnly={readOnly}
          value={raw ?? display(items[index][field])}
          onChange={(e) => {
            setDrafts((d) => ({ ...d, [key]: e.target.value }))
            // Quantize to the precision that will actually be printed and
            // stored — money to 2 decimals, quantity to 3 — so the printed
            // line always equals printed price × printed quantity. Committing
            // the raw parsed value made 8 × 0,125 € print as
            // "8 × 0,13 € = 1,00 €" while any reader computes 1,04 €, and the
            // database stored the rounded price beside the unrounded net, so
            // an issued invoice reprinted that contradiction forever.
            const parsed = parseNum(e.target.value)
            update(index, {
              [field]: field === 'unitPrice' ? round2(parsed) : round3(parsed),
            })
          }}
          onBlur={() => {
            // Rewrite the field in German formatting on blur.
            setDrafts((d) => {
              const next = { ...d }
              delete next[key]
              return next
            })
          }}
        />
        <span className="admin-print-only text-right">{display(items[index][field])}</span>
      </>
    )
  }

  return (
    <div className="mt-8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <th className="w-10 py-1 font-medium">Pos.</th>
            <th className="py-1 font-medium">Beschreibung</th>
            {/* pr-3: right-aligned "Menge" otherwise butts straight against
                left-aligned "Einheit" and the header reads "MENGEEINHEIT". */}
            <th className="w-20 py-1 pr-3 text-right font-medium">Menge</th>
            <th className="w-20 py-1 font-medium">Einheit</th>
            <th className="w-28 py-1 text-right font-medium">Einzelpreis</th>
            <th className="w-20 py-1 text-right font-medium">USt.</th>
            <th className="w-28 py-1 text-right font-medium">Gesamt netto</th>
            <th className="admin-no-print w-8 py-1" />
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={index}
              className="border-b border-black/5 align-top"
              data-empty={item.description.trim() === '' && item.unitPrice === 0 ? 'true' : undefined}
            >
              <td className="py-1 font-mono text-xs text-slate-400">{index + 1}</td>
              <td className="py-1">
                <EditableField
                  ariaLabel={`Beschreibung Position ${index + 1}`}
                  value={item.description}
                  readOnly={readOnly}
                  onChange={(value) => update(index, { description: value })}
                />
              </td>
              <td className="py-1 pr-3">{numericCell(index, 'quantity', formatQuantity)}</td>
              <td className="py-1">
                <EditableField
                  ariaLabel={`Einheit Position ${index + 1}`}
                  value={item.unit}
                  readOnly={readOnly}
                  onChange={(value) => update(index, { unit: value })}
                />
              </td>
              <td className="py-1">{numericCell(index, 'unitPrice', formatAmount)}</td>
              <td className="py-1 text-right">
                <select
                  aria-label={`Steuersatz Position ${index + 1}`}
                  className="admin-field admin-no-print text-right [appearance:none]"
                  disabled={readOnly}
                  value={String(item.vatRate)}
                  onChange={(e) => update(index, { vatRate: Number(e.target.value) })}
                >
                  {VAT_RATES.map((rate) => (
                    <option key={rate} value={rate}>
                      {rate} %
                    </option>
                  ))}
                </select>
                <span className="admin-print-only text-right">{formatQuantity(item.vatRate)} %</span>
              </td>
              <td className="py-1 text-right tabular-nums">{formatCurrency(lineNets[index] ?? 0)}</td>
              <td className="admin-no-print py-1 text-right">
                {!readOnly && (
                  <button
                    type="button"
                    aria-label={`Position ${index + 1} löschen`}
                    onClick={() => removeRow(index)}
                    className="px-1 text-slate-400 transition hover:text-red-600"
                  >
                    ✕
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!readOnly && (
        <button
          type="button"
          onClick={() => onChange([...items, emptyItem(defaultVatRate)])}
          className="admin-no-print mt-3 text-sm text-blue-600 underline decoration-blue-300 underline-offset-4 transition hover:text-blue-500"
        >
          + Position hinzufügen
        </button>
      )}
    </div>
  )
}
