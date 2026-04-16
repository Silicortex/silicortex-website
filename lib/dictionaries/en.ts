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
    title: "Technical Mastery",
    subtitle: "Years of building at the frontier of AI and automation.",
    items: [
      {
        year: "2024–Now",
        title: "AI Agent Architecture",
        description:
          "Designing multi-agent systems using LangChain, LlamaIndex, and custom tool-use. Specializing in RAG pipelines and autonomous task execution.",
        tags: ["LangChain", "LlamaIndex", "OpenAI", "RAG"],
      },
      {
        year: "2023–Now",
        title: "n8n Automation Expert",
        description:
          "Building production-grade automation workflows for clients across e-commerce, SaaS, and healthcare. 200+ workflows deployed.",
        tags: ["n8n", "Zapier", "Make", "REST APIs"],
      },
      {
        year: "2022–Now",
        title: "Full-Stack Engineering",
        description:
          "End-to-end development with Next.js, Node.js, TypeScript, and PostgreSQL. Focused on performance and developer experience.",
        tags: ["Next.js", "TypeScript", "PostgreSQL", "Docker"],
      },
      {
        year: "2021–2023",
        title: "Cloud & DevOps",
        description:
          "Infrastructure design, CI/CD pipelines, and containerized deployments across AWS and GCP.",
        tags: ["AWS", "GCP", "Docker", "Terraform"],
      },
    ],
  },
  network: {
    title: "Join the Team",
    subtitle: "We're building a distributed network of elite builders.",
    description:
      "Mo-Tek operates as a lean, high-output agency powered by a curated network of specialists. If you're exceptional at what you do — AI, automation, design, or development — we want to work with you.",
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
    copyright: "© 2026 Mo-Tek Solutions. All rights reserved.",
    tagline: "Building automation infrastructure for the next decade.",
  },
}

export type Dictionary = typeof en
export default en
