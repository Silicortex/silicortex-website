import { requireSession } from '@/lib/admin/session.ts'
import { logoutAction } from './actions.ts'

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSession()

  return (
    <>
      <header className="admin-no-print sticky top-0 z-20 border-b border-black/8 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <span className="flex items-baseline gap-2.5">
            <span className="text-sm font-bold tracking-tight text-slate-900">
              Sili<span className="text-[#5dcfd6]">cortex</span>
            </span>
            <span className="rounded-full border border-blue-600/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
              Verwaltung
            </span>
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900"
            >
              Abmelden
            </button>
          </form>
        </div>
      </header>
      {children}
    </>
  )
}
