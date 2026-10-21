import type { Dictionary } from "./en"

const de: Dictionary = {
  nav: {
    home: "Startseite",
    services: "Leistungen",
    work: "Projekte",
    experience: "Erfahrung",
    network: "Netzwerk",
    contact: "Kontakt",
    cta: "Loslegen",
  },
  navbar: {
    projectsLabel: "Projekte",
    toggleLanguage: "Sprache",
    toggleTheme: "Design umschalten",
    toggleMenu: "Menü umschalten",
    toggleSubmenu: "Untermenü umschalten",
  },
  hero: {
    badge: "Full-Service-Digitalagentur",
    title: "Wir bauen die Produkte,\ndie Ihr Geschäft voranbringen",
    subtitle:
      "KI-gestützte Automatisierung ist unsere Kernkompetenz — ergänzt durch Full-Stack-Software, E-Commerce und Markenidentität, damit Ihr Unternehmen startet, skaliert und die Konkurrenz hinter sich lässt.",
    cta1: "Unsere Leistungen entdecken",
    cta2: "Kontakt",
    scrollHint: "Zum Erkunden scrollen",
  },
  services: {
    title: "Was wir bauen",
    subtitle:
      "End-to-End-Lösungen, die KI-Intelligenz mit Workflow-Automatisierung kombinieren — entwickelt, um stundenlange Handarbeit zu ersetzen.",
    categories: [
      {
        id: "ai-automation",
        title: "KI & Automatisierung",
        description:
          "Autonome Agenten, visuelle Workflow-Automatisierung und die Strategie, die beides verbindet — wir entwerfen und deployen KI-Systeme, die Ihrem Team repetitive Arbeit abnehmen.",
        tag: "Kern",
      },
      {
        id: "software-dev",
        title: "Software- & Webentwicklung",
        description:
          "Full-Stack-Anwendungen mit modernem Tooling, vom ersten Prototyp bis zur Produktion in Tagen. Wir entwerfen, entwickeln und deployen Software schnell, ohne Abstriche bei der Qualität.",
        tag: "Engineering",
      },
      {
        id: "ecommerce",
        title: "E-Commerce",
        description:
          "Individuelle Online-Shops für jede Branche — Produktkataloge, sicherer Checkout und genau die Abonnement-, Buchungs- oder Lagerfunktionen, die Ihr Geschäft braucht.",
        tag: "Neu",
      },
      {
        id: "brand-launch",
        title: "Markenidentität & Unternehmensstart",
        description:
          "Logodesign, Namensfindung und ein vollständiges visuelles Identitätssystem, kombiniert mit einer professionellen Website — alles, was ein neues Unternehmen braucht, um von Tag eins an seriös aufzutreten.",
        tag: "Neu",
      },
    ],
  },
  servicesPage: {
    header: "Unsere Leistungen",
    title: "Vier Disziplinen, ein Team",
    subtitle:
      "KI und Automatisierung, Software- und Webentwicklung, E-Commerce und Markenidentität — entdecken Sie unten, was jede Disziplin umfasst.",
    categories: [
      {
        id: "ai-automation",
        label: "KI & Automatisierung",
        title: "Intelligenz, die arbeitet, während Sie schlafen",
        description:
          "Von autonomen Agenten, die reale Aufgaben übernehmen, bis zu visuellen Workflows, die Ihrem Team Routinearbeit abnehmen — wir entwerfen KI-Systeme, die für den produktiven Einsatz gebaut sind, nicht für die Demo.",
        items: [
          {
            title: "KI-Agenten & Assistenten",
            description:
              "Autonome Agenten, die denken, recherchieren und handeln. RAG-Systeme beantworten Fragen aus Ihrer eigenen Wissensdatenbank, konversationelle Assistenten übernehmen Support und Vertriebsqualifizierung auf Ihrer Website, in Slack oder WhatsApp, und Recherche-Agenten durchsuchen das Web und schreiben Berichte — alles ohne manuellen Aufwand.",
            tags: ["LangChain", "Claude AI", "GPT-4", "RAG"],
          },
          {
            title: "Workflow-Automatisierung (n8n)",
            description:
              "Visuelle Workflows, die Ihren gesamten Stack verbinden — Webhook-Trigger, KI-Verarbeitung, Datentransformationen, Datenbank-Schreibvorgänge und Benachrichtigungen in einem Canvas, durchgängig und ohne manuellen Aufwand.",
            tags: ["n8n", "Webhooks", "REST APIs", "PostgreSQL"],
          },
          {
            title: "KI- & Machine-Learning-Integration",
            description:
              "Wir integrieren KI direkt in Ihre bestehenden Web- und Datensysteme — prädiktive Prognosen, die maschinelles Lernen mit stochastischen Modellen kombinieren, und generative KI-Funktionen auf Basis fortschrittlichen Prompt Engineerings.",
            tags: ["GenAI", "Machine Learning", "Predictive Models"],
          },
          {
            title: "KI-Strategie & Beratung",
            description:
              "Noch unsicher, wo KI in Ihrem Unternehmen ansetzt? Wir analysieren Ihre Workflows, identifizieren die wirkungsvollsten Automatisierungspotenziale und entwickeln die Roadmap — und bauen anschließend das System.",
            tags: ["Strategie", "Automatisierungs-Audit", "Roadmapping"],
          },
        ],
      },
      {
        id: "software-dev",
        label: "Software & Webentwicklung",
        title: "Vom Prototyp zur Produktion, schnell",
        description:
          "Full-Stack-Anwendungen mit modernem Tooling, schnell ausgeliefert — robuste Backends, saubere Datenpipelines und die Integrationen, die alles verbinden, was Sie bereits einsetzen.",
        items: [
          {
            title: "Full-Stack-Webentwicklung",
            description:
              "Durchgehende Webanwendungen — Frontend-UIs mit React, Next.js, Vue und modernem CSS, kombiniert mit robusten Backend-Architekturen in Python, Java, PHP, Laravel oder Spring Boot. Vom ersten Prototyp bis zur Produktion in Tagen, ohne Abstriche bei der Qualität.",
            tags: ["React", "Next.js", "Python", "Laravel"],
          },
          {
            title: "Data Engineering",
            description:
              "Data Warehouses und Data Lakes, die mitwachsen, mit Pipelines über Dagster und AWS. Wir entwickeln die Datenmodelle und verwalten die Datenbanken — PostgreSQL, MySQL, MongoDB —, auf denen Ihre Anwendungen und Dashboards laufen.",
            tags: ["Dagster", "AWS", "PostgreSQL", "MongoDB"],
          },
          {
            title: "Systemintegration",
            description:
              "Sichere Verbindungen zwischen Ihren Systemen und den Plattformen, die Sie bereits nutzen — RESTful APIs, OAuth 2.0 und direkte Integrationen mit Shopify, Shopware, Meta und Google Analytics.",
            tags: ["REST APIs", "OAuth 2.0", "Shopify", "Meta"],
          },
          {
            title: "Schnelle Bereitstellung",
            description:
              "Moderne CI/CD-Pipelines und Infrastruktur, die Ihr Produkt schnell vor echte Nutzer bringt — vom ersten Commit bis zum produktionsreifen Release, ohne den üblichen Engineering-Aufwand.",
            tags: ["CI/CD", "Cloud-Infrastruktur", "DevOps"],
          },
        ],
      },
      {
        id: "ecommerce",
        label: "E-Commerce",
        title: "Online-Shops, die verkaufen",
        description:
          "Individuelle Storefronts für jede Branche — Produktkataloge, sicherer Checkout und Zahlungsabwicklung, Bestands- und Auftragsverwaltung und genau die Funktionen, die Ihr Geschäft zum Online-Verkauf braucht.",
        items: [
          {
            title: "Individuelle Storefronts",
            description:
              "Ein Shop, der um Ihre Produkte und Ihre Marke gebaut ist — kein generisches Theme. Responsives Design, schnelle Ladezeiten und ein Einkaufserlebnis, zugeschnitten auf Ihre Branche — Fashion, Food oder alles dazwischen.",
            tags: ["Jede Branche", "Individuelles Design"],
          },
          {
            title: "Sicherer Checkout & Zahlungsabwicklung",
            description:
              "Reibungsloser Checkout mit den Zahlungsmethoden, denen Ihre Kunden bereits vertrauen — Kartenzahlung, digitale Wallets und lokale Optionen —, PCI-konform und auf minimale Kaufabbrüche ausgelegt.",
            tags: ["Sichere Zahlungen", "Checkout"],
          },
          {
            title: "Bestands- & Auftragsverwaltung",
            description:
              "Lagerbestände in Echtzeit, automatisierte Auftragsabwicklung und Dashboards, die zeigen, was sich verkauft — damit Sie weniger Zeit mit Tabellen und mehr Zeit mit Wachstum verbringen.",
            tags: ["Lagerverwaltung", "Auftragsverwaltung"],
          },
          {
            title: "Abonnements, Buchungen & Marktplätze",
            description:
              "Die Funktionen, die Ihren Shop einzigartig machen — wiederkehrende Abonnements, Termin- oder Tischbuchungen, oder ein vollständiger Multi-Vendor-Marktplatz, auf dem andere Verkäufer neben Ihnen anbieten.",
            tags: ["Abonnements", "Buchungen", "Individuelle Funktionen"],
          },
        ],
      },
      {
        id: "brand-launch",
        label: "Markenstart",
        title: "Starten Sie mit echter Identität",
        description:
          "Logodesign und Namensfindung, ein vollständiges visuelles Identitätssystem und eine professionelle Website — alles, was ein neues Unternehmen braucht, um von Tag eins an seriös aufzutreten.",
        items: [
          {
            title: "Logodesign & Namensfindung",
            description:
              "Ein Name, der zu Ihrem Unternehmen passt, und ein Logo, das überall funktioniert — Visitenkarten, App-Icons, Social-Profile —, entworfen, um auf den ersten Blick im Gedächtnis zu bleiben und sich in Ihrem Markt abzuheben.",
            tags: ["Namensfindung", "Logodesign"],
          },
          {
            title: "Visuelles Identitätssystem",
            description:
              "Ein vollständiges Set an Markenrichtlinien — Farbpalette, Typografie, Bildsprache und Nutzungsregeln —, damit jedes Stück Marketing, das Sie veröffentlichen, aus einem Guss wirkt.",
            tags: ["Markenrichtlinien", "Typografie"],
          },
          {
            title: "Professionelle Website",
            description:
              "Eine durchdachte, responsive Website, die Ihr Unternehmen vorstellt und Besucher in Kunden verwandelt — aufgebaut auf demselben Identitätssystem, live und bereit, bevor Sie Ihre Türen öffnen.",
            tags: ["Individuelle Funktionen", "Responsive Design"],
          },
        ],
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
  workShowcase: {
    header: "Unsere Projekte",
    title: "Was wir bauen",
    subtitle: "Echte Projekte, Live-Demos und die Fähigkeiten hinter jedem Auftrag.",
    sections: {
      capabilities: {
        label: "Fähigkeiten",
        title: "Kernkompetenzen",
        description: "Umfassende Softwareentwicklung, von robusten Backends und Data Lakes bis hin zu modernen Frontends und KI-Integration.",
        items: [
          {
            tag: "Web Dev",
            title: "Webentwicklung",
            description: "Entwicklung kompletter, durchgehender Webanwendungen. Design von Frontend-UIs mit HTML/CSS, React, Vue, Next.js und Bootstrap. Entwicklung von Backend-Architekturen mit Python, Java, PHP, C, C#, Laravel und SpringBoot.",
          },
          {
            tag: "Daten",
            title: "Data Engineering",
            description: "Design und Aufbau von Data Warehouses und Data Lakes. Verwaltung von Pipelines mit Dagster und AWS. Aufbau komplexer Datenmodelle und Verwaltung von Datenbanken wie PostgreSQL, MySQL und MongoDB.",
          },
          {
            tag: "KI / ML",
            title: "KI & Maschinelles Lernen",
            description: "Integration von KI in Web- und Datensysteme. Entwicklung prädiktiver Prognosesysteme durch Kombination von ML und stochastischen Modellen. Erstellung generativer KI-Anwendungen mit fortschrittlichem Prompt Engineering.",
          },
          {
            tag: "Integration",
            title: "Systemintegration",
            description: "Programmierung von Schnittstellen und sichere Anbindung von Drittsystemen über RESTful APIs und OAuth 2.0. Integration weit verbreiteter Plattformen wie Shopify, Shopware, Meta und Google Analytics.",
          },
        ]
      },
      dashboards: {
        label: "Dashboards",
        title: "Daten-Dashboards",
        description: "Interaktive Analytics-Interfaces mit Live-Diagrammen, KPI-Tracking und KI-gestützten Analyse-Panels.",
        items: [
          {
            tag: "Live-Demo",
            title: "KI-gestütztes Sales-Dashboard",
            description: "Ein vollständiges Analytics-Dashboard mit KPI-Karten, Umsatztrends, Bestellübersichten, Produkt-Rankings, einem KI-Chatbot für Datenbankabfragen und einem Claude KI-Insights-Panel.",
            cta: "Live-Demo ansehen",
          }
        ]
      },
      saas: {
        label: "SaaS",
        title: "SaaS-Plattformen",
        description: "Multi-Tenant-Plattformen mit rollenbasierter Zugriffskontrolle, Abonnements und benutzerdefinierten Domains.",
        items: [
          {
            tag: "Multi-Tenant",
            title: "Barber Shop SaaS",
            description: "Eine Multi-Tenant-SaaS-Plattform für Friseursalons auf Unternehmensniveau. Entwickelt mit Next.js, Supabase und PostgreSQL mit Row-Level Security (RLS). Bietet Mehrfachrollen und Abonnementpläne.",
          }
        ]
      },
      aiAgents: {
        label: "KI-Agenten",
        title: "KI-Agenten & Assistenten",
        description: "Autonome Systeme und konversationelle Agenten, die denken, Daten abrufen und für Sie handeln — rund um die Uhr.",
        items: [
          {
            tag: "KI-Agenten",
            title: "RAG Wissenssysteme",
            description: "Retrieval-Augmented Generation, die Ihre private Wissensdatenbank mit einem LLM verbindet. Stellen Sie Fragen in natürlicher Sprache und erhalten Sie präzise Antworten aus Ihren eigenen Daten.",
          },
          {
            tag: "KI-Agenten",
            title: "Chatbots & Assistenten",
            description: "Konversationelle Agenten für Support, Sales-Qualifizierung und Onboarding — live auf Ihrer Website, in Slack oder WhatsApp — 24/7.",
          },
          {
            tag: "KI-Agenten",
            title: "Research-Agenten",
            description: "Autonome Agenten, die das Web durchsuchen, Daten aggregieren, Berichte erstellen und Erkenntnisse liefern — auf Abruf, ohne manuellen Aufwand.",
          }
        ]
      },
      automation: {
        label: "Automatisierung",
        title: "Workflow-Automatisierung",
        description: "End-to-End-Pipelines, die Ihren gesamten Stack verbinden — durch Ereignisse ausgelöst, mit KI angereichert und vollautomatisch ausgeführt.",
        items: [
          {
            tag: "Automatisierung",
            title: "n8n Workflow-Automatisierung",
            description: "Visuelle Workflows, die Ihren gesamten Stack verbinden — API-Trigger, KI-Verarbeitung, Datentransformationen, Datenbankeinträge und Benachrichtigungen in einer Ansicht.",
          }
        ]
      }
    }
  },
  experience: {
    title: "Erfahrung & Ausbildung",
    subtitle: "Full-Stack Developer & Data Engineer mit Sitz in Wiesbaden.",
    items: [
      {
        year: "04/2026",
        title: "Develop Generative AI Applications: Get Started",
        company: "IBM Skills Network",
        description:
          "Erfolgreicher Abschluss eines von IBM autorisierten und über Coursera angebotenen Online-Kurses. Erlernung von Grundlagen und praktischen Ansätzen zur Entwicklung generativer KI-Anwendungen.",
        link: "https://coursera.org/verify/SEXN3DTP7GGC",
        tags: ["Generative KI", "IBM", "Coursera", "KI-Anwendungen"],
      },
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
  meta: {
    home: {
      title: "Startseite",
      description: "Wir bauen die Produkte, die Ihr Geschäft voranbringen",
    },
    services: {
      title: "Leistungen",
      description:
        "KI und Automatisierung, Software- und Webentwicklung, E-Commerce und Markenidentität — das gesamte Leistungsspektrum von Silicortex.",
    },
    work: {
      title: "Projekte",
      description: "KI-Agenten, Automatisierungs-Workflows und Dashboards von Silicortex.",
    },
    experience: {
      title: "Erfahrung",
      description: "Technische Exzellenz in KI, Automatisierung und Full-Stack-Entwicklung.",
    },
    network: {
      title: "Netzwerk",
      description:
        "Werden Sie Teil des Silicortex-Freelance-Netzwerks. Arbeiten Sie remote an hochwertigen KI- und Automatisierungsprojekten.",
    },
    contact: {
      title: "Kontakt",
      description: "Nehmen Sie Kontakt mit Silicortex auf, um Ihr Projekt zu starten.",
    },
  },
  notFound: {
    title: "Diese Seite existiert nicht",
    description: "Der Link ist möglicherweise veraltet oder die Adresse leicht fehlerhaft.",
    backHome: "Zurück zur Startseite",
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
    archFlow: [
      { type: "text", value: "Browser → " },
      { type: "code", value: "/api/chat" },
      { type: "text", value: " (Next.js-Server) → Claude mit 3 Tools (" },
      { type: "code", value: "query_sales_by_period" },
      { type: "text", value: ", " },
      { type: "code", value: "query_product_performance" },
      { type: "text", value: ", " },
      { type: "code", value: "query_kpis" },
      { type: "text", value: ") → Mock-Datenbank → Claude formuliert die Antwort → Browser." },
    ],
    archLoop: [
      { type: "text", value: "Die " },
      { type: "strong", value: "agentic loop" },
      { type: "text", value: " bedeutet, dass Claude mehrere Tools in einer Antwort aufrufen kann, wenn die Frage kombinierte Daten benötigt." },
    ],
    kpiOverview: { label: "Kennzahlen", title: "KPI-Übersicht" },
    revenueTrends: { label: "Umsatz", title: "Umsatztrends" },
    orderAnalytics: { label: "Bestellanalyse", title: "Bestellungen & Vergleiche" },
    productPerformance: { label: "Produktleistung", title: "Produkte & Korrelationen" },
    transactions: { label: "Transaktionen", title: "Transaktionsverlauf" },
    rawData: { label: "Rohdaten", title: "Vollständiger Datensatz" },
    aiInsightsHeader: { label: "KI", title: "KI-gestützte Einblicke" },
    chatbotHeader: { label: "KI-Chatbot", title: "Fragen Sie Ihre Verkaufsdaten" },
    chatbot: {
      greeting: "Hallo! Ich analysiere die Verkaufsdaten von Silicortex für 2025. Fragen Sie mich nach Umsatz, Bestellungen, Top-Plänen, KPIs oder Monatstrends — probieren Sie unten einen Vorschlag aus.",
      suggestions: [
        "Wie hoch war Luminas Gesamtumsatz in Q4 2025?",
        "Welcher Plan bringt den meisten Umsatz?",
        "Wie schnitt November im Vergleich zu Oktober ab?",
        "Wie hoch sind Abwanderungsrate und Customer LTV?",
      ],
      fallback: "Gute Frage! In einer echten Produktivumgebung würde ich die Live-Datenbank abfragen und Ihnen anhand der Daten eine präzise Antwort geben. Probieren Sie für diese Demo einen der Vorschlags-Chips unten aus, um Beispielantworten zu sehen.",
      responses: [
        {
          keywords: ["q4", "last 3", "last three", "october", "november", "december", "oct", "nov", "dec"],
          response: "Im Q4 2025 (Okt.–Dez.) erzielte Silicortex **$449,200** Umsatz bei **6,210 Bestellungen**. Oktober trug $138,200 bei, November war mit $162,400 der stärkste Monat dank eines Black-Friday-Spikes ($52,400 in einer Woche), und Dezember schloss mit $148,600 ab. Das ist ein Anstieg von +38% gegenüber dem Q3-Umsatz von $324,600.",
        },
        {
          keywords: ["product", "plan", "best", "top", "revenue", "subscription", "pro", "enterprise", "starter", "business"],
          response: "Der **Pro Plan (€149/Monat)** ist mit $486,200 Umsatz aus 3,263 Abonnements 2025 der Top-Performer von Lumina. Der Business Plan (€399/Monat) liegt mit $412,800 aus 1,034 Kunden auf Platz zwei. Zusammen machen sie 69% des Gesamtumsatzes aus. Enterprise (€1,200/Monat) trägt $228,400 von nur 190 Kunden bei — der höchste Umsatz pro Kunde bei €1,200/Monat.",
        },
        {
          keywords: ["november", "october", "compare", "vs", "versus", "month"],
          response: "November übertraf Oktober deutlich: Der Umsatz stieg von $138,200 auf $162,400 (**+18%**), und die Bestellungen stiegen von 1,912 auf 2,242 (+17%). Haupttreiber war die Black-Friday-Woche (19.–25. Nov.), die allein $52,400 generierte — fast das Dreifache einer typischen Woche. Auch die Neukundengewinnung legte zu: 386 im November gegenüber 324 im Oktober (+19%).",
        },
        {
          keywords: ["churn", "ltv", "lifetime", "retention", "repeat", "loyal"],
          response: "Die Abwanderungsrate von Lumina liegt bei **1,6%** — exzellent für B2B-SaaS, wo der Branchendurchschnitt bei 3–5% liegt. Der Customer LTV liegt bei $620 bei einer Wiederkaufrate von 71%, was auf eine sehr starke Kundenbindung hinweist. Bei der aktuellen JoJ-Wachstumsrate von +18,4% mit 3,040 Neukunden in 2025 wächst die Umsatzbasis gesund.",
        },
        {
          keywords: ["conversion", "rate", "funnel", "lead", "signup"],
          response: "Die Konversionsrate von Lumina liegt bei **4,1%** — ein Plus von +0,4pp im Jahresvergleich. Mit 18,048 Bestellungen bei geschätzt 410,000 monatlichen Besuchern liegt der Funnel über den SaaS-Benchmarks (typischerweise 2–5%). Der Pro Plan ist der häufigste Einstiegspunkt; eine verbesserte Trial-zu-Paid-Conversion beim Business Plan könnte den größten Umsatzschub bringen.",
        },
        {
          keywords: ["growth", "yoy", "year", "annual", "2025", "total"],
          response: "Silicortex wuchs 2025 im Jahresvergleich um **+18,4%** und erreichte $1,302,400 Gesamtumsatz bei 18,048 Bestellungen. H2 ($773,800) übertraf H1 ($528,600) um 46%, getrieben von einem starken Q4. Die Neukundengewinnung wuchs um +22,6% auf 3,040, während die Abwanderungsrate auf 1,6% sank — ein Zeichen starker Net Revenue Retention.",
        },
        {
          keywords: ["new customer", "acquisition", "acquire", "onboard"],
          response: "Lumina gewann 2025 **3,040 Neukunden** — ein Plus von +22,6% gegenüber 2024. Die stärksten Monate für Neukundengewinnung waren November (386 Neukunden) und Oktober (324), was mit den B2B-Jahresendbudgets zusammenfällt. Feb. war mit 142 Neukunden der schwächste Monat — ein guter Ansatzpunkt für eine Winter-Onboarding-Kampagne.",
        },
      ],
    },
  },
}

export default de
