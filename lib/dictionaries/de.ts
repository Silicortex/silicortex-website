import type { Dictionary } from "./en"

const de: Dictionary = {
  nav: {
    home: "Startseite",
    work: "Projekte",
    experience: "Erfahrung",
    network: "Netzwerk",
    contact: "Kontakt",
    cta: "Loslegen",
  },
  hero: {
    badge: "KI & Automatisierungsagentur",
    title: "Wir bauen die Maschinen,\ndie Ihre Zukunft gestalten",
    subtitle:
      "KI-gestützte Automatisierung, die Routinearbeit eliminiert, Ihre Prozesse skaliert und schneller handelt als Ihre Mitbewerber.",
    cta1: "Unsere Arbeit",
    cta2: "Kontakt",
    scrollHint: "Zum Erkunden scrollen",
  },
  services: {
    title: "Was wir bauen",
    subtitle:
      "End-to-End-Lösungen, die KI-Intelligenz mit Workflow-Automatisierung kombinieren — entwickelt, um stundenlange Handarbeit zu ersetzen.",
    items: [
      {
        title: "KI-Agenten",
        description:
          "Aufgabenspezifische autonome Agenten auf Basis von RAG, LLMs und benutzerdefiniertem Tool-Einsatz. Research-Bots, Chatbots und Entscheidungs-Engines.",
        tag: "Kernleistung",
      },
      {
        title: "n8n Automatisierung",
        description:
          "Visuelle Workflow-Automatisierung, die Ihren gesamten Stack verbindet. Von API-Triggern bis zu mehrstufiger Logik — keine repetitive Arbeit mehr.",
        tag: "Workflows",
      },
      {
        title: "Individuelle Entwicklung",
        description:
          "Full-Stack-Anwendungen mit modernem Tooling. Wir entwerfen, entwickeln und deployen produktionsreife Software schnell.",
        tag: "Engineering",
      },
      {
        title: "KI-Beratung",
        description:
          "Strategische Beratung zur Identifikation von Automatisierungspotenzialen und Entwicklung einer Roadmap mit messbarem ROI.",
        tag: "Strategie",
      },
      {
        title: "Schnelle Lieferung",
        description:
          "Vom Konzept zur Produktion in Tagen. Unsere bewährten Workflow-Templates verkürzen die Entwicklungszeit ohne Qualitätsverlust.",
        tag: "Geschwindigkeit",
      },
    ],
  },
  work: {
    title: "Vertiefung",
    subtitle: "Zwei Disziplinen. Unendliche Kombinationen.",
    aiAgents: {
      title: "KI-Agenten",
      subtitle: "Aufgabenspezifische Autonomie",
      description:
        "Wir entwickeln Agenten, die nicht nur antworten — sie denken, suchen und handeln. Jeder Agent ist für eine bestimmte Aufgabe konzipiert, auf Ihre Domäne trainiert und dort eingesetzt, wo Ihr Team ihn am meisten braucht.",
      cards: [
        {
          title: "RAG-Systeme",
          description:
            "Retrieval-Augmented Generation verbindet Ihre private Wissensbasis mit einem LLM. Stellen Sie Fragen in natürlicher Sprache und erhalten Sie präzise Antworten aus Ihren eigenen Daten.",
          icon: "🧠",
        },
        {
          title: "Chatbots & Assistenten",
          description:
            "Konversationelle Agenten für Support, Sales-Qualifizierung und Onboarding — live auf Ihrer Website, in Slack oder WhatsApp — 24/7.",
          icon: "💬",
        },
        {
          title: "Research-Agenten",
          description:
            "Autonome Agenten, die das Web durchsuchen, Daten aggregieren, Berichte erstellen und Erkenntnisse liefern — auf Abruf, ohne manuellen Aufwand.",
          icon: "🔍",
        },
      ],
    },
    automation: {
      title: "Automatisierung",
      subtitle: "Workflow-Canvas",
      description:
        "n8n gibt uns eine visuelle Canvas, um Workflows zu erstellen, die jede API verbinden, Daten transformieren und Aktionen auslösen — skalierbar und vollautomatisch.",
      steps: [
        { label: "Webhook-Trigger", color: "#3b82f6" },
        { label: "KI-Verarbeitung", color: "#8b5cf6" },
        { label: "Datentransformation", color: "#06b6d4" },
        { label: "Datenbank-Speicher", color: "#10b981" },
        { label: "Benachrichtigung", color: "#f59e0b" },
      ],
    },
  },
  experience: {
    title: "Technische Kompetenz",
    subtitle: "Jahre des Bauens an der Spitze von KI und Automatisierung.",
    items: [
      {
        year: "2024–Heute",
        title: "KI-Agenten-Architektur",
        description:
          "Entwicklung von Multi-Agenten-Systemen mit LangChain, LlamaIndex und benutzerdefiniertem Tool-Einsatz. Spezialisierung auf RAG-Pipelines und autonome Aufgabenausführung.",
        tags: ["LangChain", "LlamaIndex", "OpenAI", "RAG"],
      },
      {
        year: "2023–Heute",
        title: "n8n Automatisierungsexperte",
        description:
          "Entwicklung produktionsreifer Automatisierungs-Workflows für Kunden aus E-Commerce, SaaS und Gesundheitswesen. Über 200 Workflows deployed.",
        tags: ["n8n", "Zapier", "Make", "REST APIs"],
      },
      {
        year: "2022–Heute",
        title: "Full-Stack Engineering",
        description:
          "End-to-End-Entwicklung mit Next.js, Node.js, TypeScript und PostgreSQL. Fokus auf Performance und Developer Experience.",
        tags: ["Next.js", "TypeScript", "PostgreSQL", "Docker"],
      },
      {
        year: "2021–2023",
        title: "Cloud & DevOps",
        description:
          "Infrastrukturdesign, CI/CD-Pipelines und containerisierte Deployments auf AWS und GCP.",
        tags: ["AWS", "GCP", "Docker", "Terraform"],
      },
    ],
  },
  network: {
    title: "Werde Teil des Teams",
    subtitle:
      "Wir bauen ein verteiltes Netzwerk aus erstklassigen Entwicklern.",
    description:
      "Mo-Tek-Solutions arbeitet als schlanke, hochproduktive Agentur, die von einem kuratierten Netzwerk aus Spezialisten angetrieben wird. Wenn Sie außergewöhnlich gut in KI, Automatisierung, Design oder Entwicklung sind — wir möchten mit Ihnen zusammenarbeiten.",
    cta: "Jetzt bewerben",
    perks: [
      {
        title: "Remote-First",
        description:
          "Arbeiten Sie von überall auf der Welt, nach Ihrem eigenen Zeitplan.",
        icon: "🌍",
      },
      {
        title: "Hochwertige Projekte",
        description:
          "Arbeiten Sie an echten KI- und Automatisierungsproblemen für seriöse Kunden.",
        icon: "🚀",
      },
      {
        title: "Umsatzbeteiligung",
        description:
          "Faire projektbasierte Vergütung mit leistungsabhängigem Upside.",
        icon: "💰",
      },
      {
        title: "Keine Bürokratie",
        description:
          "Flache Hierarchie. Sie sprechen immer direkt mit Entscheidungsträgern.",
        icon: "⚡",
      },
    ],
  },
  contact: {
    title: "Lassen Sie uns etwas bauen",
    subtitle:
      "Erzählen Sie uns von Ihrem Projekt. Wir antworten innerhalb von 24 Stunden mit einem klaren Plan.",
    form: {
      name: "Ihr Name",
      company: "Unternehmen (optional)",
      email: "E-Mail-Adresse",
      message: "Erzählen Sie uns von Ihrem Projekt",
      submit: "Nachricht senden",
      success: "Nachricht gesendet! Wir melden uns in Kürze.",
    },
  },
  footer: {
    copyright: "© 2026 Mo-Tek-Solutions. Alle Rechte vorbehalten.",
    tagline:
      "Wir bauen Automatisierungsinfrastruktur für das nächste Jahrzehnt.",
  },
}

export default de
