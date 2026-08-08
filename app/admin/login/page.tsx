import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/admin/session.ts'
import { LoginForm } from './LoginForm.tsx'

export default async function LoginPage() {
  // Already signed in? Don't show a form the visitor is past.
  if (await verifySession()) redirect('/admin')
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <h1 className="admin-accent mb-1 text-xl font-semibold">Silicortex Verwaltung</h1>
      <p className="mb-6 text-sm text-gray-500">Bitte Passwort eingeben.</p>
      <LoginForm />
    </main>
  )
}
