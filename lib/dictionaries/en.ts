// A segment of the SalesChatbot "architecture callout" sentence(s), which mix
// plain prose with inline <code> identifiers and a <strong> emphasis — too
// structured for a single translated string, so each locale supplies its own
// ordered segment list and SalesChatbot.tsx renders each segment by `type`.
export type ArchSegment = { type: "text" | "code" | "strong"; value: string }

const en = {
  nav: {
    home: "Home",
    services: "Services",
    work: "Projects",
    network: "Network",
    contact: "Contact",
    cta: "Get Started",
  },
  navbar: {
    projectsLabel: "Projects",
    toggleLanguage: "Language",
    toggleTheme: "Toggle theme",
    toggleMenu: "Toggle menu",
    toggleSubmenu: "Toggle sub-menu",
    salesDashboardLabel: "Sales Dashboard",
    salesDashboardDesc: "AI-powered analytics demo",
  },
  hero: {
    badge: "Full-Service Digital Agency",
    title: "We Build the Products\nThat Power Your Business",
    subtitle:
      "AI-powered automation is our flagship specialty — backed by full-stack software, e-commerce, and brand identity, so your business can launch, scale, and outpace the competition.",
    cta1: "Explore Our Services",
    cta2: "Contact Us",
    scrollHint: "Scroll to explore",
  },
  services: {
    title: "What We Build",
    subtitle:
      "AI-driven automation, full-stack software, e-commerce, and brand identity — everything your business needs to launch, run, and scale, under one roof.",
    categories: [
      {
        id: "ai-automation" as const,
        title: "AI & Automation",
        description:
          "Autonomous agents, visual workflow automation, and the strategy to tie them together — we design and deploy AI systems that take repetitive work off your team's plate.",
        tag: "Core",
      },
      {
        id: "software-dev" as const,
        title: "Software & Web Development",
        description:
          "Full-stack applications built with modern tooling, from first prototype to production in days. We design, build, and ship software fast without cutting quality.",
        tag: "Engineering",
      },
      {
        id: "ecommerce" as const,
        title: "E-Commerce",
        description:
          "Custom online stores for any niche — product catalogs, secure checkout, and the subscription, booking, or inventory features your business actually needs.",
        tag: "New",
      },
      {
        id: "brand-launch" as const,
        title: "Brand Identity & Business Launch",
        description:
          "Logo design, naming, and a complete visual identity system, paired with a professional website — everything a new company needs to launch looking credible.",
        tag: "New",
      },
    ],
  },
  servicesPage: {
    header: "Our Services",
    title: "Four Disciplines, One Team",
    subtitle:
      "AI and automation, software and web development, e-commerce, and brand identity — explore what each discipline covers below.",
    categories: [
      {
        id: "ai-automation",
        label: "AI & Automation",
        title: "Intelligence That Works While You Sleep",
        description:
          "From autonomous agents that handle real tasks to visual workflows that remove busywork from your team's day — we design AI systems built to run in production, not stay in a demo.",
        items: [
          {
            title: "AI Agents & Assistants",
            description:
              "Autonomous agents that reason, retrieve, and act. RAG systems answer questions from your own knowledge base, conversational assistants handle support and sales qualification on your website, Slack, or WhatsApp, and research agents scour the web and write reports — all without manual effort.",
            tags: ["LangChain", "Claude AI", "GPT-4", "RAG"],
          },
          {
            title: "Workflow Automation (n8n)",
            description:
              "Visual workflows that connect your entire stack — webhook triggers, AI processing, data transforms, database writes, and notifications in one canvas, running end-to-end with zero manual effort.",
            tags: ["n8n", "Webhooks", "REST APIs", "PostgreSQL"],
          },
          {
            title: "AI & Machine Learning Integration",
            description:
              "We build AI directly into your existing web and data systems — predictive forecasting that combines machine learning with stochastic models, and generative AI features powered by advanced prompt engineering.",
            tags: ["GenAI", "Machine Learning", "Predictive Models"],
          },
          {
            title: "AI Strategy & Consulting",
            description:
              "Not sure where AI fits in your business yet? We audit your workflows, identify the highest-leverage automation opportunities, and build the roadmap — then build the system.",
            tags: ["Strategy", "Automation Audit", "Roadmapping"],
          },
        ],
      },
      {
        id: "software-dev",
        label: "Software & Web Dev",
        title: "From Prototype to Production, Fast",
        description:
          "Full-stack applications built with modern tooling and shipped fast — robust backends, clean data pipelines, and the integrations that connect everything you already run.",
        items: [
          {
            title: "Full-Stack Web Development",
            description:
              "End-to-end web applications — frontend UIs built with React, Next.js, Vue, and modern CSS, backed by robust architectures in Python, Java, PHP, Laravel, or Spring Boot. From first prototype to production in days, without cutting quality.",
            tags: ["React", "Next.js", "Python", "Laravel"],
          },
          {
            title: "Data Engineering",
            description:
              "Data warehouses and data lakes designed to scale, with pipelines managed through Dagster and AWS. We build the data models and manage the databases — PostgreSQL, MySQL, MongoDB — that your applications and dashboards run on.",
            tags: ["Dagster", "AWS", "PostgreSQL", "MongoDB"],
          },
          {
            title: "System Integration",
            description:
              "Secure connections between your systems and the platforms you already run on — RESTful APIs, OAuth 2.0, and direct integrations with Shopify, Shopware, Meta, and Google Analytics.",
            tags: ["REST APIs", "OAuth 2.0", "Shopify", "Meta"],
          },
          {
            title: "Rapid Deployment",
            description:
              "Modern CI/CD and infrastructure that gets your product in front of real users fast — from first commit to a live, production-grade release, without the usual engineering overhead.",
            tags: ["CI/CD", "Cloud Infra", "DevOps"],
          },
        ],
      },
      {
        id: "ecommerce",
        label: "E-Commerce",
        title: "Online Stores, Built to Sell",
        description:
          "Custom storefronts for any niche — product catalogs, secure checkout and payments, inventory and order management, and the exact features your business needs to sell online.",
        items: [
          {
            title: "Custom Storefronts",
            description:
              "A store built around your products and your brand, not a generic theme. Responsive design, fast load times, and a shopping experience tuned for your niche — fashion, food, or anything in between.",
            tags: ["Any Niche", "Custom Design"],
          },
          {
            title: "Secure Checkout & Payments",
            description:
              "Frictionless checkout with the payment methods your customers already trust — card payments, digital wallets, and local options — all PCI-compliant and built to minimize cart abandonment.",
            tags: ["Secure Payments", "Checkout"],
          },
          {
            title: "Inventory & Order Management",
            description:
              "Real-time stock tracking, automated order routing, and dashboards that show you what's selling — so you spend less time on spreadsheets and more time growing.",
            tags: ["Inventory", "Order Management"],
          },
          {
            title: "Subscriptions, Bookings & Marketplaces",
            description:
              "The features that make your store yours — recurring subscriptions, appointment or table bookings, or a full multi-vendor marketplace where other sellers list alongside you.",
            tags: ["Subscriptions", "Bookings", "Custom Features"],
          },
        ],
      },
      {
        id: "brand-launch",
        label: "Brand Launch",
        title: "Launch With a Real Identity",
        description:
          "Logo design and naming, a complete visual identity system, and a professional website — everything a new company needs to look credible from day one.",
        items: [
          {
            title: "Logo Design & Naming",
            description:
              "A name that fits your business and a logo that works everywhere — business cards, app icons, social profiles — designed to be memorable at a glance and distinctive in your market.",
            tags: ["Naming", "Logo Design"],
          },
          {
            title: "Visual Identity System",
            description:
              "A complete set of brand guidelines — color palette, typography, imagery style, and usage rules — so every piece of marketing you put out looks like it came from the same company.",
            tags: ["Brand Guidelines", "Typography"],
          },
          {
            title: "Professional Website",
            description:
              "A polished, responsive website that introduces your business and converts visitors into customers — built on the same identity system, live and ready before you open your doors.",
            tags: ["Custom Features", "Responsive Design"],
          },
        ],
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
  workShowcase: {
    header: "Our Work",
    title: "What We Build",
    subtitle: "Real projects, live demos, and the capabilities behind every engagement.",
    sections: {
      capabilities: {
        label: "Capabilities",
        title: "Core Expertise",
        description: "Comprehensive software development, from robust backends and data lakes to modern frontends and AI integration.",
        items: [
          {
            tag: "Web Dev",
            title: "Web Development",
            description: "Build complete, end-to-end web applications. Design frontend UIs with HTML/CSS, React, Vue, Next.js, and Bootstrap. Develop backend architectures with Python, Java, PHP, C, C#, Laravel, and SpringBoot.",
          },
          {
            tag: "Data",
            title: "Data Engineering",
            description: "Design and build Data Warehouses and Data Lakes. Manage pipelines with Dagster and AWS. Build complex data models and manage databases like PostgreSQL, MySQL, and MongoDB.",
          },
          {
            tag: "AI / ML",
            title: "AI & Machine Learning",
            description: "Integrate AI into web and data systems. Develop predictive forecasting systems combining ML and stochastic models. Build Generative AI applications utilizing advanced prompt engineering.",
          },
          {
            tag: "Integration",
            title: "System Integration",
            description: "Program interfaces and securely connect 3rd-party systems using RESTful APIs and OAuth 2.0. Integrate widely-used platforms like Shopify, Shopware, Meta, and Google Analytics.",
          },
        ]
      },
      dashboards: {
        label: "Dashboards",
        title: "Data Dashboards",
        description: "Interactive analytics interfaces with live charts, KPI tracking, and AI-powered insights panels.",
        items: [
          {
            tag: "Live Demo",
            title: "AI-Powered Sales Dashboard",
            description: "Full-featured analytics dashboard with KPI cards, revenue trends, order breakdowns, product rankings, a natural-language chatbot that queries the database, and a Claude AI insights panel.",
            cta: "View live demo",
          }
        ]
      },
      saas: {
        label: "SaaS",
        title: "SaaS Platforms",
        description: "Multi-tenant platforms with role-based access control, subscription functionality, and custom domains.",
        items: [
          {
            tag: "Multi-Tenant",
            title: "Barber Shop SaaS",
            description: "An enterprise-grade, multi-tenant SaaS platform for barber shops. Built with Next.js, Supabase, and PostgreSQL with Row-Level Security (RLS). Features multi-roles and subscription plans.",
          }
        ]
      },
      aiAgents: {
        label: "AI Agents",
        title: "AI Agents & Assistants",
        description: "Autonomous systems and conversational agents that reason, retrieve data, and act on your behalf — around the clock.",
        items: [
          {
            tag: "AI Agents",
            title: "RAG Knowledge Systems",
            description: "Retrieval-Augmented Generation that connects your private knowledge base to an LLM. Ask questions in natural language, get precise answers from your own data.",
          },
          {
            tag: "AI Agents",
            title: "Chatbots & Assistants",
            description: "Conversational agents that handle support, sales qualification, and onboarding — live on your website, Slack, or WhatsApp 24/7.",
          },
          {
            tag: "AI Agents",
            title: "Research Agents",
            description: "Autonomous agents that scour the web, aggregate data, write reports, and surface insights — on demand, without manual effort.",
          }
        ]
      },
      automation: {
        label: "Automation",
        title: "Workflow Automation",
        description: "End-to-end pipelines that connect your entire stack — triggered by events, enriched by AI, and delivered without manual work.",
        items: [
          {
            tag: "Automation",
            title: "n8n Workflow Automation",
            description: "Visual workflows that connect your entire stack — API triggers, AI processing, data transforms, database writes, and notifications in one canvas.",
          }
        ]
      }
    }
  },
  projects: {
    title: "Projects",
    intro:
      "Nine projects we built — for clients, as our own products, and for a local association. Client names stay private; what we built, and with what, is all here.",
    stats: [
      { value: "9", label: "projects" },
      { value: "3", label: "for clients" },
      { value: "5", label: "own products" },
      { value: "40+", label: "technologies" },
    ],
    kinds: { own: "Own product", client: "Client project", voluntary: "Pro bono" },
    stockPhoto: "Stock photo — screenshots follow",
    builtTitle: "What we built",
    stackTitle: "Technologies",
    visit: "Visit",
    items: {
      vibecenter: {
        name: "Vibe Center",
        sector: "SaaS for salons and barber shops",
        summary:
          "Our own platform: every business gets its own booking site, a dashboard for appointments, team and clients, and a subscription — all on one multi-tenant system.",
        built: [
          "Online booking in four steps, with staff and time-slot choice",
          "Dashboard for appointments, services, team, reviews and marketing",
          "Sign-up with Stripe subscription; a storefront per business in several designs",
        ],
        note: "Hosting: schubwerk GmbH",
      },
      translation: {
        name: "Live translation for mosques",
        sector: "Religious community",
        summary:
          "Arabic sermons and lectures are transcribed as they are spoken and translated into German and English — on a screen in the prayer room and on every visitor's phone.",
        built: [
          "Real-time speech recognition with two engines for Arabic",
          "AI translation into German and English, with Qur'an and hadith passages recognised and quoted correctly",
          "Display for the room, phone view via QR code, and a dashboard with an archive and glossary",
        ],
        note: "",
      },
      workshop: {
        name: "Workshop manager",
        sector: "Heavy machinery repair",
        summary:
          "One system for a repair workshop: jobs on a board from intake to handover, quotes, a parts shop and the public website — in Arabic and English.",
        built: [
          "Job board with drag and drop, on desktop and phone",
          "Customers, parts stock, services and price lists; quotes as PDF",
          "Public website and parts shop, editable by the workshop itself",
        ],
        note: "",
      },
      care: {
        name: "Care platform",
        sector: "Home care",
        summary:
          "A platform that brings together people who need care and professional carers — from search and booking to payment.",
        built: [
          "Profiles and search for carers, booking of care visits",
          "Secure login, roles and notifications",
          "Online payment and invoices as PDF",
        ],
        note: "",
      },
      admin: {
        name: "Admin & bookkeeping",
        sector: "Internal tool",
        summary:
          "Our own back office: invoices, receipts, expenses and tax deadlines in one place — connected to Google Drive and Calendar, with AI that reads incoming invoices.",
        built: [
          "Invoices and receipt archive that cannot be altered once issued (GoBD)",
          "VAT figures per quarter and a deadline calendar that syncs to Google Calendar",
          "AI reads invoices from Drive and suggests the booking — a person confirms",
        ],
        note: "",
      },
      commerce: {
        name: "E-commerce platform",
        sector: "Online retail",
        summary:
          "A complete online shop on its own commerce backend: catalogue, cart, checkout and an AI assistant that answers customer questions.",
        built: [
          "Product catalogue, cart and checkout on Medusa v2",
          "Storefront in several languages",
          "AI assistant for product questions",
        ],
        note: "",
      },
      website: {
        name: "silicortex.de",
        sector: "Company website",
        summary:
          "The website you are on: three languages including Arabic right-to-left, our own brand system, and an interactive demo dashboard.",
        built: [
          "German, English and Arabic with right-to-left layout",
          "Brand system with generated logos, icons and business cards",
          "Light and dark theme, contact form, interactive demos",
        ],
        note: "",
      },
      tvLauncher: {
        name: "TV launcher",
        sector: "Fire TV",
        summary:
          "An ad-free home screen for Fire TV that puts Arabic channels and favourite apps first — big tiles, made for the remote.",
        built: [
          "Home screen with Arabic channels and apps",
          "Navigation built for the remote control",
          "No ads, no tracking",
        ],
        note: "",
      },
      association: {
        name: "Association website",
        sector: "Cultural association in Wiesbaden",
        summary:
          "A website for a cultural association, built on its own WordPress theme so the team can maintain events, projects and members themselves.",
        built: [
          "Custom WordPress block theme in the association's colours",
          "Plugin for events, projects and team, with block bindings",
          "Editable by the association without a developer",
        ],
        note: "",
      },
    },
    demoTitle: "Try it yourself",
    demoText: "An interactive sales dashboard with sample data — click through it in the browser.",
    demoCta: "Open the demo",
    techTitle: "Technologies across our projects",
    techIntro: "The number shows in how many of the nine projects a technology is used.",
    groups: {
      frontend: "Frontend",
      backend: "Backend & data",
      ai: "AI",
      payments: "Payments",
      infra: "Infrastructure & testing",
      mobile: "Mobile & TV",
    },
    ctaTitle: "Your project next?",
    ctaText: "Tell us what you need — in German, English or Arabic.",
    ctaButton: "Get in touch",
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
    profile: {
      downloadCard: "Business card (PDF)",
      title: "Full-Stack Developer & Data Engineer",
      bio: "Based in Wiesbaden, Germany. B.Sc. Applied Informatics from Hochschule RheinMain. 3+ years at schubwerk GmbH building analytics tools, data warehouses, and AI integrations. Passionate about machine learning, automation, and shipping products that matter.",
    },
    form: {
      name: "Your Name",
      company: "Company (optional)",
      email: "Email Address",
      message: "Tell us about your project",
      submit: "Send Message",
      success: "Message sent! We'll be in touch shortly.",
      error: "Sorry, the message could not be sent. Please try again or email us directly:",
    },
  },
  footer: {
    copyright: "© 2026 Silicortex. All rights reserved.",
    tagline: "Building automation infrastructure for the next decade.",
    legalLabel: "Legal",
    impressum: "Legal Notice",
    privacy: "Privacy Policy",
  },
  meta: {
    home: {
      title: "Home",
      description: "We Build the Products That Power Your Business",
    },
    services: {
      title: "Services",
      description:
        "AI and automation, software and web development, e-commerce, and brand identity — the full range of digital services Silicortex builds.",
    },
    work: {
      title: "Projects",
      description: "Nine projects by Silicortex — SaaS, AI, e-commerce and websites, with the technologies behind each.",
    },
    network: {
      title: "Network",
      description:
        "Join the Silicortex freelance network. Work remotely on high-value AI and automation projects.",
    },
    contact: {
      title: "Contact",
      description: "Get in touch with Silicortex to start your project.",
    },
    impressum: {
      title: "Legal Notice",
      description: "Legal notice (Impressum) for silicortex.de: provider identification and contact details.",
    },
    privacy: {
      title: "Privacy Policy",
      description: "How silicortex.de processes personal data: hosting, analytics, contact form, cookies and your rights.",
    },
  },
  notFound: {
    title: "This page does not exist",
    description: "The link may be outdated, or the address slightly off.",
    backHome: "Back to home",
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
    archFlow: [
      { type: "text", value: "Browser → " },
      { type: "code", value: "/api/chat" },
      { type: "text", value: " (Next.js server) → Claude with 3 tools (" },
      { type: "code", value: "query_sales_by_period" },
      { type: "text", value: ", " },
      { type: "code", value: "query_product_performance" },
      { type: "text", value: ", " },
      { type: "code", value: "query_kpis" },
      { type: "text", value: ") → mock DB → Claude formats answer → Browser." },
    ] as ArchSegment[],
    archLoop: [
      { type: "text", value: "The " },
      { type: "strong", value: "agentic loop" },
      { type: "text", value: " means Claude can call multiple tools in one response if the question needs combined data." },
    ] as ArchSegment[],
    kpiOverview: { label: "Key Metrics", title: "KPI Overview" },
    revenueTrends: { label: "Revenue", title: "Revenue Trends" },
    orderAnalytics: { label: "Order Analytics", title: "Orders & Comparisons" },
    productPerformance: { label: "Product Performance", title: "Products & Correlations" },
    transactions: { label: "Transactions", title: "Transaction History" },
    rawData: { label: "Raw Data", title: "Full Dataset" },
    aiInsightsHeader: { label: "AI", title: "AI-Powered Insights" },
    chatbotHeader: { label: "AI Chatbot", title: "Ask Your Sales Data" },
    chatbot: {
      greeting: "Hi! I'm analyzing Silicortex's 2025 sales data. Ask me about revenue, orders, top plans, KPIs, or monthly trends — try a suggestion below.",
      suggestions: [
        "What were Lumina's total sales in Q4 2025?",
        "Which plan brings the most revenue?",
        "How did November compare to October?",
        "What's the churn rate and customer LTV?",
      ],
      fallback: "That's a great question! In a real deployment, I'd query the live database and give you a precise answer using the data. For this demo, try one of the suggestion chips below to see example responses.",
      responses: [
        {
          keywords: ["q4", "last 3", "last three", "october", "november", "december", "oct", "nov", "dec"],
          response: "In Q4 2025 (Oct–Dec), Silicortex generated **$449,200** in revenue across **6,210 orders**. October contributed $138,200, November was the strongest month at $162,400 driven by a Black Friday spike ($52,400 in one week), and December closed at $148,600. That's a +38% increase compared to Q3's $324,600.",
        },
        {
          keywords: ["product", "plan", "best", "top", "revenue", "subscription", "pro", "enterprise", "starter", "business"],
          response: "The **Pro Plan (€149/mo)** is Lumina's top earner at $486,200 in 2025 across 3,263 subscriptions. The Business Plan (€399/mo) ranks second at $412,800 from 1,034 customers. Together they account for 69% of total revenue. The Enterprise (€1,200/mo) contributes $228,400 from only 190 clients — the highest revenue-per-customer at €1,200/mo.",
        },
        {
          keywords: ["november", "october", "compare", "vs", "versus", "month"],
          response: "November significantly outperformed October: revenue grew from $138,200 to $162,400 (**+18%**) and orders jumped from 1,912 to 2,242 (+17%). The main driver was Black Friday week (Nov 19–25) which alone generated $52,400 — nearly 3× a typical week. New customer acquisitions also surged: 386 in November vs 324 in October (+19%).",
        },
        {
          keywords: ["churn", "ltv", "lifetime", "retention", "repeat", "loyal"],
          response: "Lumina's churn rate is **1.6%** — excellent for B2B SaaS where the industry average is 3–5%. Customer LTV stands at $620 with a 71% repeat purchase rate, indicating very strong retention. At the current +18.4% YoY growth rate with 3,040 new customers in 2025, the revenue base is compounding healthily.",
        },
        {
          keywords: ["conversion", "rate", "funnel", "lead", "signup"],
          response: "Lumina's conversion rate is **4.1%** — up +0.4pp year-over-year. With 18,048 orders from an estimated 410,000 monthly visitors, the funnel is performing above SaaS benchmarks (typically 2–5%). The Pro Plan is the most common entry point; improving the trial-to-paid flow for the Business Plan could yield the highest revenue uplift.",
        },
        {
          keywords: ["growth", "yoy", "year", "annual", "2025", "total"],
          response: "Silicortex grew **+18.4%** year-over-year in 2025, ending at $1,302,400 in total revenue across 18,048 orders. H2 ($773,800) outperformed H1 ($528,600) by 46%, driven by a strong Q4. New customer acquisition grew +22.6% to 3,040 while churn dropped to 1.6%, resulting in strong net revenue retention.",
        },
        {
          keywords: ["new customer", "acquisition", "acquire", "onboard"],
          response: "Lumina acquired **3,040 new customers** in 2025, up +22.6% vs 2024. The strongest acquisition months were November (386 new customers) and October (324), coinciding with end-of-year B2B budget cycles. Feb was the weakest month at 142 new customers — a good target for a winter onboarding campaign.",
        },
      ],
    },
  },
}

export type Dictionary = typeof en
export default en
