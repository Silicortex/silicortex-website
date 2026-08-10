'use client'

import { formatCurrency } from '@/lib/invoice/format.ts'

export type EuSaleRow = {
  quarter: string
  customerVatId: string
  net: number
  count: number
}

/** The figures for the Zusammenfassende Meldung — a report, not a filing.
 *
 *  The ZM goes to the BZSt electronically, and its period (monthly or quarterly)
 *  depends on turnover thresholds this app cannot determine. So it shows what to
 *  report and files nothing. Nor does it confirm any VAT ID against BZSt/VIES:
 *  obtaining that confirmation, and keeping it as evidence, stays manual — and
 *  matters, because an invalid customer VAT ID makes the VAT the supplier's. */
export function EuSalesReport({ rows }: { rows: EuSaleRow[] }) {
  return (
    <section className="admin-no-print mx-auto mt-12 max-w-[840px] px-6">
      <h3 className="text-base font-semibold text-slate-900">
        Zusammenfassende Meldung (EU-Umsätze)
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Festgeschriebene Rechnungen mit Reverse Charge, gruppiert nach Quartal und
        USt-IdNr. des Kunden. Diese Übersicht meldet nichts — die Zusammenfassende
        Meldung ist beim Bundeszentralamt für Steuern einzureichen. Die USt-IdNr.
        jedes Kunden muss vorher bestätigt und der Nachweis aufbewahrt werden; bei
        einer ungültigen Nummer schuldet der Rechnungsaussteller die Steuer.
      </p>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Keine EU-Umsätze erfasst.</p>
      ) : (
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="py-1 font-normal">Quartal</th>
              <th className="py-1 font-normal">USt-IdNr. des Kunden</th>
              <th className="py-1 font-normal text-right">Rechnungen</th>
              <th className="py-1 font-normal text-right">Summe netto</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.quarter}-${row.customerVatId}`} className="border-b border-black/5">
                <td className="py-1.5 tabular-nums">{row.quarter}</td>
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
