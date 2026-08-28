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
    work: "Work",
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
    /** The standalone /services page, which carries the full menu. */
    pageHeading: "Services",
    pageIntro:
      "The full menu. Bridal work is quoted per booking, since it depends on the look, the day, and how many people are being done. Message us to confirm your date.",
    pageOutro:
      "Not sure which you need? Message us and we will talk it through.",
    seeAllLabel: "See all services",
    /**
     * Shown wherever prices appear. They are the salon's own rates now, so
     * this no longer calls them guides — but bridal is still quoted per
     * booking, which is what the visitor needs to know before messaging.
     */
    priceGuideNote: "Bridal is quoted per booking — message us to confirm",
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
     * Used while hours.verified is false. The section shows no schedule then,
     * so promising "Hours" in the heading is a heading writing a cheque the
     * section cannot cash.
     */
    headingUnverified: "Find us",
    /**
     * hours.verified is false, so no schedule renders. Written as an
     * invitation rather than an apology: messaging genuinely is how you get
     * a straight answer about a specific day, which is the whole product.
     */
    unverifiedLead: "Message us to confirm timings",
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

  chat: {
    /** Launcher and panel are the same control; the label says what opens. */
    launch: "Chat with us",
    close: "Close chat",
    title: "Booking assistant",
    subtitle: "Typically replies instantly",
    reset: "Reset",
    resetAria: "Start a new conversation",
    placeholder: "Type a message",
    send: "Send",
    /**
     * Names the salon so the first line of the conversation confirms the
     * visitor reached the right business, and suggests openers — an empty
     * chat box gets far fewer messages than a prompted one.
     */
    greeting: (salonName: string) =>
      `Assalam o Alaikum, and welcome to ${salonName}. Ask me about services, ` +
      `prices or timings \u2014 or say \u201cbook bridal makeup\u201d.`,
    /** Shown in the transcript when the request fails. Never a bare "Error". */
    unreachable:
      "Could not reach the salon just now. Please try again in a moment, or message us on WhatsApp.",
  },

  portfolio: {
    heading: "Our work",
    /** Sits under the heading; the work is the argument, so keep it short. */
    intro: "Bridal, party and colour work from the salon.",
    filterAllLabel: "All",
    filterGroupLabel: "Filter work by type",
    /** Lightbox controls. */
    openLabel: (name: string) => `View ${name} larger`,
    closeLabel: "Close",
  },

  meetSonia: {
    heading: "Meet Sonia",
    /** Falls back to the salon name if the owner's name is ever unset. */
    headingFor: (owner: string) => `Meet ${owner.split(" ")[0]}`,
  },

  testimonials: {
    heading: "What brides say",
  },

  beforeAfter: {
    heading: "Before & after",
    beforeLabel: "Before",
    afterLabel: "After",
  },

  instagram: {
    /**
     * Deliberately NOT "Latest posts". This is a static export with no
     * Instagram API — these are hand-picked local files that will not update
     * themselves, and a "latest" label would be a lie the day after launch.
     */
    heading: "Selected work from Instagram",
    followLabel: "Follow on Instagram",
    /** Composed from the two confirmed profile numbers, nothing invented. */
    stats: (followers: string, posts: string) =>
      `${followers} followers · ${posts} posts`,
  },

  cinematic: {
    /**
     * The scroll cue under the salon name. One word: the chevron carries the
     * direction, and anything longer competes with the name above it.
     */
    scrollCue: "Scroll",

    booking: {
      /** The station where the walk stops and the visitor is asked to act. */
      heading: "Book your date",
      /**
       * While the WhatsApp number is unset the pill is inert, so the chat
       * widget is the only route that actually reaches the salon. This names
       * it rather than leaving a dead button as the only visible option.
       */
      chatLabel: "Ask the booking assistant",
    },
  },

  footer: {
    instagram: "Instagram",
    facebook: "Facebook",
    /** Column headings. Link destinations all exist; none are invented. */
    exploreHeading: "Explore",
    servicesHeading: "Services",
    contactHeading: "Contact",
    seeAllServices: "All services",
    emailLabel: "Email",
    /** Shown only while the WhatsApp number is unset. Auto-hides once it is. */
    demoNotice: "Demo build — WhatsApp number not yet connected",
  },
} as const;
