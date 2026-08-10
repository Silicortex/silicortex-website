import type { Metadata } from 'next'
import './admin.css'

export const metadata: Metadata = {
  title: 'Verwaltung',
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-root">{children}</div>
}
