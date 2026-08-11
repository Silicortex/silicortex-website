# Silicortex Website

This is a [Next.js](https://nextjs.org/) project bootstrapped with modern web and AI tools.

## ✨ Features

- **Modern UI/UX:** Responsive and accessible components using Tailwind CSS v4.
- **Dark Mode:** Seamless light and dark mode switching powered by `next-themes`.
- **Animations:** Smooth, high-performance animations using Framer Motion.
- **Data Visualization:** Interactive charts and graphs built with Recharts.
- **AI-Powered Capabilities:** Integration with Anthropic (Claude) for advanced AI workflows.
- **Performance Optimized:** Utilizing Next.js App Router and React 19 for optimal rendering and server components.
- **Typography:** Automatically optimized and loaded fonts using `next/font`.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [next-themes](https://github.com/pacocoursey/next-themes) (Dark/Light mode support)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Charts & Data Visualization:** [Recharts](https://recharts.org/)
- **AI Integrations:**
  - [@anthropic-ai/sdk](https://github.com/anthropics/anthropic-sdk-typescript) (Claude)

## 🎯 Live Demos & Example Work

To see an example of what we build, check out our interactive **AI-Powered Sales Dashboard**:

👉 **[CLICK HERE TO VIEW LIVE DEMO](http://localhost:3000/work/sales-dashboard)** 👈

- **Features:** A full-featured analytics dashboard with KPI tracking, revenue trend charts, order management, product rankings, and a simulated Claude-powered AI chatbot that answers natural-language questions about the data.

## 🛠 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or newer recommended)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository (if you haven't already):

   ```bash
   git clone <your-repo-url>
   cd silicortex-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env.local` file in the root directory and add any required API keys for the AI providers:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

_(Note: Do not commit your `.env.local` file to version control.)_

### Running the Development Server

```bash
npm run dev
```

Open http://localhost:3000 with your browser to see the result. You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 🧪 End-to-end tests and the isolated test database

The Playwright suite (`npm run test:e2e`) exercises the real admin app against a real
Postgres — including destructive operations: it temporarily disables the invoice
immutability triggers, deletes its own test rows, and overwrites the master data row.
**It must never run against the invoicing database.**

It therefore uses `E2E_DATABASE_URL`, a separate logical database (`e2e_tests`) on the
same Neon instance, created with:

```sql
CREATE DATABASE e2e_tests;  -- then apply db/schema.sql to it via db/migrate.mjs
```

and stored in `.env.local` as **`E2E_DATABASE_URL`** — the same connection string as
`DATABASE_URL` with the database name swapped to `e2e_tests`. Leave `DATABASE_URL`
itself pointing at the real database; `npm run dev` by hand must serve that one.
Apply the schema to the new database with
`DATABASE_URL="<the e2e url>" node db/migrate.mjs`.

The suite refuses to start if `E2E_DATABASE_URL` is missing or empty, rather than
falling back to `DATABASE_URL`. `playwright.config.ts` redirects `DATABASE_URL` to it for both the test
process and the dev server it launches, and `tests/e2e/guard.setup.ts` aborts any run
whose target database contains non-`E2E-` issued invoices or filled-in personal
identifiers — so even a missing env var cannot make the suite touch real data.

The suite never reuses a running dev server: one started by hand points at the real
database, so Playwright always starts its own.

## 📜 Available Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Builds the application for production deployment.
- `npm run start`: Runs the compiled production application.
- `npm run lint`: Analyzes the code using ESLint to find and fix problems.

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js. Check out the Next.js deployment documentation for more details.

## Invoice numbering

Numbers look like `RE-2026-001`: a document-type prefix, the four-digit year of
the invoice date, and a counter that restarts at 001 every 1 January.

| Prefix | Document |
|---|---|
| `RE-` | Rechnung |
| `ST-` | Stornorechnung |
| `AN-` | Angebot |

Each prefix is its own number range (Nummernkreis) with an independent counter.
Separate ranges are permitted for organisationally delimited areas, so per-type
and per-year ranges are safe. A range that passes 999 in one year widens to four
digits from the following January, never mid-year.

**Uniqueness is mandatory; gaplessness is not.** § 14 Abs. 4 Nr. 4 UStG requires a
number assigned *einmalig* — once, ever. UStAE 14.5 Abs. 10 is explicit that a
gapless run is not required: *"Eine lückenlose Abfolge der ausgestellten
Rechnungsnummern ist nicht zwingend."* Nothing renumbers, backfills, or refuses to
continue because a number is missing.

Uniqueness is enforced by `issued_numbers`, an append-only journal with the
number as its primary key and a trigger forbidding UPDATE and DELETE. It has no
foreign key to `invoices` on purpose: the journal must outlive the invoice, so a
number stays used even if its row is gone.

Because unexplained gaps have prompted Schätzungen, *Meine Rechnungen* shows each
range's next number, its gaps, and every number ever assigned. A number used up
without a document — a discarded draft, a test run, something cancelled before
sending — is recorded there with a mandatory reason.

A correction never edits or reuses a number. *Storno* on an issued invoice opens a
new document from the `ST-` range that references the original (`storno_for`), and
the original stays immutable. It is titled **Stornorechnung**, never *Gutschrift*:
under German VAT law a Gutschrift is self-billing by the customer, and using the
word for a cancellation can trigger an unintended VAT liability. Its amounts are
negated so it zeroes the original out in the books, and its payment terms default
to *"Bitte überweisen Sie keinen Betrag …"* rather than inheriting the original's.

Typing a number that jumps past the next free one warns first, naming the number
that would be skipped. Gaps stay legal and allowed — but at a Betriebsprüfung a
missing number is read as hidden revenue, so it is worth choosing them on purpose
rather than by mistyping.

Only ONE of Steuernummer / USt-IdNr. is printed, § 14 being satisfied by either.
The USt-IdNr. is preferred; the Steuernummer, which ties to the personal tax file,
appears only when no USt-IdNr. exists.

### PDF file name

`RE-2026-001_2026-08-10_Beispiel-GmbH_Silicortex.pdf` — invoice number, invoice
date, customer, company. The number comes first because it is the key the
Steuerberater references, and it stays one token: `RE-2026-001` is the legal
identifier under § 14 Abs. 4 Nr. 4 UStG, and splitting the prefix from the counter
across the date would also stop the files sorting by number. The date is ISO so it
sorts correctly and cannot be misread as an American date. The company segment is
the trading name (`COMPANY_FILE_NAME` in `lib/invoice/filename.ts`), not the legal
issuer name from Stammdaten, which appears on the invoice itself. Every segment is sanitised to
`[A-Za-z0-9-]`, umlauts transliterated the German way (`Müller` → `Mueller`), so
the name can never contain a path separator. `document.title` is set to this name
on `beforeprint`, because Chrome uses the title as the default name in its "Save
as PDF" dialog, and restored on `afterprint`.

## Intra-EU B2B (reverse charge)

For services to a business in another EU member state the recipient owes the VAT
in their own country. Tick **Reverse Charge (EU-Kunde)** on the invoice and it:

- rewrites every existing line to 0 %, locks the rate select, and starts newly
  added lines at 0 %;
- prints `Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge)`;
- drops the per-rate VAT rows, so `Gesamt netto` equals `Gesamtbetrag`.

No statutory paragraph is printed. § 14a UStG requires an *indication* that the
recipient owes the tax, not a citation — and § 13b would be plainly wrong here,
since that is reverse charge on services **received** in Germany.

`validateForPrint` is the guarantee, not the UI: issuing is refused unless every
line is 0 %, the customer's USt-IdNr. is present and belongs to an EU member state
other than Germany, and the sender's own USt-IdNr. is set (the Steuernummer alone
is not enough on an intra-EU invoice). Three separate UI paths keep the rate at
0 %; only one has to break to produce an invoice carrying a 19 % line *and* the
note — invalid, immutable, and correctable only by a Stornorechnung.

EU membership is derived from the VAT ID prefix, not the free-text country field.
Greece is `EL`, not `GR`. `XI` (Northern Ireland) is excluded: it is in the EU VAT
area for goods, not services.

Reverse charge is stored per invoice and is **never inferred from a 0 % rate**. A
domestic 0 % line means "not taxable here"; reverse charge means "the recipient
owes the tax".

*Meine Rechnungen* shows a **Zusammenfassende Meldung** section: issued
reverse-charge invoices grouped by customer USt-IdNr., switchable between
**monthly** and **quarterly**. Quarterly filing is allowed while intra-EU supplies
stay under €50,000 in a quarter; above that the ZM is due monthly — which is why
both views exist rather than one being chosen for you.

The query groups by month and quarters are derived from those rows, so the two
views cannot disagree about a period's total, and summed amounts are re-rounded to
the cent (adding exact 2-decimal amounts in binary floating point does not stay
exact). It is a report only. The app does not file the ZM with the BZSt, and it does not
confirm any VAT ID against BZSt/VIES — obtaining that confirmation and keeping the
evidence stays manual, and matters, because an invalid customer VAT ID makes the
VAT the supplier's.

## Backup, export and restore

Invoices must be kept for ten years (§ 147 AO). The app can reprint any issued
invoice, but only while this one database exists — so *Meine Rechnungen* offers two
downloads:

- **Sicherung (JSON)** — everything: invoices, line items, the number journal and
  the Stammdaten. Restorable into an empty database.
- **Rechnungsliste (CSV)** — one row per invoice for the Steuerberater, with each
  VAT rate broken out into its own column. Semicolon-separated with comma decimals
  and a BOM, so a German Excel opens it without an import dialog and umlauts
  survive. Values that Excel would evaluate as a formula are prefixed with an
  apostrophe.

The JSON **contains personal data** — IBAN, Steuernummer, Steuer-IdNr.,
Sozialversicherungsnummer, date of birth. Keep it on your own storage. It must
never be committed: this repository is public.

`/admin/export` is a Route Handler, not a Server Action, because the response has
to arrive as a file. `requireSession()` is its first statement and outside any
try/catch: `redirect()` works by throwing, so a catch would swallow it and serve
the IBAN to an unauthenticated request. Verified by test and by hand — no cookie
and a forged cookie both get a 307 to the login page with an empty body.

### Restoring

```sh
DATABASE_URL="<empty database>" node db/restore.mjs silicortex-backup_2026-08-11.json
```

It prints which database the backup came from and which one it is writing to, and
**refuses a database that already holds invoices or journal entries** — merging
would reintroduce numbers the journal has already burned and leave two invoices
claiming one number, which nothing later can untangle. It disables the immutability
triggers to write issued rows, then re-enables them in a `finally`; a database left
with them off has silently lost the guarantee.

A backup nobody has restored is a guess. The round trip is covered by schema tests
against real Postgres, and was verified end to end: seed a database, download the
JSON over HTTP from the running app, restore into a second database, and compare
every table — invoices, items, journal and Stammdaten came back identical, dates
included.

## Angebote (quotes)

**Neues Angebot** writes an offer instead of an invoice. It takes its number from
the `AN-` range, is headed **ANGEBOT**, and labels its fields *Angebotsnummer* /
*Angebotsdatum*. The same free-text block that carries payment terms on an invoice
carries validity here — an offer has nothing payable yet — defaulting to
*"Dieses Angebot ist 30 Tage ab Angebotsdatum gültig."*

§ 14 UStG does not apply to an offer, so a Leistungszeitraum and the customer's
address are not demanded. What is still enforced: a customer, a number, a date, at
least one priced position, your own sender block (an Angebot frozen with an empty
letterhead is useless), and every reverse-charge rule — a quote promising 0 % on a
wrong basis misleads the client before any invoice exists.

The document type lives in `doc_type`, which is the single source of truth for the
heading and the number range. A Storno used to be inferred from `storno_for`, which
cannot work for an Angebot draft: it has no number yet and nothing to infer from. A
CHECK constraint keeps the two columns from disagreeing, so a row can never print
RECHNUNG above a Storno reference.

An issued Angebot is frozen like any other issued document, so you always know
exactly what you sent. To revise one, use **Kopieren** — the revision is a new
offer with its own `AN-` number, which is also how the numbering stays honest.

**In Rechnung umwandeln** on an issued Angebot opens a draft invoice with the same
customer and positions, its own `RE-` number, and a printed `Bezug: Angebot
AN-2026-001 vom …` line. Nothing is written until you save, and converting the same
offer twice is allowed — billing an accepted offer in two parts is ordinary, and
each conversion asks the server for its own number.

Offers are excluded from the Zusammenfassende Meldung and from the Steuerberater's
CSV: an Angebot is not an intra-EU supply and not revenue. They remain in the JSON
backup, which is a copy of everything rather than a statement of turnover.
