'use client'

import { EditableField } from './EditableField.tsx'
import { ItemsTable } from './ItemsTable.tsx'
import { TotalsBlock } from './TotalsBlock.tsx'
import type { InvoiceItemInput, InvoiceTotals } from '@/lib/invoice/totals.ts'
import type { InvoiceDraft } from '@/lib/invoice/types.ts'
// Only the invoice-visible half of the master data reaches this component.
import type { MasterDataInvoiceVisible } from '@/lib/db/masterData.ts'

export function InvoiceSheet({
  invoice,
  sender,
  totals,
  readOnly,
  onChange,
}: {
  invoice: InvoiceDraft
  sender: MasterDataInvoiceVisible
  totals: InvoiceTotals
  readOnly: boolean
  onChange: (next: InvoiceDraft) => void
}) {
  function set<K extends keyof InvoiceDraft>(key: K, value: InvoiceDraft[K]) {
    onChange({ ...invoice, [key]: value })
  }

  function setItems(items: InvoiceItemInput[]) {
    onChange({ ...invoice, items })
  }

  const metaRow = 'flex gap-2'
  const metaLabel = 'w-40 shrink-0 text-slate-500'

  return (
    <article className="admin-sheet mx-auto my-8 text-sm">
      <header className="flex items-start justify-between">
        <div className="leading-relaxed">
          <p className="font-semibold">{sender.name}</p>
          <p>{sender.statusLabel}</p>
          <p>{sender.street}</p>
          <p>{sender.zipCity}</p>
          <p>{sender.country}</p>
        </div>
        <h2 className="admin-accent text-2xl font-bold tracking-[0.2em]">RECHNUNG</h2>
      </header>

      <section className="mt-12 leading-relaxed">
        <EditableField
          ariaLabel="Kundenname"
          placeholder="Kundenname"
          value={invoice.customerName}
          readOnly={readOnly}
          onChange={(v) => set('customerName', v)}
        />
        <EditableField
          ariaLabel="Kundenstraße"
          placeholder="Straße und Hausnummer"
          value={invoice.customerStreet}
          readOnly={readOnly}
          onChange={(v) => set('customerStreet', v)}
        />
        <EditableField
          ariaLabel="Kunden-PLZ und Ort"
          placeholder="PLZ und Ort"
          value={invoice.customerZipCity}
          readOnly={readOnly}
          onChange={(v) => set('customerZipCity', v)}
        />
        <EditableField
          ariaLabel="Kundenland"
          placeholder="Land"
          value={invoice.customerCountry}
          readOnly={readOnly}
          onChange={(v) => set('customerCountry', v)}
        />
        <div className="admin-optional">
          <EditableField
            ariaLabel="USt-IdNr. des Kunden"
            placeholder="USt-IdNr. des Kunden (optional)"
            value={invoice.customerVatId}
            readOnly={readOnly}
            onChange={(v) => set('customerVatId', v)}
          />
        </div>
      </section>

      <section className="mt-10 flex flex-col gap-1">
        <div className={metaRow}>
          <span className={metaLabel}>Rechnungsnummer</span>
          {invoice.status === 'issued' ? (
            <span>{invoice.invoiceNumber}</span>
          ) : (
            <EditableField
              ariaLabel="Rechnungsnummer"
              value={invoice.proposedNumber}
              readOnly={readOnly}
              onChange={(v) => set('proposedNumber', v)}
            />
          )}
        </div>
        <div className={metaRow}>
          <span className={metaLabel}>Rechnungsdatum</span>
          <EditableField
            ariaLabel="Rechnungsdatum"
            type="date"
            value={invoice.invoiceDate}
            readOnly={readOnly}
            onChange={(v) => set('invoiceDate', v)}
          />
        </div>
        <div className={metaRow}>
          <span className={metaLabel}>Leistungszeitraum</span>
          <EditableField
            ariaLabel="Leistungsdatum oder Leistungszeitraum"
            placeholder="z. B. 01.07.2026 – 31.07.2026"
            value={invoice.serviceDate}
            readOnly={readOnly}
            onChange={(v) => set('serviceDate', v)}
          />
        </div>
        <div className={`${metaRow} admin-optional`}>
          <span className={metaLabel}>Kundennummer</span>
          <EditableField
            ariaLabel="Kundennummer"
            placeholder="optional"
            value={invoice.customerNumber}
            readOnly={readOnly}
            onChange={(v) => set('customerNumber', v)}
          />
        </div>
      </section>

      <ItemsTable
        items={invoice.items}
        lineNets={totals.lineNets}
        defaultVatRate={sender.defaultVatRate}
        readOnly={readOnly}
        onChange={setItems}
      />

      <TotalsBlock totals={totals} />

      <section className="mt-10 flex justify-between gap-8">
        <div className="w-1/2">
          <p className="mb-1 font-semibold">Zahlungsbedingungen</p>
          <EditableField
            ariaLabel="Zahlungsbedingungen"
            multiline
            value={invoice.paymentTerms}
            readOnly={readOnly}
            onChange={(v) => set('paymentTerms', v)}
          />
        </div>
        <div className="w-1/2 leading-relaxed">
          <p className="mb-1 font-semibold">Bankverbindung</p>
          <p>{sender.accountHolder}</p>
          <p>IBAN: {sender.iban}</p>
          <p>{sender.bankName}</p>
          {sender.bic && <p>BIC: {sender.bic}</p>}
        </div>
      </section>

      <footer className="mt-12 border-t border-black/10 pt-3 text-xs leading-relaxed text-slate-500">
        <p>
          {sender.name} · {sender.street} · {sender.zipCity}
        </p>
        <p>
          Steuernummer: {sender.taxNumber} · USt-IdNr.: {sender.vatId} · {sender.taxOffice}
        </p>
        <p>
          {sender.phone} · {sender.email} · {sender.website}
        </p>
      </footer>
    </article>
  )
}
