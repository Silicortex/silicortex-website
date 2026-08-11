'use client'

import { EditableField } from './EditableField.tsx'
import { ItemsTable } from './ItemsTable.tsx'
import { TotalsBlock } from './TotalsBlock.tsx'
import type { InvoiceItemInput, InvoiceTotals } from '@/lib/invoice/totals.ts'
import type { InvoiceDraft } from '@/lib/invoice/types.ts'
import { DOC_HEADINGS, stornoReference } from '@/lib/invoice/numbering.ts'
import { REVERSE_CHARGE_NOTE } from '@/lib/invoice/euVat.ts'
import { formatDateDe } from '@/lib/invoice/format.ts'
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
        {/* From the document TYPE, not inferred from a field. STORNORECHNUNG, never
            GUTSCHRIFT: under German VAT law a Gutschrift is self-billing by the
            customer and the word can trigger an unintended VAT liability. And an
            ANGEBOT must not be headed like an invoice — a client who books it as
            one pays for something not yet delivered. Tracking is tightened for the
            longer words, which do not fit the invoice heading's spacing. */}
        <h2
          className={
            invoice.docType === 'invoice'
              ? 'admin-accent shrink-0 text-2xl font-bold tracking-[0.2em]'
              : 'admin-accent shrink-0 text-xl font-bold tracking-[0.12em]'
          }
        >
          {DOC_HEADINGS[invoice.docType]}
        </h2>
      </header>

      {/* Printed as well as shown: the reference is what connects this document
          to the invoice it reverses. The link is also stored as a field, so
          this line is presentation, not the record. */}
      {invoice.stornoFor && (
        <p className="mt-6 font-medium">
          {stornoReference(invoice.stornoFor, formatDateDe(invoice.stornoForDate))}
        </p>
      )}

      {/* Connects an invoice to the offer it was accepted from. Not required by
          anything — it is what lets the client match the two documents. */}
      {invoice.quoteRef && (
        <p className="mt-6 font-medium">
          Bezug: Angebot {invoice.quoteRef} vom {formatDateDe(invoice.quoteRefDate)}
        </p>
      )}

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
            placeholder={
              invoice.reverseCharge
                ? 'USt-IdNr. des Kunden (bei Reverse Charge zwingend)'
                : 'USt-IdNr. des Kunden (optional)'
            }
            value={invoice.customerVatId}
            readOnly={readOnly}
            onChange={(v) => set('customerVatId', v)}
            // A bare tax id under the address reads ambiguously on a document
            // going to a client, so print names it. The prefix is CONDITIONAL:
            // .admin-optional hides this row by matching an EMPTY print span,
            // so an unconditional label would print "USt-IdNr.:" with no value.
            printValue={
              invoice.customerVatId.trim() ? `USt-IdNr.: ${invoice.customerVatId}` : ''
            }
          />
        </div>
      </section>

      <section className="mt-10 flex flex-col gap-1">
        <div className={metaRow}>
          <span className={metaLabel}>
            {invoice.docType === 'quote' ? 'Angebotsnummer' : 'Rechnungsnummer'}
          </span>
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
          <span className={metaLabel}>
            {invoice.docType === 'quote' ? 'Angebotsdatum' : 'Rechnungsdatum'}
          </span>
          <EditableField
            ariaLabel="Rechnungsdatum"
            type="date"
            value={invoice.invoiceDate}
            readOnly={readOnly}
            onChange={(v) => set('invoiceDate', v)}
          />
        </div>
        {/* Optional-wrapped now that it is optional. It is a § 14 field an invoice
            always carries, but an Angebot describes what WOULD be done, not when it
            was — and an empty one would otherwise print a bare "Leistungszeitraum"
            label with nothing under it. */}
        <div className={`${metaRow} admin-optional`}>
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
        reverseCharge={invoice.reverseCharge}
        readOnly={readOnly}
        onChange={setItems}
      />

      <TotalsBlock totals={totals} reverseCharge={invoice.reverseCharge} />

      {/* Prints as well as shows. § 14a UStG requires an intra-EU invoice to
          INDICATE that the recipient owes the tax; without this line the invoice
          is formally defective. No statutory citation is printed — § 13b would be
          plainly wrong here (that is reverse charge on services RECEIVED in
          Germany) and even a correct cite is a liability on a document that does
          not need one. */}
      {invoice.reverseCharge && (
        <p className="mt-6 font-medium">{REVERSE_CHARGE_NOTE}</p>
      )}

      <section className="mt-10 flex justify-between gap-8">
        <div className="w-1/2">
          {/* Plain text, so it prints as-is in both media — an offer has nothing
              payable yet, so the same free-text block carries its validity. */}
          <p className="mb-1 font-semibold">
            {invoice.docType === 'quote' ? 'Gültigkeit' : 'Zahlungsbedingungen'}
          </p>
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
        {/* § 14 is satisfied by EITHER identifier, so only one is printed. The
            USt-IdNr. is preferred: the Steuernummer is tied to the personal tax
            file, and there is no reason to put it on every document that leaves
            the house. The Steuernummer appears only as a fallback, when no
            USt-IdNr. has been issued yet. */}
        <p>
          {sender.vatId
            ? `USt-IdNr.: ${sender.vatId}`
            : `Steuernummer: ${sender.taxNumber}`}
          {sender.taxOffice ? ` · ${sender.taxOffice}` : ''}
        </p>
        <p>
          {sender.phone} · {sender.email} · {sender.website}
        </p>
      </footer>
    </article>
  )
}
