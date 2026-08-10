import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/admin/session.ts'
import { LoginForm } from './LoginForm.tsx'

export default async function LoginPage() {
  // Already signed in? Don't show a form the visitor is past.
  if (await verifySession()) redirect('/admin')
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-black/8 bg-white/85 p-8 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
          <p className="mb-6 flex items-baseline gap-2.5">
            <span className="text-base font-bold tracking-tight text-slate-900">
              Sili<span className="text-[#5dcfd6]">cortex</span>
            </span>
            <span className="rounded-full border border-blue-600/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
              Verwaltung
            </span>
          </p>
          <h1 className="mb-1 text-lg font-semibold text-slate-900">Anmelden</h1>
          <p className="mb-6 text-sm text-slate-500">Bitte Passwort eingeben.</p>
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Interner Bereich · kein öffentlicher Zugang
        </p>
      </div>
    </main>
  )
}
