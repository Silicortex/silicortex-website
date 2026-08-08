'use client'

import { useState } from 'react'
import type { MasterData } from '@/lib/db/masterData.ts'
import { MasterDataForm } from './MasterDataForm.tsx'

type Tab = 'invoice' | 'archive' | 'master'

const TABS: { id: Tab; label: string }[] = [
  { id: 'invoice', label: 'Rechnung erstellen' },
  { id: 'archive', label: 'Meine Rechnungen' },
  { id: 'master', label: 'Stammdaten' },
]

export function AdminApp({ masterData: initial }: { masterData: MasterData }) {
  const [tab, setTab] = useState<Tab>('invoice')
  const [masterData, setMasterData] = useState(initial)

  return (
    <>
      <nav className="admin-no-print flex gap-1 border-b border-gray-200 bg-white px-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={
              tab === t.id
                ? 'border-b-2 border-[#1f5f4f] px-4 py-3 text-sm font-semibold text-[#1f5f4f]'
                : 'px-4 py-3 text-sm text-gray-500'
            }
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'master' && (
        <MasterDataForm masterData={masterData} onChange={setMasterData} />
      )}
      {tab !== 'master' && (
        <p className="p-6 text-sm text-gray-500">Wird in einem späteren Schritt ergänzt.</p>
      )}
    </>
  )
}
