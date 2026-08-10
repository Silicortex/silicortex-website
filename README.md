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
| `GS-` | Gutschrift / Storno |
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
new document from the `GS-` range that references the original (`storno_for`), and
the original stays immutable.

### PDF file name

`RE-2026-001_2026-08-10_Beispiel-GmbH.pdf` — number first (the key the
Steuerberater references), then the ISO date (sorts correctly, cannot be misread
as an American date), then the customer. Every segment is sanitised to
`[A-Za-z0-9-]`, umlauts transliterated the German way (`Müller` → `Mueller`), so
the name can never contain a path separator. `document.title` is set to this name
on `beforeprint`, because Chrome uses the title as the default name in its "Save
as PDF" dialog, and restored on `afterprint`.
