import Link from 'next/link'

export default function AdminNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="mb-2 font-mono text-sm text-slate-400">404</p>
      <h1 className="mb-3 text-xl font-semibold">Seite nicht gefunden</h1>
      <p className="mb-8 text-sm text-slate-500">
        Diese Seite existiert in der Verwaltung nicht.
      </p>
      <Link
        href="/admin"
        className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-500/50 hover:text-blue-600"
      >
        Zur Verwaltung
      </Link>
    </main>
  )
}
