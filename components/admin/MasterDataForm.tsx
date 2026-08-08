'use client'

import { useState } from 'react'
import type {
  MasterData,
  MasterDataInternal,
  MasterDataInvoiceVisible,
} from '@/lib/db/masterData.ts'
import { saveMasterDataAction } from '@/app/admin/(protected)/actions.ts'

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
    const result = await saveMasterDataAction(masterData)
    setSaving(false)
    setStatus(result.ok ? 'Gespeichert.' : (result.error ?? 'Fehler.'))
  }

  const row = 'flex flex-col gap-1 sm:flex-row sm:items-center'
  const labelCls = 'w-72 shrink-0 text-sm text-gray-600'
  const inputCls = 'w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm'

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h2 className="admin-accent mb-6 text-lg font-semibold">Stammdaten</h2>

      <fieldset className="mb-8 flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold">Angaben auf der Rechnung</legend>
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
          <input
            id="md-vatRate"
            className={inputCls}
            inputMode="decimal"
            value={String(masterData.invoiceVisible.defaultVatRate)}
            onChange={(e) =>
              onChange({
                ...masterData,
                invoiceVisible: {
                  ...masterData.invoiceVisible,
                  defaultVatRate: Number(e.target.value.replace(',', '.')) || 0,
                },
              })
            }
          />
        </div>
        <div className={row}>
          <label className={labelCls} htmlFor="md-terms">Zahlungsziel (Tage)</label>
          <input
            id="md-terms"
            className={inputCls}
            inputMode="numeric"
            value={String(masterData.invoiceVisible.paymentTermsDays)}
            onChange={(e) =>
              onChange({
                ...masterData,
                invoiceVisible: {
                  ...masterData.invoiceVisible,
                  paymentTermsDays: parseInt(e.target.value, 10) || 0,
                },
              })
            }
          />
        </div>
      </fieldset>

      <fieldset className="mb-8 flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold">Bankverbindung</legend>
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

      <fieldset className="mb-8 flex flex-col gap-3 rounded border border-amber-300 bg-amber-50 p-4">
        <legend className="flex items-center gap-2 text-sm font-semibold">
          Nur zur Ablage — erscheint nie auf einer Rechnung
          <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-900">
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
          className="rounded bg-[#1f5f4f] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? 'Speichere …' : 'Stammdaten speichern'}
        </button>
        {status && <span className="text-sm text-gray-600">{status}</span>}
      </div>
    </div>
  )
}
