import { requireSession } from '@/lib/admin/session.ts'
import { loadMasterData } from '@/lib/db/masterData.ts'
import { highestIssuedNumber, listInvoices } from '@/lib/db/invoices.ts'
import { nextInvoiceNumber } from '@/lib/invoice/numbering.ts'
import { AdminApp } from '@/components/admin/AdminApp.tsx'

export default async function AdminHomePage() {
  await requireSession()
  const [masterData, invoices, highest] = await Promise.all([
    loadMasterData(),
    listInvoices(),
    highestIssuedNumber(),
  ])
  return (
    <AdminApp
      masterData={masterData}
      invoices={invoices}
      nextNumber={nextInvoiceNumber(highest, new Date().getFullYear())}
    />
  )
}
