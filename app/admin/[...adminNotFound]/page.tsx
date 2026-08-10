import { notFound } from 'next/navigation'

// An unmatched URL renders the ROOT not-found page, which carries the marketing
// chrome by design (Task 19). This catch-all exists so that /admin/* misses
// throw into the admin-scoped not-found boundary instead, keeping the admin
// area free of the site navbar and footer. A segment-level not-found.tsx alone
// does not achieve this — unmatched paths never reach it.
export default function AdminCatchAll() {
  notFound()
}
