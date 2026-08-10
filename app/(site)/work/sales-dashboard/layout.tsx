import Link from "next/link"

export default function SalesDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-x-0 top-16 z-40 border-b border-black/5 bg-white/90 backdrop-blur-md dark:border-white/5 dark:bg-slate-950/90">
        <div className="mx-auto flex h-10 max-w-7xl items-center gap-2 px-4 sm:px-6">
          <Link
            href="/work"
            className="flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Work
          </Link>
          <span className="text-xs text-slate-400 dark:text-slate-600">/</span>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Sales Dashboard</span>
        </div>
      </div>
      <div className="pt-[6.5rem]">{children}</div>
    </>
  )
}
