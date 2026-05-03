const en = {
  nav: {
    home: "Home",
    work: "Work",
    experience: "Experience",
    network: "Network",
    contact: "Contact",
    cta: "Get Started",
  },
  hero: {
    badge: "AI & Automation Agency",
    title: "We Build the Machines\nThat Build Your Future",
    subtitle:
      "AI-powered automation that eliminates repetitive work, scales your operations, and moves faster than your competitors.",
    cta1: "See Our Work",
    cta2: "Contact Us",
    scrollHint: "Scroll to explore",
  },
  services: {
    title: "What We Build",
    subtitle:
      "End-to-end solutions that combine AI intelligence with workflow automation — built to replace hours of manual effort.",
    items: [
      {
        title: "AI Agents",
        description:
          "Task-specific autonomous agents powered by RAG, LLMs, and custom tool-use. Deploy research bots, chatbots, and decision engines.",
        tag: "Core Service",
      },
      {
        title: "n8n Automation",
        description:
          "Visual workflow automation that connects your entire stack. From API triggers to multi-step logic — no repetitive work left behind.",
        tag: "Workflow",
      },
      {
        title: "Custom Development",
        description:
          "Full-stack applications built with modern tooling. We design, build, and deploy production-grade software fast.",
        tag: "Engineering",
      },
      {
        title: "AI Consulting",
        description:
          "Strategic guidance to identify automation opportunities and build a roadmap that delivers measurable ROI.",
        tag: "Strategy",
      },
      {
        title: "Rapid Deployment",
        description:
          "From concept to production in days. Our proven workflow templates compress build time without cutting quality.",
        tag: "Speed",
      },
    ],
  },
  work: {
    title: "Deep Dive",
    subtitle: "Two disciplines. Infinite combinations.",
    aiAgents: {
      title: "AI Agents",
      subtitle: "Task-Specific Autonomy",
      description:
        "We design agents that don't just respond — they reason, retrieve, and act. Each agent is built for a specific job, trained on your domain, and deployed where your team needs it most.",
      cards: [
        {
          title: "RAG Systems",
          description:
            "Retrieval-Augmented Generation that connects your private knowledge base to an LLM. Ask questions in natural language, get precise answers from your own data.",
          icon: "🧠",
        },
        {
          title: "Chatbots & Assistants",
          description:
            "Conversational agents that handle support, sales qualification, and onboarding — live on your website, Slack, or WhatsApp 24/7.",
          icon: "💬",
        },
        {
          title: "Research Agents",
          description:
            "Autonomous agents that scour the web, aggregate data, write reports, and surface insights — on demand, without manual effort.",
          icon: "🔍",
        },
      ],
    },
    automation: {
      title: "Automation",
      subtitle: "Workflow Canvas",
      description:
        "n8n gives us a visual canvas to build workflows that connect any API, transform any data, and trigger any action — at scale, with zero manual effort.",
      steps: [
        { label: "Webhook Trigger", color: "#3b82f6" },
        { label: "AI Processing", color: "#8b5cf6" },
        { label: "Data Transform", color: "#06b6d4" },
        { label: "Database Store", color: "#10b981" },
        { label: "Notify & Report", color: "#f59e0b" },
      ],
    },
  },
  experience: {
    title: "Experience & Education",
    subtitle: "Full-Stack Developer & Data Engineer based in Wiesbaden, Germany.",
    items: [
      {
        year: "08/2024 – 03/2026",
        title: "Full-Stack Developer & AI Integration",
        company: "schubwerk GmbH · Wiesbaden",
        description:
          "Led development of analytics tools, built a Data Warehouse from scratch, and integrated AI into existing systems. Responsible for all aspects of web development with a focus on continuous innovation.",
        tags: ["Next.js", "TypeScript", "Dagster", "Data Warehouse", "AI Integration", "Docker"],
      },
      {
        year: "10/2023 – 08/2024",
        title: "Working Student — Web Development",
        company: "schubwerk GmbH · Wiesbaden",
        description:
          "Fixed bugs in the company system, developed new API integrations (Shopify, Shopware, Google Analytics, Meta), and took ownership of new feature projects.",
        tags: ["PHP", "Laravel", "Vue.js", "REST APIs", "OAuth 2.0"],
      },
      {
        year: "01/2024 – 04/2024",
        title: "Bachelor Thesis — Machine Learning",
        company: "Hochschule RheinMain · Wiesbaden",
        description:
          "Developed a sales forecasting system combining machine learning with stochastic process models. Implemented in PHP and Python, delivered as the final project of a B.Sc. in Applied Informatics.",
        tags: ["Python", "PHP", "Machine Learning", "Forecasting", "Stochastic Models"],
      },
      {
        year: "09/2022 – 04/2023",
        title: "Internship — Web Development",
        company: "schubwerk GmbH · Wiesbaden",
        description:
          "Onboarded via pair-programming, acquired hands-on experience with PHP-Laravel and Vue.js. Independently developed sub-modules and programmed third-party system interfaces.",
        tags: ["PHP", "Laravel", "Vue.js", "Bootstrap", "PostgreSQL"],
      },
      {
        year: "09/2021 – 10/2021",
        title: "Internship — Business Unit Development",
        company: "Evoila GmbH · Mainz",
        description:
          "Java/Spring Boot development, unit testing with JUnit, Git version control, and PostgreSQL database management in a professional enterprise environment.",
        tags: ["Java", "Spring Boot", "JUnit", "PostgreSQL", "Git"],
      },
      {
        year: "10/2019 – 04/2024",
        title: "B.Sc. Applied Informatics",
        company: "Hochschule RheinMain · Wiesbaden",
        description:
          "Bachelor's degree with focus on Full Stack Development, Data Science, Project Management, and Machine Learning.",
        tags: ["Full Stack", "Data Science", "Machine Learning", "Project Management"],
      },
    ],
  },
  network: {
    title: "Join the Team",
    subtitle: "We're building a distributed network of elite builders.",
    description:
      "Silicortex operates as a lean, high-output agency powered by a curated network of specialists. If you're exceptional at what you do — AI, automation, design, or development — we want to work with you.",
    cta: "Apply to Collaborate",
    perks: [
      {
        title: "Remote-First",
        description: "Work from anywhere in the world, on your own schedule.",
        icon: "🌍",
      },
      {
        title: "High-Value Projects",
        description:
          "Work on real AI and automation problems for serious clients.",
        icon: "🚀",
      },
      {
        title: "Revenue Share",
        description:
          "Fair project-based compensation with performance upside.",
        icon: "💰",
      },
      {
        title: "No Bureaucracy",
        description:
          "Flat structure. You talk directly to decision makers, always.",
        icon: "⚡",
      },
    ],
  },
  contact: {
    title: "Let's Build Something",
    subtitle:
      "Tell us about your project. We'll respond within 24 hours with a clear plan.",
    form: {
      name: "Your Name",
      company: "Company (optional)",
      email: "Email Address",
      message: "Tell us about your project",
      submit: "Send Message",
      success: "Message sent! We'll be in touch shortly.",
    },
  },
  footer: {
    copyright: "© 2026 Silicortex. All rights reserved.",
    tagline: "Building automation infrastructure for the next decade.",
  },
  salesDashboard: {
    heroBadge: "Live Demo",
    heroCrumb: "Dashboards",
    heroTitle: "AI-Powered Sales Dashboard",
    heroSubtitle: "A full-featured analytics dashboard with KPI tracking, revenue trend charts, order management, product rankings, and a Claude-powered AI chatbot that answers natural-language questions about the data.",
    analyzing: "Analyzing:",
    annualRevenue: "Annual Revenue",
    totalOrdersStat: "Total Orders",
    yoyGrowth: "YoY Growth",
    salesOverview: "Sales Overview · 2025",
    fullYearDataset: "Jan – Dec 2025 · Full year dataset",
    breakdown: "Breakdown",
    comparison: "Comparison",
    products: "Products",
    orders: "Orders",
    revenueTrend: "Revenue Trend",
    revenueOverTime: "Revenue Over Time",
    orderStatusMix: "Order Status Mix",
    totalOrdersDonut: "Total Orders",
    decVsNov: "Dec vs Nov (weekly)",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    topByRevenue: "Top by Revenue",
    correlationLabel: "Correlation · Last 30D",
    ordersVsRevenue: "Orders vs Revenue (per day)",
    ordersAxisLabel: "Orders",
    ordersTooltip: "Orders:",
    revenueTooltip: "Revenue:",
    recentTransactions: "Recent Transactions",
    statusAll: "All",
    statusCompleted: "Completed",
    statusPending: "Pending",
    statusProcessing: "Processing",
    statusRefunded: "Refunded",
    colOrder: "Order",
    colCustomer: "Customer",
    colAmount: "Amount",
    colStatus: "Status",
    colDate: "Date",
    rawDataset: "Raw Dataset",
    datasetTitle: "Silicortex · Jan – Dec 2025",
    monthlyRevOrders: "Monthly Revenue & Orders",
    colMonth: "Month",
    colRevenue: "Revenue",
    colOrders: "Orders",
    colNewCustomers: "New Customers",
    colAvgOrder: "Avg / Order",
    total2025: "Total 2025",
    productRevBreakdown: "Product Revenue Breakdown",
    colProduct: "Product",
    colAnnualRevenue: "Annual Revenue",
    colUnitsSold: "Units Sold",
    colAvgPrice: "Avg Price",
    colRevenueShare: "Revenue Share",
    kpiSummary: "KPI Summary",
    kpiLabels: {
      "Total Revenue": "Total Revenue",
      "Total Orders": "Total Orders",
      "Avg Order Value": "Avg Order Value",
      "Conversion Rate": "Conversion Rate",
      "New Customers": "New Customers",
      "Churn Rate": "Churn Rate",
      "Customer LTV": "Customer LTV",
      "Repeat Purchase": "Repeat Purchase",
      "YoY Growth": "YoY Growth",
      "Revenue / User": "Revenue / User",
    } as Record<string, string>,
    aiInsights: "AI Insights",
    analysis: "Analysis",
    demoMode: "⚠ Demo Mode — no live LLM connected",
    prewrittenExamples: "Pre-written examples",
    analyzeBtn: "✦ Analyze",
    clickAnalyze: "Click Analyze to see insights for the {range} period.",
    readingData: "Reading your data…",
    chatLabel: "AI Chatbot",
    chatTitle: "Ask Your Sales Data Anything",
    chatPrewritten: "Responses are pre-written examples",
    chatPlaceholder: "Ask about revenue, orders, products, KPIs…",
    chatSend: "Send",
    howItWorksLabel: "Under the Hood",
    howItWorksTitle: "How This Chatbot Works",
    howItWorksSteps: [
      { step: "01", title: "You ask a question", desc: "Type any natural language question about your sales data — no SQL needed.", color: "#a78bfa" },
      { step: "02", title: "Claude decides what to fetch", desc: "The AI reads your question and picks the right database tool (sales by period, product performance, KPIs).", color: "#22d3ee" },
      { step: "03", title: "Tool queries the database", desc: "A server-side function runs the query against your real database and returns structured JSON.", color: "#4ade80" },
      { step: "04", title: "Claude answers in plain English", desc: "The AI receives the data and writes a clear, human-readable response with numbers formatted nicely.", color: "#fbbf24" },
    ],
    archLabel: "Architecture:",
    archAfter: "means Claude can call multiple tools in one response if the question needs combined data.",
  },
}

export type Dictionary = typeof en
export default en
