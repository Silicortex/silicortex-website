const en = {
  nav: {
    home: "Home",
    services: "Services",
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
  experience: {
    title: "Experience & Education",
    subtitle: "Full-Stack Developer & Data Engineer based in Wiesbaden, Germany.",
    items: [
      {
        year: "04/2026",
        title: "Develop Generative AI Applications: Get Started",
        company: "IBM Skills Network",
        description:
          "Successfully completed an online course authorized by IBM and offered through Coursera. Learned foundational concepts and practical approaches for developing Generative AI applications.",
        link: "https://coursera.org/verify/SEXN3DTP7GGC",
        tags: ["Generative AI", "IBM", "Coursera", "AI Applications"],
      },
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
  meta: {
    home: {
      title: "Home",
      description: "We Build the Machines That Build Your Future",
    },
    services: {
      title: "Services",
      description:
        "AI and automation, software and web development, e-commerce, and brand identity — the full range of digital services Silicortex builds.",
    },
    work: {
      title: "Work",
      description: "AI agents, automation workflows, and dashboards built by Silicortex.",
    },
    experience: {
      title: "Experience",
      description: "Technical mastery in AI, automation, and full-stack development.",
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
    archAfter: "means Claude can call multiple tools in one response if the question needs combined data.",
  },
}

export type Dictionary = typeof en
export default en
