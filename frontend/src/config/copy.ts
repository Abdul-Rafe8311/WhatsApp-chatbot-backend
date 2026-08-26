/**
 * Site chrome copy — labels, nav, and CTA text.
 *
 * `salon.ts` holds salon *data* (what the shared database will one day carry).
 * This file holds interface *copy*, so no user-visible string is hardcoded in
 * a component while `salon.ts` keeps the shape the client authored.
 *
 * Prefill register is set in CLAUDE.md: "Assalam o Alaikum, I'd like to book …"
 */
export const copy = {
  hero: {
    /**
     * One job: tell a bride she is in the right place. Names the city, and
     * "every day of your wedding" speaks to the four-event structure the
     * salon actually books against (mehndi, nikah, barat, walima).
     */
    headline: "Bridal makeup in Sargodha, for every day of your wedding.",
  },

  /** Joins salon.info.credentials[] into the hero credential line. */
  credentialSeparator: " · ",

  nav: {
    services: "Services",
    about: "About",
    hours: "Hours & Location",
  },

  cta: {
    /** CLAUDE.md: the label says what happens. Not "Get Started". */
    label: "Book on WhatsApp",
    generalPrefill: "Assalam o Alaikum, I'd like to book an appointment",
    servicePrefill: (serviceName: string) =>
      `Assalam o Alaikum, I'd like to book ${serviceName}`,
    /**
     * Every service CTA carries the same visible label, so the accessible
     * name has to distinguish them — otherwise a screen reader's link list
     * is thirteen identical "Book on WhatsApp" entries.
     */
    serviceAriaLabel: (serviceName: string) =>
      `Book ${serviceName} on WhatsApp`,
  },

  services: {
    heading: "Services",
    /**
     * Only Bridal carries a note, and only because its order is real
     * information: the four wedding days run in that sequence. Engagement
     * follows as a fifth item and is deliberately not claimed as part of it.
     */
    groupNotes: {
      Bridal: "The four wedding days, in the order they happen.",
    } as Partial<Record<string, string>>,
  },

  about: {
    heading: "About",
  },

  footer: {
    instagram: "Instagram",
    facebook: "Facebook",
    /** Shown only while the WhatsApp number is unset. Auto-hides once it is. */
    demoNotice: "Demo build — WhatsApp number not yet connected",
  },
} as const;
