'use client'

import { useState } from 'react'
import { findGaps, nextNumber, RANGES, type RangePrefix } from '@/lib/invoice/numbering.ts'
import { InfoHint } from './InfoHint.tsx'

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
      <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        Nummernkreise
        <InfoHint hint="Je Dokumentart ein eigener Zähler: RE- für Rechnungen, ST- für Stornorechnungen, AN- für Angebote. Getrennte Kreise sind zulässig, und jeder beginnt am 1. Januar wieder bei 001." />
      </h3>
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
            <th className="py-1 font-normal">
              <span className="inline-flex items-center gap-1">
                Lücken
                <InfoHint hint="Fehlende Nummern innerhalb der bereits benutzten Spanne. Rechtlich zulässig — eine lückenlose Folge ist nicht vorgeschrieben —, bei einer Betriebsprüfung gilt eine fehlende Nummer aber als Hinweis auf nicht erfasste Einnahmen und muss erklärbar sein." />
              </span>
            </th>
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

      <h3 className="mt-10 flex items-center gap-2 text-base font-semibold text-slate-900">
        Vergebene Nummern
        <InfoHint hint="Das dauerhafte Verzeichnis aller je vergebenen Nummern. Ein Eintrag lässt sich weder ändern noch löschen, auch nicht wenn das Dokument dazu verschwindet — nur so ist sichergestellt, dass eine Nummer nie zweimal vergeben wird." />
      </h3>
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

      <h3 className="mt-10 flex items-center gap-2 text-base font-semibold text-slate-900">
        Sicherung
        <InfoHint hint="Die JSON-Datei enthält alles und lässt sich in eine leere Datenbank zurückspielen. Die CSV-Datei ist eine Liste zum Buchen und enthält keine Angebote. Am besten nach jeder Rechnung herunterladen und außerhalb dieser Anwendung ablegen." />
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Rechnungen sind zehn Jahre aufzubewahren (§ 147 AO). Die Sicherung enthält
        alle Rechnungen, Positionen, vergebenen Nummern und die Stammdaten und
        lässt sich in eine leere Datenbank zurückspielen. <strong>Sie enthält
        personenbezogene Daten</strong> (IBAN, Steuernummer, Steuer-IdNr.,
        Sozialversicherungsnummer, Geburtsdatum) — bitte sicher und niemals in
        einem öffentlichen Repository ablegen.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {/* Plain links, not fetch(): the browser handles a Content-Disposition
            download itself, and a blob round-trip would only add a way to fail. */}
        <a
          href="/admin/export?format=json"
          download
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-500"
        >
          Sicherung herunterladen (JSON)
        </a>
        <a
          href="/admin/export?format=csv"
          download
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-500/50 hover:text-blue-600"
        >
          Rechnungsliste für den Steuerberater (CSV)
        </a>
      </div>

      <h3 className="mt-10 flex items-center gap-2 text-base font-semibold text-slate-900">
        Nummer ohne Rechnung verbrauchen
        <InfoHint hint="Vermerkt eine Nummer als vergeben, obwohl kein Dokument dazu existiert — etwa nach einem Testlauf. Der Grund ist Pflicht, denn genau er erklärt die Lücke später. Danach ist die Nummer dauerhaft blockiert." />
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
