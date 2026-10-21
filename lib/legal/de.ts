import type { LegalContent } from "./types"

// Die deutsche Fassung ist die verbindliche; en.ts und ar.ts sind Übersetzungen.
// Angaben nach § 5 DDG und § 18 Abs. 2 MStV. Der Link zur EU-Streitbeilegungs-
// plattform (OS-Plattform) fehlt bewusst: sie wurde zum 20. Juli 2025 durch
// die Verordnung (EU) 2024/3228 eingestellt.

const de: LegalContent = {
  impressum: {
    title: "Impressum",
    updated: "Stand: Oktober 2026",
    sections: [
      {
        heading: "Angaben gemäß § 5 DDG",
        lines: [
          "Mohamad Katramez",
          "Silicortex (Einzelunternehmen)",
          "Eberleinstraße 46",
          "65195 Wiesbaden",
          "Deutschland",
        ],
      },
      {
        heading: "Kontakt",
        lines: ["Telefon: +49 174 6197197", "E-Mail: mohamadkatramez98@gmail.com"],
      },
      {
        heading: "Umsatzsteuer-Identifikationsnummer",
        paragraphs: ["Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: DE464133329"],
      },
      {
        heading: "Berufliche Tätigkeit",
        paragraphs: [
          "Freiberufliche Tätigkeit: Softwareentwicklung, IT-Beratung und KI-Integration. Silicortex ist die Geschäftsbezeichnung des Einzelunternehmens von Mohamad Katramez; ein Handelsregistereintrag besteht nicht.",
        ],
      },
      {
        heading: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
        lines: ["Mohamad Katramez", "Eberleinstraße 46", "65195 Wiesbaden"],
      },
      {
        heading: "Verbraucherstreitbeilegung",
        paragraphs: [
          "Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).",
        ],
      },
      {
        heading: "Haftung für Inhalte",
        paragraphs: [
          "Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.",
        ],
      },
      {
        heading: "Haftung für Links",
        paragraphs: [
          "Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft; rechtswidrige Inhalte waren zu diesem Zeitpunkt nicht erkennbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.",
        ],
      },
      {
        heading: "Urheberrecht",
        paragraphs: [
          "Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet.",
        ],
      },
    ],
  },

  privacy: {
    title: "Datenschutzerklärung",
    updated: "Stand: Oktober 2026",
    sections: [
      {
        heading: "1. Verantwortlicher",
        paragraphs: ["Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:"],
        lines: [
          "Mohamad Katramez (Silicortex)",
          "Eberleinstraße 46",
          "65195 Wiesbaden, Deutschland",
          "Telefon: +49 174 6197197",
          "E-Mail: mohamadkatramez98@gmail.com",
        ],
      },
      {
        heading: "2. Überblick",
        paragraphs: [
          "Diese Website ist eine Informations- und Kontaktseite. Sie setzt keine Tracking-Cookies, kein Werbe-Tracking und keine Social-Media-Plugins ein, und sie bindet keine Inhalte Dritter ein, die beim Aufruf Ihre Daten übertragen würden (Schriftarten werden von unserem eigenen Server ausgeliefert). Personenbezogene Daten werden nur in dem Umfang verarbeitet, der für den technischen Betrieb der Website und für die Bearbeitung Ihrer Anfragen erforderlich ist. Nachfolgend erläutern wir im Einzelnen, welche Daten zu welchem Zweck verarbeitet werden.",
        ],
      },
      {
        heading: "3. Hosting (Vercel)",
        paragraphs: [
          "Diese Website wird bei Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA, gehostet. Beim Aufruf einer Seite verarbeitet Vercel technisch notwendig die von Ihrem Browser übermittelten Daten: IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite, Referrer-URL, Browsertyp und Betriebssystem. Diese Daten werden in Server-Logs verarbeitet, um die Website auszuliefern, ihre Stabilität und Sicherheit zu gewährleisten und Angriffe abzuwehren.",
          "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren und zuverlässigen Betrieb der Website). Mit Vercel besteht ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO. Vercel ist unter dem EU-U.S. Data Privacy Framework zertifiziert; die Übermittlung in die USA erfolgt auf Grundlage des Angemessenheitsbeschlusses der Europäischen Kommission (Art. 45 DSGVO).",
        ],
        link: { label: "Datenschutzerklärung von Vercel", href: "https://vercel.com/legal/privacy-policy" },
      },
      {
        heading: "4. Reichweitenmessung (Vercel Web Analytics und Speed Insights)",
        paragraphs: [
          "Zur Messung der Nutzung und der Ladegeschwindigkeit setzen wir Vercel Web Analytics und Vercel Speed Insights ein. Beide Dienste arbeiten ohne Cookies und ohne geräteübergreifende Identifikatoren: Es werden aggregierte Kennzahlen wie Seitenaufrufe, Referrer, Land, Gerätetyp und Ladezeiten erhoben. Die IP-Adresse wird zur Ableitung des ungefähren Standorts verwendet und nicht dauerhaft gespeichert; ein Besucher wird nur für die Dauer einer Sitzung über einen aus der Anfrage berechneten, nicht rückrechenbaren Hashwert zusammengefasst.",
          "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Verbesserung und Leistungsüberwachung der Website). Da keine Informationen auf Ihrem Endgerät gespeichert oder ausgelesen werden, ist keine Einwilligung nach § 25 TDDDG erforderlich.",
        ],
      },
      {
        heading: "5. Kontaktformular (Formspree)",
        paragraphs: [
          "Wenn Sie uns über das Kontaktformular schreiben, werden die von Ihnen eingegebenen Daten (Name, optional Firma, E-Mail-Adresse, Nachricht) sowie technisch Ihre IP-Adresse und der Zeitpunkt der Übermittlung an den Dienst Formspree übermittelt. Formspree, Inc. (USA) nimmt die Übermittlung entgegen und leitet sie an unsere E-Mail-Adresse weiter; die Nachricht wird zusätzlich im Formspree-Konto gespeichert. Wir verwenden die Daten ausschließlich zur Bearbeitung Ihrer Anfrage und für Anschlussfragen.",
          "Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen auf Ihre Anfrage hin) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung von Anfragen). Formspree verarbeitet die Daten in den USA; die Übermittlung erfolgt auf Grundlage der Datenschutzbestimmungen und der vertraglichen Garantien von Formspree. Wir löschen Anfragen, sobald sie abschließend bearbeitet sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Sie können uns alternativ jederzeit per E-Mail oder Telefon erreichen.",
        ],
        link: { label: "Datenschutzerklärung von Formspree", href: "https://formspree.io/legal/privacy-policy/" },
      },
      {
        heading: "6. Kontakt per E-Mail, Telefon oder WhatsApp",
        paragraphs: [
          "Wenn Sie uns per E-Mail, Telefon oder über die auf unserer Visitenkarte angegebene WhatsApp-Nummer kontaktieren, verarbeiten wir Ihre Angaben zur Bearbeitung der Anfrage (Art. 6 Abs. 1 lit. b oder lit. f DSGVO). Bei WhatsApp-Nachrichten verarbeitet zusätzlich WhatsApp Ireland Limited (Meta) Metadaten der Kommunikation nach eigenen Datenschutzbestimmungen; der Nachrichteninhalt ist Ende-zu-Ende-verschlüsselt. Nutzen Sie bitte E-Mail oder Telefon, wenn Sie das nicht möchten.",
        ],
      },
      {
        heading: "7. Cookies und lokale Speicherung",
        paragraphs: [
          "Diese Website setzt genau ein Cookie: „silicortex-lang“ speichert Ihre Sprachwahl (Deutsch, Englisch oder Arabisch) für zwölf Monate, damit Sie beim nächsten Besuch in der gewählten Sprache landen. Zusätzlich merkt sich der Browser in seinem lokalen Speicher („localStorage“) Ihre Wahl zwischen hellem und dunklem Design. Beide Angaben sind für die von Ihnen gewünschte Funktion unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG), werden nicht an Dritte übermittelt und dienen nicht der Nachverfolgung. Eine Einwilligung ist deshalb nicht erforderlich, und ein Cookie-Banner wird nicht angezeigt.",
        ],
      },
      {
        heading: "8. Schriftarten, Downloads und externe Links",
        paragraphs: [
          "Die verwendeten Schriftarten (Geist, Readex Pro) werden von unserem eigenen Server ausgeliefert; beim Aufruf dieser Website wird keine Verbindung zu Google Fonts oder anderen Schriftanbietern aufgebaut.",
          "Die auf der Kontaktseite angebotene Visitenkarte (PDF) ist eine statische Datei; beim Herunterladen fallen nur die unter Ziffer 3 beschriebenen Server-Logdaten an.",
          "Links zu LinkedIn, GitHub und X sind einfache Verweise ohne eingebettete Plugins. Erst wenn Sie einen solchen Link anklicken, werden Daten an den jeweiligen Anbieter übertragen; dort gelten dessen Datenschutzbestimmungen.",
        ],
      },
      {
        heading: "9. Verschlüsselung",
        paragraphs: [
          "Diese Website nutzt durchgehend eine TLS-Verschlüsselung (HTTPS). Daten, die Sie an uns übermitteln, können so von Dritten nicht mitgelesen werden.",
        ],
      },
      {
        heading: "10. Ihre Rechte",
        paragraphs: ["Ihnen stehen hinsichtlich Ihrer personenbezogenen Daten folgende Rechte zu:"],
        list: [
          "Auskunft über die verarbeiteten Daten (Art. 15 DSGVO)",
          "Berichtigung unrichtiger Daten (Art. 16 DSGVO)",
          "Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO)",
          "Datenübertragbarkeit (Art. 20 DSGVO)",
          "Widerspruch gegen Verarbeitungen, die auf Art. 6 Abs. 1 lit. f DSGVO beruhen (Art. 21 DSGVO)",
          "Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)",
          "Beschwerde bei einer Datenschutz-Aufsichtsbehörde (Art. 77 DSGVO). Für uns zuständig ist der Hessische Beauftragte für Datenschutz und Informationsfreiheit, Wiesbaden (datenschutz.hessen.de). Sie können sich auch an die Aufsichtsbehörde Ihres Wohnorts wenden.",
        ],
      },
      {
        heading: "11. Keine automatisierte Entscheidungsfindung",
        paragraphs: [
          "Es findet keine automatisierte Entscheidungsfindung einschließlich Profiling im Sinne von Art. 22 DSGVO statt.",
        ],
      },
      {
        heading: "12. Änderungen",
        paragraphs: [
          "Wir passen diese Datenschutzerklärung an, wenn sich die Website oder die Rechtslage ändert. Es gilt die jeweils hier veröffentlichte Fassung.",
        ],
      },
    ],
  },
}

export default de
