import type { LegalContent } from "./types"

// Translation of de.ts. The German version is the legally binding one.

const en: LegalContent = {
  impressum: {
    title: "Legal Notice",
    updated: "Last updated: October 2026",
    note: "This is a courtesy translation. The German version (Impressum) is the legally binding one.",
    sections: [
      {
        heading: "Information pursuant to § 5 DDG (German Digital Services Act)",
        lines: ["Mohamad Katramez", "Silicortex (sole proprietorship)", "Eberleinstraße 46", "65195 Wiesbaden", "Germany"],
      },
      {
        heading: "Contact",
        lines: ["Phone: +49 174 6197197", "Email: mohamadkatramez98@gmail.com"],
      },
      {
        heading: "VAT identification number",
        paragraphs: ["VAT ID pursuant to § 27a of the German VAT Act (UStG): DE464133329"],
      },
      {
        heading: "Professional activity",
        paragraphs: [
          "Freelance activity: software development, IT consulting and AI integration. Silicortex is the trade name of Mohamad Katramez's sole proprietorship; there is no commercial register entry.",
        ],
      },
      {
        heading: "Responsible for content pursuant to § 18 (2) MStV",
        lines: ["Mohamad Katramez", "Eberleinstraße 46", "65195 Wiesbaden"],
      },
      {
        heading: "Consumer dispute resolution",
        paragraphs: [
          "We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board (§ 36 VSBG).",
        ],
      },
      {
        heading: "Liability for content",
        paragraphs: [
          "The content of this website has been created with the greatest care. However, we cannot guarantee that it is accurate, complete or up to date. As a service provider we are responsible for our own content on these pages under general law (§ 7 (1) DDG). Under §§ 8 to 10 DDG we are not obliged to monitor transmitted or stored third-party information or to investigate circumstances indicating illegal activity. Obligations to remove or block the use of information under general law remain unaffected; liability in this respect is only possible from the moment we become aware of a specific infringement. We will remove such content immediately upon becoming aware of it.",
        ],
      },
      {
        heading: "Liability for links",
        paragraphs: [
          "This website contains links to external third-party websites over whose content we have no influence, and for which we therefore cannot accept any liability. The respective provider or operator is always responsible for the content of linked pages. The linked pages were checked for possible legal violations at the time of linking; no illegal content was identifiable at that time. We will remove such links immediately upon becoming aware of an infringement.",
        ],
      },
      {
        heading: "Copyright",
        paragraphs: [
          "The content and works created by the site operator on these pages are subject to German copyright law. Reproduction, editing, distribution and any kind of use beyond the limits of copyright law require the written consent of the respective author or creator. Downloads and copies of this site are permitted for private, non-commercial use only. Where content on this site was not created by the operator, the copyrights of third parties are respected.",
        ],
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: October 2026",
    note: "This is a courtesy translation. The German version (Datenschutzerklärung) is the legally binding one.",
    sections: [
      {
        heading: "1. Controller",
        paragraphs: ["The controller within the meaning of the General Data Protection Regulation (GDPR) is:"],
        lines: [
          "Mohamad Katramez (Silicortex)",
          "Eberleinstraße 46",
          "65195 Wiesbaden, Germany",
          "Phone: +49 174 6197197",
          "Email: mohamadkatramez98@gmail.com",
        ],
      },
      {
        heading: "2. Overview",
        paragraphs: [
          "This website is an information and contact site. It uses no tracking cookies, no advertising tracking and no social media plugins, and it embeds no third-party content that would transmit your data on page load (fonts are served from our own server). Personal data is processed only to the extent required for the technical operation of the website and for handling your enquiries. The following sections explain which data is processed and for what purpose.",
        ],
      },
      {
        heading: "3. Hosting (Vercel)",
        paragraphs: [
          "This website is hosted by Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA. When a page is requested, Vercel necessarily processes the data your browser transmits: IP address, date and time of access, page requested, referrer URL, browser type and operating system. This data is processed in server logs in order to deliver the website, to ensure its stability and security and to defend against attacks.",
          "The legal basis is Art. 6 (1) (f) GDPR (legitimate interest in the secure and reliable operation of the website). A data processing agreement pursuant to Art. 28 GDPR is in place with Vercel. Vercel is certified under the EU-U.S. Data Privacy Framework; transfers to the USA are based on the European Commission's adequacy decision (Art. 45 GDPR).",
        ],
        link: { label: "Vercel privacy policy", href: "https://vercel.com/legal/privacy-policy" },
      },
      {
        heading: "4. Audience measurement (Vercel Web Analytics and Speed Insights)",
        paragraphs: [
          "To measure usage and loading performance we use Vercel Web Analytics and Vercel Speed Insights. Both services work without cookies and without cross-device identifiers: they collect aggregated metrics such as page views, referrers, country, device type and loading times. The IP address is used to derive an approximate location and is not stored permanently; a visitor is grouped only for the duration of one session by means of a non-reversible hash computed from the request.",
          "The legal basis is Art. 6 (1) (f) GDPR (legitimate interest in improving and monitoring the performance of the website). Because no information is stored on or read from your device, no consent under § 25 TDDDG is required.",
        ],
      },
      {
        heading: "5. Contact form",
        paragraphs: [
          "If you write to us via the contact form, the data you enter (name, company if given, email address, message) is sent to our own server at Vercel (see section 3) and from there as an email to our mailbox. For sending that email we use the service Resend (Plus Five Five, Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA). Resend processes the message content and your email address as the reply-to address and keeps delivery logs for a limited period; nothing is stored on our server. We use the data solely to handle your enquiry and any follow-up questions.",
          "The legal basis is Art. 6 (1) (b) GDPR (pre-contractual steps taken at your request) or Art. 6 (1) (f) GDPR (legitimate interest in answering enquiries). A data processing agreement pursuant to Art. 28 GDPR is in place with Resend; Resend is certified under the EU-U.S. Data Privacy Framework, and transfers to the USA are based on the European Commission's adequacy decision (Art. 45 GDPR), supplemented by the EU Standard Contractual Clauses. We delete enquiries once they have been fully dealt with and no statutory retention obligation applies. You can always reach us by email or phone instead.",
        ],
        link: { label: "Resend privacy policy", href: "https://resend.com/legal/privacy-policy" },
      },
      {
        heading: "6. Contact by email, phone or WhatsApp",
        paragraphs: [
          "If you contact us by email, phone or via the WhatsApp number on our business card, we process your details in order to handle the enquiry (Art. 6 (1) (b) or (f) GDPR). For WhatsApp messages, WhatsApp Ireland Limited (Meta) additionally processes communication metadata under its own privacy terms; message content is end-to-end encrypted. Please use email or phone if you prefer not to.",
        ],
      },
      {
        heading: "7. Cookies and local storage",
        paragraphs: [
          "This website sets exactly one cookie: \"silicortex-lang\" remembers your language choice (German, English or Arabic) for twelve months so that your next visit opens in that language. In addition, the browser's local storage (\"localStorage\") remembers your choice between the light and dark design. Both are strictly necessary for the function you requested (§ 25 (2) no. 2 TDDDG), are not shared with third parties and are not used for tracking. No consent is therefore required and no cookie banner is shown.",
        ],
      },
      {
        heading: "8. Fonts, downloads and external links",
        paragraphs: [
          "The fonts used (Geist, Readex Pro) are served from our own server; no connection to Google Fonts or any other font provider is established when you visit this website.",
          "The business card (PDF) offered on the contact page is a static file; downloading it generates only the server log data described in section 3.",
          "Links to LinkedIn, GitHub and X are plain links without embedded plugins. Data is transmitted to the respective provider only when you click such a link, and that provider's privacy terms then apply.",
        ],
      },
      {
        heading: "9. Encryption",
        paragraphs: [
          "This website uses TLS encryption (HTTPS) throughout, so data you send to us cannot be read by third parties in transit.",
        ],
      },
      {
        heading: "10. Your rights",
        paragraphs: ["With regard to your personal data you have the following rights:"],
        list: [
          "Access to the data processed (Art. 15 GDPR)",
          "Rectification of inaccurate data (Art. 16 GDPR)",
          "Erasure (Art. 17 GDPR) and restriction of processing (Art. 18 GDPR)",
          "Data portability (Art. 20 GDPR)",
          "Objection to processing based on Art. 6 (1) (f) GDPR (Art. 21 GDPR)",
          "Withdrawal of consent with effect for the future (Art. 7 (3) GDPR)",
          "Complaint to a data protection supervisory authority (Art. 77 GDPR). The authority responsible for us is the Hessian Commissioner for Data Protection and Freedom of Information, Wiesbaden (datenschutz.hessen.de). You may also contact the authority at your place of residence.",
        ],
      },
      {
        heading: "11. No automated decision-making",
        paragraphs: ["No automated decision-making, including profiling, within the meaning of Art. 22 GDPR takes place."],
      },
      {
        heading: "12. Changes",
        paragraphs: [
          "We will update this privacy policy whenever the website or the legal situation changes. The version published here applies.",
        ],
      },
    ],
  },
}

export default en
