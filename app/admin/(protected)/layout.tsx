import { requireSession } from '@/lib/admin/session.ts'
import { logoutAction } from './actions.ts'

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSession()

  return (
    <>
      <header className="admin-no-print flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <span className="admin-accent font-semibold">Silicortex Verwaltung</span>
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-gray-500 underline">
            Abmelden
          </button>
        </form>
      </header>
      {children}
    </>
  )
}
