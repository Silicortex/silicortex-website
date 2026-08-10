'use client'

import { Fragment } from 'react'
import { formatCurrency, formatQuantity } from '@/lib/invoice/format.ts'
import type { InvoiceTotals } from '@/lib/invoice/totals.ts'

export function TotalsBlock({
  totals,
  reverseCharge = false,
}: {
  totals: InvoiceTotals
  reverseCharge?: boolean
}) {
  return (
    <div className="mt-8 flex justify-end">
      <table className="text-sm">
        <tbody>
          {/* Under reverse charge the per-rate rows are dropped entirely. They
              would print "Nettobetrag 0 % USt.", which reads as "a German 0 %
              rate applies" — the opposite of "the recipient owes the tax". The
              note on the document carries the explanation instead.

              Driven by the FLAG, never inferred from the rates: a domestic 0 %
              line ("not taxable here") is a different thing, and conflating the
              two is the ambiguity the flag exists to remove.

              Net and VAT are otherwise paired per rate, which is how a German
              invoice is normally read: each rate's base sits directly above the
              tax charged on it. Listing all bases first and all taxes afterwards
              made a mixed-rate invoice hard to reconcile by eye. */}
          {!reverseCharge &&
            totals.groups.map((group) => (
              <Fragment key={group.rate}>
                <tr>
                  <th scope="row" className="py-0.5 pr-6 text-left font-normal text-slate-500">
                    Nettobetrag {formatQuantity(group.rate)} % USt.
                  </th>
                  <td className="py-0.5 text-right tabular-nums">{formatCurrency(group.net)}</td>
                </tr>
                {/* "zzgl. 0 % USt. 0,00 €" carries no information. Keyed on the
                    RATE, not on the amount: a 19 % position small enough to
                    round its tax to 0,00 € must still show the line it was taxed
                    under. The 0 % net line stays, so the bases still add up to
                    Gesamt netto. */}
                {group.rate > 0 && (
                  <tr>
                    <th scope="row" className="py-0.5 pr-6 text-left font-normal text-slate-500">
                      zzgl. {formatQuantity(group.rate)} % USt.
                    </th>
                    <td className="py-0.5 text-right tabular-nums">{formatCurrency(group.vat)}</td>
                  </tr>
                )}
              </Fragment>
            ))}
          <tr className="border-t border-black/15">
            <th scope="row" className="py-1 pr-6 text-left font-normal text-slate-500">
              Gesamt netto
            </th>
            <td className="py-1 text-right tabular-nums">{formatCurrency(totals.netTotal)}</td>
          </tr>
          <tr className="border-t-2 border-slate-900">
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
