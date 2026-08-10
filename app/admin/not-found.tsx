import Link from 'next/link'

export default function AdminNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="mb-2 font-mono text-sm text-gray-400">404</p>
      <h1 className="mb-3 text-xl font-semibold">Seite nicht gefunden</h1>
      <p className="mb-8 text-sm text-gray-500">
        Diese Seite existiert in der Verwaltung nicht.
      </p>
      <Link
        href="/admin"
        className="rounded border border-[#1f5f4f] px-4 py-2 text-sm font-medium text-[#1f5f4f]"
      >
        Zur Verwaltung
      </Link>
    </main>
  )
}
