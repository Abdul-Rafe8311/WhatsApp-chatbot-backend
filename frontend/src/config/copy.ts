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
    /** Hours section: the question that section exists to answer. */
    hoursPrefill:
      "Assalam o Alaikum, I would like to ask about your timings",
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
    /**
     * Social proof line. The count and the badge state are salon data and
     * live in salon.ts — only the wording around them belongs here.
     * Rendered as a link so the claim is checkable rather than asserted.
     */
    socialProof: (followers: string) => `${followers} on Instagram`,
    verifiedLabel: "Verified",
  },

  hours: {
    heading: "Hours & Location",
    /**
     * hours.verified is false, so no schedule renders. Written as an
     * invitation rather than an apology: messaging genuinely is how you get
     * a straight answer about a specific day, which is the whole product.
     */
    unverifiedLead: "Call to confirm timings",
    unverifiedNote:
      "Timings shift through wedding season, and bridal bookings are taken by appointment. Message us and we will tell you exactly when we are free.",
    /** Only reachable once hours.verified flips to true. */
    closedLabel: "Closed",
  },

  location: {
    mapsLabel: "Open in Maps",
    /**
     * Derived from the address in salon.ts rather than stored — there is no
     * confirmed maps URL, and a search link built from the real address is
     * honest where a hand-pasted pin would be a guess.
     */
    mapsUrl: (address: string) =>
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(address),
  },

  theme: {
    /** Visible in the nav — short enough not to crowd the wordmark at 375px. */
    toDarkShort: "Dark",
    toLightShort: "Light",
    /** Accessible names — these say what pressing the button will do. */
    toDark: "Switch to dark theme",
    toLight: "Switch to light theme",
  },

  footer: {
    instagram: "Instagram",
    facebook: "Facebook",
    /** Shown only while the WhatsApp number is unset. Auto-hides once it is. */
    demoNotice: "Demo build — WhatsApp number not yet connected",
  },
} as const;
