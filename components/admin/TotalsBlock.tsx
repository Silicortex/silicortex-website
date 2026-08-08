'use client'

import { formatCurrency, formatQuantity } from '@/lib/invoice/format.ts'
import type { InvoiceTotals } from '@/lib/invoice/totals.ts'

export function TotalsBlock({ totals }: { totals: InvoiceTotals }) {
  return (
    <div className="mt-8 flex justify-end">
      <table className="text-sm">
        <tbody>
          {totals.groups.map((group) => (
            <tr key={group.rate}>
              <th scope="row" className="py-0.5 pr-6 text-left font-normal text-gray-600">
                Nettobetrag {formatQuantity(group.rate)} % USt.
              </th>
              <td className="py-0.5 text-right tabular-nums">{formatCurrency(group.net)}</td>
            </tr>
          ))}
          {totals.groups.map((group) => (
            <tr key={`vat-${group.rate}`}>
              <th scope="row" className="py-0.5 pr-6 text-left font-normal text-gray-600">
                zzgl. {formatQuantity(group.rate)} % USt.
              </th>
              <td className="py-0.5 text-right tabular-nums">{formatCurrency(group.vat)}</td>
            </tr>
          ))}
          <tr className="border-t border-gray-300">
            <th scope="row" className="py-1 pr-6 text-left font-normal text-gray-600">
              Gesamt netto
            </th>
            <td className="py-1 text-right tabular-nums">{formatCurrency(totals.netTotal)}</td>
          </tr>
          <tr className="border-t-2 border-gray-800">
            <th scope="row" className="py-1.5 pr-6 text-left font-semibold">
              Gesamtbetrag
            </th>
            <td className="py-1.5 text-right font-semibold tabular-nums">
              {formatCurrency(totals.grossTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
