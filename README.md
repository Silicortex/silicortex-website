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

## 📜 Available Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Builds the application for production deployment.
- `npm run start`: Runs the compiled production application.
- `npm run lint`: Analyzes the code using ESLint to find and fix problems.

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js. Check out the Next.js deployment documentation for more details.
