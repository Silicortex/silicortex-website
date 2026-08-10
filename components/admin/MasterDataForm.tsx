'use client'

import { useState } from 'react'
import type {
  MasterData,
  MasterDataInternal,
  MasterDataInvoiceVisible,
} from '@/lib/db/masterData.ts'
import { saveMasterDataAction } from '@/app/admin/(protected)/actions.ts'
import { parseNum } from '@/lib/invoice/parseNum.ts'

type TextKey = Exclude<keyof MasterDataInvoiceVisible, 'defaultVatRate' | 'paymentTermsDays'>

const VISIBLE_FIELDS: { key: TextKey; label: string }[] = [
  { key: 'name', label: 'Name / Firmenbezeichnung' },
  { key: 'statusLabel', label: 'Status' },
  { key: 'activity', label: 'Tätigkeit' },
  { key: 'street', label: 'Straße und Hausnummer' },
  { key: 'zipCity', label: 'PLZ und Ort' },
  { key: 'country', label: 'Land' },
  { key: 'phone', label: 'Telefon' },
  { key: 'email', label: 'E-Mail' },
  { key: 'website', label: 'Website' },
  { key: 'taxNumber', label: 'Steuernummer' },
  { key: 'vatId', label: 'USt-IdNr. (§ 27a UStG)' },
  { key: 'taxOffice', label: 'Finanzamt' },
]

const BANK_FIELDS: { key: TextKey; label: string }[] = [
  { key: 'accountHolder', label: 'Kontoinhaber' },
  { key: 'iban', label: 'IBAN' },
  { key: 'bankName', label: 'Bank' },
  { key: 'bic', label: 'BIC' },
]

const INTERNAL_FIELDS: { key: keyof MasterDataInternal; label: string }[] = [
  { key: 'businessId', label: 'Wirtschafts-IdNr.' },
  { key: 'personalTaxId', label: 'Steuer-IdNr.' },
  { key: 'socialSecurityNo', label: 'Sozialversicherungsnummer' },
  { key: 'birthDate', label: 'Geburtsdatum' },
  { key: 'activityStart', label: 'Beginn der Tätigkeit' },
  { key: 'vatScheme', label: 'Umsatzsteuer-Regelung' },
  { key: 'taxationType', label: 'Besteuerungsart' },
  { key: 'profitDetermination', label: 'Gewinnermittlung' },
]

export function MasterDataForm({
  masterData,
  onChange,
}: {
  masterData: MasterData
  onChange: (next: MasterData) => void
}) {
  const [status, setStatus] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  // Raw text for the two numeric fields while they are being typed.
  const [rawVatRate, setRawVatRate] = useState<string | null>(null)
  const [rawTermsDays, setRawTermsDays] = useState<string | null>(null)

  function setVisible(key: TextKey, value: string) {
    onChange({
      ...masterData,
      invoiceVisible: { ...masterData.invoiceVisible, [key]: value },
    })
  }

  function setInternal(key: keyof MasterDataInternal, value: string) {
    onChange({ ...masterData, internal: { ...masterData.internal, [key]: value } })
  }

  async function save() {
    setSaving(true)
    setStatus(null)
    try {
      const result = await saveMasterDataAction(masterData)
      setStatus(result.ok ? 'Gespeichert.' : (result.error ?? 'Fehler.'))
    } catch {
      // A transport-level failure (dropped connection, function timeout) rejects
      // the action call itself. Without this catch the rejection is unhandled,
      // `saving` stays true, the button sits on "Speichere …" forever, and the
      // only escape — reloading — discards everything the owner just typed into
      // 26 fields.
      setStatus('Speichern fehlgeschlagen. Bitte Verbindung prüfen und erneut versuchen.')
    } finally {
      setSaving(false)
    }
  }

  const row = 'flex flex-col gap-1 sm:flex-row sm:items-center'
  const labelCls = 'w-72 shrink-0 text-sm text-slate-600'
  const inputCls =
    'w-full rounded-lg border border-black/8 bg-white px-2.5 py-1.5 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25'

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h2 className="admin-accent mb-6 text-lg font-semibold">Stammdaten</h2>

      <fieldset className="mb-6 flex flex-col gap-3 rounded-2xl border border-black/8 bg-white/85 p-5 shadow-sm shadow-slate-950/5 backdrop-blur-sm">
        <legend className="px-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Angaben auf der Rechnung</legend>
        {VISIBLE_FIELDS.map((f) => (
          <div key={f.key} className={row}>
            <label className={labelCls} htmlFor={`md-${f.key}`}>{f.label}</label>
            <input
              id={`md-${f.key}`}
              className={inputCls}
              value={masterData.invoiceVisible[f.key]}
              onChange={(e) => setVisible(f.key, e.target.value)}
            />
          </div>
        ))}
        <div className={row}>
          <label className={labelCls} htmlFor="md-vatRate">Standard-Steuersatz (%)</label>
          {/* Raw text is held while typing, so an in-progress "7," is not
              re-rendered as "7" — which would make a decimal rate impossible to
              enter one keystroke at a time. parseNum accepts both "7,7" and
              "7.7". The raw draft is dropped on blur. */}
          <input
            id="md-vatRate"
            className={inputCls}
            inputMode="decimal"
            value={rawVatRate ?? String(masterData.invoiceVisible.defaultVatRate)}
            onChange={(e) => {
              setRawVatRate(e.target.value)
              onChange({
                ...masterData,
                invoiceVisible: {
                  ...masterData.invoiceVisible,
                  defaultVatRate: parseNum(e.target.value),
                },
              })
            }}
            onBlur={() => setRawVatRate(null)}
          />
        </div>
        <div className={row}>
          <label className={labelCls} htmlFor="md-terms">Zahlungsziel (Tage)</label>
          <input
            id="md-terms"
            className={inputCls}
            inputMode="numeric"
            value={rawTermsDays ?? String(masterData.invoiceVisible.paymentTermsDays)}
            onChange={(e) => {
              setRawTermsDays(e.target.value)
              onChange({
                ...masterData,
                invoiceVisible: {
                  ...masterData.invoiceVisible,
                  // Days are whole numbers; never negative.
                  paymentTermsDays: Math.max(0, Math.trunc(parseNum(e.target.value))),
                },
              })
            }}
            onBlur={() => setRawTermsDays(null)}
          />
        </div>
      </fieldset>

      <fieldset className="mb-6 flex flex-col gap-3 rounded-2xl border border-black/8 bg-white/85 p-5 shadow-sm shadow-slate-950/5 backdrop-blur-sm">
        <legend className="px-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Bankverbindung</legend>
        {BANK_FIELDS.map((f) => (
          <div key={f.key} className={row}>
            <label className={labelCls} htmlFor={`md-${f.key}`}>{f.label}</label>
            <input
              id={`md-${f.key}`}
              className={inputCls}
              value={masterData.invoiceVisible[f.key]}
              onChange={(e) => setVisible(f.key, e.target.value)}
            />
          </div>
        ))}
      </fieldset>

      <fieldset className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-300/70 bg-amber-50/90 p-5">
        <legend className="flex items-center gap-2 px-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-700">
          Nur zur Ablage — erscheint nie auf einer Rechnung
          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-900">
            intern
          </span>
        </legend>
        {INTERNAL_FIELDS.map((f) => (
          <div key={f.key} className={row}>
            <label className={labelCls} htmlFor={`md-${f.key}`}>{f.label}</label>
            <input
              id={`md-${f.key}`}
              className={inputCls}
              value={masterData.internal[f.key]}
              onChange={(e) => setInternal(f.key, e.target.value)}
            />
          </div>
        ))}
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-500 disabled:opacity-60"
        >
          {saving ? 'Speichere …' : 'Stammdaten speichern'}
        </button>
        {status && <span className="text-sm text-slate-600">{status}</span>}
      </div>
    </div>
  )
}
