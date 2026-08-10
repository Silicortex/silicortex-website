'use client'

import { useMemo, useState } from 'react'
import { formatCurrency } from '@/lib/invoice/format.ts'
import {
  aggregateEuSales,
  formatPeriodDe,
  type EuSaleMonthRow,
  type EuSalesGrouping,
} from '@/lib/invoice/euSales.ts'

/** The figures for the Zusammenfassende Meldung — a report, not a filing.
 *
 *  The ZM goes to the BZSt electronically, and whether it is due monthly or
 *  quarterly depends on turnover this app cannot judge for you, so BOTH periods
 *  are shown and nothing is filed. Nor is any VAT ID confirmed against BZSt/VIES:
 *  obtaining that confirmation, and keeping it as evidence, stays manual — and
 *  matters, because an invalid customer VAT ID makes the VAT the supplier's. */
export function EuSalesReport({ rows }: { rows: EuSaleMonthRow[] }) {
  const [grouping, setGrouping] = useState<EuSalesGrouping>('quarter')
  // Quarters are derived from the monthly rows, never queried separately, so the
  // two views cannot disagree about a period's total.
  const grouped = useMemo(() => aggregateEuSales(rows, grouping), [rows, grouping])

  const periodLabel = grouping === 'quarter' ? 'Quartal' : 'Monat'

  return (
    <section className="admin-no-print mx-auto mt-12 max-w-[840px] px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">
          Zusammenfassende Meldung (EU-Umsätze)
        </h3>
        <div className="flex gap-1 rounded-full border border-black/10 bg-white p-1 text-sm">
          {(['month', 'quarter'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={grouping === option}
              onClick={() => setGrouping(option)}
              className={
                grouping === option
                  ? 'rounded-full bg-blue-600 px-3 py-1 font-medium text-white'
                  : 'rounded-full px-3 py-1 text-slate-600 transition hover:text-blue-600'
              }
            >
              {option === 'month' ? 'Monatlich' : 'Quartalsweise'}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 text-sm text-slate-500">
        Festgeschriebene Rechnungen mit Reverse Charge, gruppiert nach{' '}
        {periodLabel} und USt-IdNr. des Kunden. Quartalsweise Abgabe ist zulässig,
        solange die innergemeinschaftlichen Leistungen 50.000 € im Quartal nicht
        übersteigen; darüber ist monatlich zu melden. Diese Übersicht meldet
        nichts — die Zusammenfassende Meldung ist beim Bundeszentralamt für Steuern
        einzureichen. Die USt-IdNr. jedes Kunden muss vorher bestätigt und der
        Nachweis aufbewahrt werden; bei einer ungültigen Nummer schuldet der
        Rechnungsaussteller die Steuer.
      </p>

      {grouped.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Keine EU-Umsätze erfasst.</p>
      ) : (
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="py-1 font-normal">{periodLabel}</th>
              <th className="py-1 font-normal">USt-IdNr. des Kunden</th>
              <th className="py-1 text-right font-normal">Rechnungen</th>
              <th className="py-1 text-right font-normal">Summe netto</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((row) => (
              <tr key={`${row.period}-${row.customerVatId}`} className="border-b border-black/5">
                <td className="py-1.5 tabular-nums">{formatPeriodDe(row.period)}</td>
                <td className="py-1.5 tabular-nums">{row.customerVatId}</td>
                <td className="py-1.5 text-right tabular-nums">{row.count}</td>
                {/* Stornos are included with their negative amounts, which is
                    correct: they reduce the reported total for their period. */}
                <td className="py-1.5 text-right tabular-nums">{formatCurrency(row.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
