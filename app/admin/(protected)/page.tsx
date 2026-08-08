import { requireSession } from '@/lib/admin/session.ts'
import { loadMasterData } from '@/lib/db/masterData.ts'
import { AdminApp } from '@/components/admin/AdminApp.tsx'

export default async function AdminHomePage() {
  await requireSession()
  const masterData = await loadMasterData()
  return <AdminApp masterData={masterData} />
}
