import 'server-only'
import { sql } from './client.ts'

export type MasterDataInvoiceVisible = {
  name: string
  statusLabel: string
  activity: string
  street: string
  zipCity: string
  country: string
  phone: string
  email: string
  website: string
  taxNumber: string
  vatId: string
  taxOffice: string
  defaultVatRate: number
  paymentTermsDays: number
  accountHolder: string
  iban: string
  bankName: string
  bic: string
}

// "Nur zur Ablage" — must never appear on an invoice or in print output.
export type MasterDataInternal = {
  businessId: string
  personalTaxId: string
  socialSecurityNo: string
  birthDate: string
  activityStart: string
  vatScheme: string
  taxationType: string
  profitDetermination: string
}

export type MasterData = {
  invoiceVisible: MasterDataInvoiceVisible
  internal: MasterDataInternal
}

export async function loadMasterData(): Promise<MasterData> {
  const rows = await sql`select * from master_data where id = 1`
  const r = rows[0]
  if (!r) throw new Error('master_data row 1 is missing — run npm run db:migrate')

  return {
    invoiceVisible: {
      name: r.name,
      statusLabel: r.status_label,
      activity: r.activity,
      street: r.street,
      zipCity: r.zip_city,
      country: r.country,
      phone: r.phone,
      email: r.email,
      website: r.website,
      taxNumber: r.tax_number,
      vatId: r.vat_id,
      taxOffice: r.tax_office,
      // numeric columns arrive as strings from the driver
      defaultVatRate: Number(r.default_vat_rate),
      paymentTermsDays: Number(r.payment_terms_days),
      accountHolder: r.account_holder,
      iban: r.iban,
      bankName: r.bank_name,
      bic: r.bic,
    },
    internal: {
      businessId: r.business_id,
      personalTaxId: r.personal_tax_id,
      socialSecurityNo: r.social_security_no,
      birthDate: r.birth_date,
      activityStart: r.activity_start,
      vatScheme: r.vat_scheme,
      taxationType: r.taxation_type,
      profitDetermination: r.profit_determination,
    },
  }
}

export async function saveMasterData(data: MasterData): Promise<void> {
  const v = data.invoiceVisible
  const i = data.internal
  await sql`
    update master_data set
      name = ${v.name},
      status_label = ${v.statusLabel},
      activity = ${v.activity},
      street = ${v.street},
      zip_city = ${v.zipCity},
      country = ${v.country},
      phone = ${v.phone},
      email = ${v.email},
      website = ${v.website},
      tax_number = ${v.taxNumber},
      vat_id = ${v.vatId},
      tax_office = ${v.taxOffice},
      default_vat_rate = ${v.defaultVatRate},
      payment_terms_days = ${v.paymentTermsDays},
      account_holder = ${v.accountHolder},
      iban = ${v.iban},
      bank_name = ${v.bankName},
      bic = ${v.bic},
      business_id = ${i.businessId},
      personal_tax_id = ${i.personalTaxId},
      social_security_no = ${i.socialSecurityNo},
      birth_date = ${i.birthDate},
      activity_start = ${i.activityStart},
      vat_scheme = ${i.vatScheme},
      taxation_type = ${i.taxationType},
      profit_determination = ${i.profitDetermination},
      updated_at = now()
    where id = 1
  `
}
