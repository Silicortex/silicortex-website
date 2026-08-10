import { requireSession } from '@/lib/admin/session.ts'
import { loadMasterData } from '@/lib/db/masterData.ts'
import { listEuSales, listInvoices, listNumberJournal, nextNumberFor } from '@/lib/db/invoices.ts'
import { todayIso } from '@/lib/invoice/format.ts'
import { AdminApp } from '@/components/admin/AdminApp.tsx'

export default async function AdminHomePage() {
  await requireSession()
  // The year comes from the German calendar date, not the host clock: Vercel
  // Functions run in UTC, so for the first hours after midnight in Germany
  // `new Date().getFullYear()` would still be the old year on 1 January — and
  // the counter restarts with the year.
  const year = Number(todayIso().slice(0, 4))
  const [masterData, invoices, nextNumber, journal, euSales] = await Promise.all([
    loadMasterData(),
    listInvoices(),
    nextNumberFor('RE', year),
    listNumberJournal(),
    listEuSales(),
  ])
  return (
    <AdminApp
      masterData={masterData}
      invoices={invoices}
      nextNumber={nextNumber}
      journal={journal}
      euSales={euSales}
    />
  )
}
