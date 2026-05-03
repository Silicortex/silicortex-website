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
    title: "Erfahrung & Ausbildung",
    subtitle: "Full-Stack Developer & Data Engineer mit Sitz in Wiesbaden.",
    items: [
      {
        year: "08/2024 – 03/2026",
        title: "Full-Stack Developer & KI-Integration",
        company: "schubwerk GmbH · Wiesbaden",
        description:
          "Aufbau eines Data Warehouses, Integration von KI in bestehende Systeme und kontinuierliche Weiterentwicklung von Analytics-Tools.",
        tags: ["Next.js", "TypeScript", "Dagster", "Data Warehouse", "KI-Integration", "Docker"],
      },
      {
        year: "10/2023 – 08/2024",
        title: "Werkstudent – Webentwicklung",
        company: "schubwerk GmbH · Wiesbaden",
        description:
          "Behebung von Bugs, Entwicklung neuer API-Verbindungen (Shopify, Shopware, Google Analytics, Meta) und Übernahme neuer Projekte.",
        tags: ["PHP", "Laravel", "Vue.js", "REST APIs", "OAuth 2.0"],
      },
      {
        year: "01/2024 – 04/2024",
        title: "Bachelorarbeit – Maschinelles Lernen",
        company: "Hochschule RheinMain · Wiesbaden",
        description:
          "Entwicklung eines Prognose­systems zur Vorhersage von Verkaufsdaten, das maschinelles Lernen und stochastische Prozessmodelle kombiniert.",
        tags: ["Python", "PHP", "Machine Learning", "Prognosemodelle"],
      },
      {
        year: "09/2022 – 04/2023",
        title: "Praktikum – Webentwicklung",
        company: "schubwerk GmbH · Wiesbaden",
        description:
          "Einarbeitung via Pair-Programming, eigenständige Entwicklung von Teilmodulen und Anbindung von Drittsystemen.",
        tags: ["PHP", "Laravel", "Vue.js", "Bootstrap", "PostgreSQL"],
      },
      {
        year: "09/2021 – 10/2021",
        title: "Praktikum – Business Unit Development",
        company: "Evoila GmbH · Mainz",
        description:
          "Java/Spring-Boot-Entwicklung, Unit-Tests mit JUnit, Git-Versionierung und Arbeit mit PostgreSQL-Datenbanken.",
        tags: ["Java", "Spring Boot", "JUnit", "PostgreSQL", "Git"],
      },
      {
        year: "10/2019 – 04/2024",
        title: "B.Sc. Angewandte Informatik",
        company: "Hochschule RheinMain · Wiesbaden",
        description:
          "Bachelorstudium mit Schwerpunkten in Full Stack Development, Data Science, Projektmanagement und Machine Learning.",
        tags: ["Full Stack", "Data Science", "Machine Learning", "Projektmanagement"],
      },
    ],
  },
  network: {
    title: "Werde Teil des Teams",
    subtitle:
      "Wir bauen ein verteiltes Netzwerk aus erstklassigen Entwicklern.",
    description:
      "Silicortex arbeitet als schlanke, hochproduktive Agentur, die von einem kuratierten Netzwerk aus Spezialisten angetrieben wird. Wenn Sie außergewöhnlich gut in KI, Automatisierung, Design oder Entwicklung sind — wir möchten mit Ihnen zusammenarbeiten.",
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
    copyright: "© 2026 Silicortex. Alle Rechte vorbehalten.",
    tagline:
      "Wir bauen Automatisierungsinfrastruktur für das nächste Jahrzehnt.",
  },
  salesDashboard: {
    heroBadge: "Live-Demo",
    heroCrumb: "Dashboards",
    heroTitle: "KI-gestütztes Sales-Dashboard",
    heroSubtitle: "Ein vollständiges Analytics-Dashboard mit KPI-Tracking, Umsatztrend-Charts, Auftragsmanagement, Produkt-Rankings und einem KI-Chatbot, der Fragen in natürlicher Sprache über die Verkaufsdaten beantwortet.",
    analyzing: "Analysiert:",
    annualRevenue: "Jahresumsatz",
    totalOrdersStat: "Bestellungen",
    yoyGrowth: "JoJ-Wachstum",
    salesOverview: "Verkaufsübersicht · 2025",
    fullYearDataset: "Jan – Dez 2025 · Ganzjahres-Datensatz",
    breakdown: "Aufschlüsselung",
    comparison: "Vergleich",
    products: "Produkte",
    orders: "Bestellungen",
    revenueTrend: "Umsatztrend",
    revenueOverTime: "Umsatz im Zeitverlauf",
    orderStatusMix: "Bestellstatus-Mix",
    totalOrdersDonut: "Bestellungen",
    decVsNov: "Dez vs. Nov (wöchentlich)",
    thisMonth: "Dieser Monat",
    lastMonth: "Letzter Monat",
    topByRevenue: "Top nach Umsatz",
    correlationLabel: "Korrelation · Letzte 30T",
    ordersVsRevenue: "Bestellungen vs. Umsatz (pro Tag)",
    ordersAxisLabel: "Bestellungen",
    ordersTooltip: "Bestellungen:",
    revenueTooltip: "Umsatz:",
    recentTransactions: "Aktuelle Transaktionen",
    statusAll: "Alle",
    statusCompleted: "Abgeschlossen",
    statusPending: "Ausstehend",
    statusProcessing: "In Bearbeitung",
    statusRefunded: "Erstattet",
    colOrder: "Auftrag",
    colCustomer: "Kunde",
    colAmount: "Betrag",
    colStatus: "Status",
    colDate: "Datum",
    rawDataset: "Rohdatensatz",
    datasetTitle: "Silicortex · Jan – Dez 2025",
    monthlyRevOrders: "Monatlicher Umsatz & Bestellungen",
    colMonth: "Monat",
    colRevenue: "Umsatz",
    colOrders: "Bestellungen",
    colNewCustomers: "Neukunden",
    colAvgOrder: "Ø / Bestellung",
    total2025: "Gesamt 2025",
    productRevBreakdown: "Produktumsatz-Aufschlüsselung",
    colProduct: "Produkt",
    colAnnualRevenue: "Jahresumsatz",
    colUnitsSold: "Verkaufte Einheiten",
    colAvgPrice: "Ø Preis",
    colRevenueShare: "Umsatzanteil",
    kpiSummary: "KPI-Übersicht",
    kpiLabels: {
      "Total Revenue": "Gesamtumsatz",
      "Total Orders": "Gesamtbestellungen",
      "Avg Order Value": "Ø Bestellwert",
      "Conversion Rate": "Konversionsrate",
      "New Customers": "Neukunden",
      "Churn Rate": "Abwanderungsrate",
      "Customer LTV": "Kunden-LTV",
      "Repeat Purchase": "Wiederkaufrate",
      "YoY Growth": "JoJ-Wachstum",
      "Revenue / User": "Umsatz / Nutzer",
    } as Record<string, string>,
    aiInsights: "KI-Analyse",
    analysis: "Analyse",
    demoMode: "⚠ Demo-Modus — kein LLM verbunden",
    prewrittenExamples: "Vorgefertigte Beispiele",
    analyzeBtn: "✦ Analysieren",
    clickAnalyze: "Klicken Sie auf Analysieren für den {range}-Zeitraum.",
    readingData: "Daten werden gelesen…",
    chatLabel: "KI-Chatbot",
    chatTitle: "Stellen Sie Ihre Datenfragen",
    chatPrewritten: "Antworten sind vorgefertigt",
    chatPlaceholder: "Fragen Sie nach Umsatz, Bestellungen, Produkten, KPIs…",
    chatSend: "Senden",
    howItWorksLabel: "Unter der Haube",
    howItWorksTitle: "Wie dieser Chatbot funktioniert",
    howItWorksSteps: [
      { step: "01", title: "Sie stellen eine Frage", desc: "Tippen Sie eine Frage in natürlicher Sprache über Ihre Verkaufsdaten — kein SQL nötig.", color: "#a78bfa" },
      { step: "02", title: "Claude wählt das Tool", desc: "Die KI liest Ihre Frage und wählt das passende Datenbank-Tool (Verkauf, Produkte, KPIs).", color: "#22d3ee" },
      { step: "03", title: "Tool fragt die Datenbank ab", desc: "Eine serverseitige Funktion führt die Abfrage aus und gibt strukturiertes JSON zurück.", color: "#4ade80" },
      { step: "04", title: "Claude antwortet auf Deutsch", desc: "Die KI empfängt die Daten und formuliert eine klare, verständliche Antwort mit formatierten Zahlen.", color: "#fbbf24" },
    ],
    archLabel: "Architektur:",
    archAfter: "bedeutet, dass Claude mehrere Tools in einer Antwort aufrufen kann, wenn die Frage kombinierte Daten benötigt.",
  },
}

export default de
