import { requireSession } from '@/lib/admin/session.ts'
import { createBackup, listInvoicesForExport } from '@/lib/db/backup.ts'
import { exportFileName, invoicesCsv } from '@/lib/invoice/export.ts'
import { todayIso } from '@/lib/invoice/format.ts'

/** Downloads the backup or the CSV.
 *
 *  A Route Handler rather than a Server Action: an action returns a value to the
 *  client, while this has to arrive as a file with a Content-Disposition, which
 *  only a real response can do.
 *
 *  The session check is the FIRST statement and outside any try/catch, exactly as
 *  in the actions: `redirect()` works by throwing, so a catch would swallow it and
 *  the request would continue unauthenticated — and this route hands out the IBAN
 *  and every tax identifier in one file. */
export async function GET(request: Request): Promise<Response> {
  await requireSession()

  const format = new URL(request.url).searchParams.get('format') === 'csv' ? 'csv' : 'json'
  const date = todayIso() // the German calendar date, so successive backups sort

  if (format === 'csv') {
    return new Response(invoicesCsv(await listInvoicesForExport()), {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${exportFileName('rechnungen', date)}"`,
        // Nothing about an export may be cached: it is a snapshot of live data
        // behind a login.
        'cache-control': 'no-store',
      },
    })
  }

  return new Response(JSON.stringify(await createBackup(), null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="${exportFileName('backup', date)}"`,
      'cache-control': 'no-store',
    },
  })
}
