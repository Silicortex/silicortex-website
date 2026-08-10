'use client'

import { useState } from 'react'
import { findGaps, nextNumber, RANGES, type RangePrefix } from '@/lib/invoice/numbering.ts'

export type JournalEntry = {
  number: string
  invoiceId: string | null
  reason: string
  createdAt: string
}

/** The number journal, surfaced because a gap nobody can explain is what invites
 *  a Schätzung. The software never closes a gap — § 14 does not require a gapless
 *  run (UStAE 14.5 Abs. 10) — it only makes gaps visible and lets the owner
 *  record why one exists. */
export function NumberJournal({
  journal,
  year,
  onBurn,
}: {
  journal: JournalEntry[]
  year: number
  onBurn: (number: string, reason: string) => Promise<void>
}) {
  const [number, setNumber] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  const numbers = journal.map((entry) => entry.number)
  const prefixes = Object.keys(RANGES) as RangePrefix[]

  async function burn() {
    setBusy(true)
    await onBurn(number, reason)
    setBusy(false)
    setNumber('')
    setReason('')
  }

  return (
    <section className="admin-no-print mx-auto mt-12 max-w-[840px] px-6">
      <h3 className="text-base font-semibold text-slate-900">Nummernkreise</h3>
      <p className="mt-1 text-sm text-slate-500">
        Jeder Kreis zählt unabhängig und beginnt am 1. Januar wieder bei 001. Eine
        Nummer wird nie zweimal vergeben; Lücken sind zulässig, sollten aber einen
        Grund haben.
      </p>

      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="py-1 font-normal">Kreis</th>
            <th className="py-1 font-normal">Nächste Nummer</th>
            <th className="py-1 font-normal">Vergeben {year}</th>
            <th className="py-1 font-normal">Lücken</th>
          </tr>
        </thead>
        <tbody>
          {prefixes.map((prefix) => {
            const gaps = findGaps(prefix, year, numbers)
            return (
              <tr key={prefix} className="border-b border-black/5">
                <td className="py-1.5">
                  {prefix}- <span className="text-slate-500">{RANGES[prefix]}</span>
                </td>
                <td className="py-1.5 tabular-nums">{nextNumber(prefix, year, numbers)}</td>
                <td className="py-1.5 tabular-nums">
                  {numbers.filter((n) => n.startsWith(`${prefix}-${year}-`)).length}
                </td>
                <td className="py-1.5 tabular-nums">
                  {gaps.length === 0 ? (
                    <span className="text-slate-400">keine</span>
                  ) : (
                    <span className="text-amber-700">{gaps.join(', ')}</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <h3 className="mt-10 text-base font-semibold text-slate-900">Vergebene Nummern</h3>
      {journal.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Noch keine Nummer vergeben.</p>
      ) : (
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="py-1 font-normal">Nummer</th>
              <th className="py-1 font-normal">Datum</th>
              <th className="py-1 font-normal">Verwendung</th>
            </tr>
          </thead>
          <tbody>
            {journal.map((entry) => (
              <tr key={entry.number} className="border-b border-black/5">
                <td className="py-1.5 tabular-nums">{entry.number}</td>
                <td className="py-1.5 tabular-nums">{entry.createdAt}</td>
                <td className="py-1.5">
                  {entry.invoiceId ? (
                    <span className="text-slate-500">Rechnung</span>
                  ) : (
                    // The case the log exists for: a number used up with no
                    // document behind it, and the reason it was used up.
                    <span className="text-amber-700">Ohne Rechnung — {entry.reason}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 className="mt-10 text-base font-semibold text-slate-900">
        Nummer ohne Rechnung verbrauchen
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Für einen verworfenen Entwurf, einen Testlauf oder eine vor dem Versand
        abgebrochene Rechnung. Die Nummer ist danach dauerhaft vergeben.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          aria-label="Zu verbrauchende Nummer"
          className="admin-field w-44"
          placeholder="RE-2026-002"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <input
          aria-label="Grund"
          className="admin-field flex-1"
          placeholder="Grund, z. B. Entwurf verworfen"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button
          type="button"
          disabled={busy || !number.trim() || !reason.trim()}
          onClick={burn}
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-500/50 hover:text-blue-600 disabled:opacity-60"
        >
          {busy ? 'Speichere …' : 'Nummer verbrauchen'}
        </button>
      </div>
    </section>
  )
}
