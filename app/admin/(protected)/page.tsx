import { requireSession } from '@/lib/admin/session.ts'
import { loadMasterData } from '@/lib/db/masterData.ts'
import { nextInvoiceNumber } from '@/lib/invoice/numbering.ts'
import { AdminApp } from '@/components/admin/AdminApp.tsx'

export default async function AdminHomePage() {
  await requireSession()
  const masterData = await loadMasterData()
  const nextNumber = nextInvoiceNumber(null, new Date().getFullYear())
  return <AdminApp masterData={masterData} nextNumber={nextNumber} />
}
