/**
 * Single source of content for the public site.
 * Shaped to mirror the eventual shared database tables.
 *
 * Data marked CONFIRMED came from the salon's own Instagram/Facebook.
 * Data marked TODO is inferred and must be checked with the client
 * before this site is shown to anyone outside the team.
 *
 * Two rules components must honour:
 *   1. Never substitute a value for a null. A null means "not confirmed" —
 *      render the explicit unconfirmed state, never a plausible stand-in.
 *   2. Never build a wa.me deep link while info.isDemoNumber is true
 *      without the demo label showing.
 */

/** Rendered wherever a price is not confirmed. Never substitute a figure. */
export const PRICE_ON_REQUEST = "On request" as const;

export const salon = {
  info: {
    name: "Sonia's Makeup Salon",              // CONFIRMED
    owner: "Sonia Shabbir",                    // CONFIRMED (IG display name)
    tagline: "Bridal makeup, balayage expert, skin services", // CONFIRMED (their own FB description)
    city: "Sargodha",                          // CONFIRMED
    address: "108 Stadium Road, Sargodha, Punjab 40100", // TODO: street from a directory listing, postcode CONFIRMED
    email: "soniasmakeupsalon@yahoo.com",      // CONFIRMED

    // TODO: client to approve copy.
    about:
      "Sonia's Makeup Salon is a bridal salon in Sargodha. Sonia Shabbir " +
      "trained with Kashee's Official and Amina Raja Makeup Studio, and most " +
      "of the work here is bridal — mehndi, nikah, barat and walima, usually " +
      "booked as a full wedding week. The salon is also known for balayage, " +
      "hand-painted to suit your hair and skin tone.",

    // Demo phase: this is OUR test WhatsApp number, not the salon's.
    whatsappNumber: "92XXXXXXXXXX",            // TODO: our test number, digits only, no +
    isDemoNumber: true,

    instagram: "https://www.instagram.com/soniasmakeupsalon/",  // CONFIRMED
    instagramFollowers: "49.9K",                // CONFIRMED (read from profile)
    instagramVerified: true,                    // CONFIRMED (verified badge on profile)
    instagramPosts: "1,352",                    // CONFIRMED (post count on profile)
    facebook: "https://www.facebook.com/soniasmakeupsalon/",    // CONFIRMED

    credentials: [
      "Certified makeup artist, Pakistan",     // CONFIRMED
      "Trained by Kashee's Official and Amina Raja Makeup Studio", // CONFIRMED
    ],

    /**
     * Section imagery. Null renders <SalonImage>'s quiet placeholder — never
     * a broken <img>. Drop a file in public/images/ and set the path here;
     * alt text is required alongside it. See docs/design-plan.md §5.
     */
    heroImage: null as string | null,          // TODO: /images/hero-bridal.webp
    heroImageAlt: null as string | null,
    aboutImage: null as string | null,         // TODO: /images/about-sonia.webp
    aboutImageAlt: null as string | null,
    locationImage: null as string | null,      // TODO: /images/location-salon.webp
    locationImageAlt: null as string | null,

    parkingNote: "",                           // TODO: ask client
    paymentMethods: [],                        // TODO: ask client — likely Cash, Easypaisa, JazzCash
  },

  /**
   * Categories follow the salon's own Instagram highlights, which are
   * organised by wedding event rather than by product. Keep it that way —
   * a bride books for Barat, not for "Bridal Package B".
   *
   * Bridal order is the wedding timeline: Mehndi → Nikah → Barat → Walima.
   * That sequence is data, not presentation — the shared database will carry
   * the same order for the agent to read. Do not re-sort in a component.
   */
  services: [
    // ---- Bridal, by event, in wedding order ----
    {
      id: "mehndi",
      name: "Mehndi Makeup",
      category: "Bridal",
      featured: true,
      description: "Colourful mehndi-day makeup with floral jewellery styling.",
      priceMin: null,                          // TODO: ask client
      priceMax: null,
      priceNote: PRICE_ON_REQUEST,
      durationMinutes: null,                   // TODO: ask client
      image: null as string | null,
      imageAlt: null as string | null,
    },
    {
      id: "nikah",
      name: "Nikah Makeup",
      category: "Bridal",
      featured: true,
      description: "Understated bridal makeup and hair for the nikah ceremony.",
      priceMin: null,
      priceMax: null,
      priceNote: PRICE_ON_REQUEST,
      durationMinutes: null,
      image: null as string | null,
      imageAlt: null as string | null,
    },
    {
      id: "barat",
      name: "Barat Makeup",
      category: "Bridal",
      featured: true,
      description: "Full bridal makeup, hair styling and dupatta setting for the barat.",
      priceMin: null,
      priceMax: null,
      priceNote: PRICE_ON_REQUEST,
      durationMinutes: null,
      image: null as string | null,
      imageAlt: null as string | null,
    },
    {
      id: "walima",
      name: "Walima Makeup",
      category: "Bridal",
      featured: true,
      description: "Softer, camera-ready bridal look with hair styling for the walima.",
      priceMin: null,
      priceMax: null,
      priceNote: PRICE_ON_REQUEST,
      durationMinutes: null,
      image: null as string | null,
      imageAlt: null as string | null,
    },
    {
      id: "engagement",
      name: "Engagement Makeup",
      category: "Bridal",
      featured: false,
      description: "Makeup and hair for the engagement.",
      priceMin: null,
      priceMax: null,
      priceNote: PRICE_ON_REQUEST,
      durationMinutes: null,
      image: null as string | null,
      imageAlt: null as string | null,
    },

    // ---- Party ----
    {
      id: "party-makeup",
      name: "Party Makeup",
      category: "Party",
      featured: false,
      description: "Event makeup for guests, family and formal occasions.",
      priceMin: null,
      priceMax: null,
      priceNote: PRICE_ON_REQUEST,
      durationMinutes: null,
      image: null as string | null,
      imageAlt: null as string | null,
    },

    // ---- Hair (their stated specialism) ----
    {
      id: "balayage",
      name: "Balayage",
      category: "Hair",
      featured: true,                          // they call themselves balayage experts — lead with it
      description: "Hand-painted colour that grows out softly, matched to your skin tone.",
      priceMin: null,
      priceMax: null,
      priceNote: PRICE_ON_REQUEST,
      durationMinutes: null,
      image: null as string | null,
      imageAlt: null as string | null,
    },
    {
      id: "highlights",
      name: "Highlights",
      category: "Hair",
      featured: false,
      description: "Foil highlights and lowlights.",
      priceMin: null,
      priceMax: null,
      priceNote: PRICE_ON_REQUEST,
      durationMinutes: null,
      image: null as string | null,
      imageAlt: null as string | null,
    },
    {
      id: "haircut",
      name: "Haircut & Styling",
      category: "Hair",
      featured: false,
      description: "Cut, blow-dry and styling.",
      priceMin: null,
      priceMax: null,
      priceNote: PRICE_ON_REQUEST,
      durationMinutes: null,
      image: null as string | null,
      imageAlt: null as string | null,
    },
    {
      id: "hair-treatment",
      name: "Hair Treatment",
      category: "Hair",
      featured: false,
      description: "Keratin, protein and repair treatments.", // TODO: confirm which they offer
      priceMin: null,
      priceMax: null,
      priceNote: PRICE_ON_REQUEST,
      durationMinutes: null,
      image: null as string | null,
      imageAlt: null as string | null,
    },

    // ---- Skin ----
    {
      id: "facial",
      name: "Facial",
      category: "Skin",
      featured: false,
      description: "Cleansing and brightening facials.", // TODO: confirm the range they offer
      priceMin: null,
      priceMax: null,
      priceNote: PRICE_ON_REQUEST,
      durationMinutes: null,
      image: null as string | null,
      imageAlt: null as string | null,
    },
    {
      id: "threading",
      name: "Threading",
      category: "Skin",
      featured: false,
      description: "Eyebrow shaping and face threading.",
      priceMin: null,
      priceMax: null,
      priceNote: PRICE_ON_REQUEST,
      durationMinutes: null,
      image: null as string | null,
      imageAlt: null as string | null,
    },
    {
      id: "waxing",
      name: "Waxing",
      category: "Skin",
      featured: false,
      description: "Full-body and partial waxing.",
      priceMin: null,
      priceMax: null,
      priceNote: PRICE_ON_REQUEST,
      durationMinutes: null,
      image: null as string | null,
      imageAlt: null as string | null,
    },
  ],

  /**
   * TODO: entirely unconfirmed. Facebook shows a "Closed now" status, so real
   * hours exist on their About tab — screenshot it and replace this block.
   *
   * Times are null on purpose. While `verified` is false the hours section
   * renders "Call to confirm timings" with a WhatsApp CTA instead of a
   * schedule. Never render a time from a null.
   */
  hours: {
    verified: false,
    days: [
      { day: "Monday",    open: null, close: null, closed: null },
      { day: "Tuesday",   open: null, close: null, closed: null },
      { day: "Wednesday", open: null, close: null, closed: null },
      { day: "Thursday",  open: null, close: null, closed: null },
      { day: "Friday",    open: null, close: null, closed: null },
      { day: "Saturday",  open: null, close: null, closed: null },
      { day: "Sunday",    open: null, close: null, closed: null },
    ],
  },
  /**
   * Portfolio. For a makeup salon the work is the product, so this is the
   * largest section on the page.
   *
   * Every image is null until real files land — <SalonImage> renders its
   * quiet placeholder rather than a broken img, exactly as elsewhere. Ratios
   * alternate so the masonry columns interlock instead of forming a grid.
   * Filenames are planned in docs/design-plan.md R4.
   */
  portfolio: {
    /** Filter order. These are portfolio groupings, not service categories. */
    filters: ["Bridal", "Party", "Hair"] as const,
    items: [
    { id: "bridal-01", category: "Bridal", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "bridal-02", category: "Bridal", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "bridal-03", category: "Bridal", ratio: "1:1", image: null as string | null, imageAlt: null as string | null },
    { id: "bridal-04", category: "Bridal", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "bridal-05", category: "Bridal", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "bridal-06", category: "Bridal", ratio: "1:1", image: null as string | null, imageAlt: null as string | null },
    { id: "bridal-07", category: "Bridal", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "bridal-08", category: "Bridal", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "bridal-09", category: "Bridal", ratio: "1:1", image: null as string | null, imageAlt: null as string | null },
    { id: "bridal-10", category: "Bridal", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "bridal-11", category: "Bridal", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "bridal-12", category: "Bridal", ratio: "1:1", image: null as string | null, imageAlt: null as string | null },
    { id: "party-01", category: "Party", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "party-02", category: "Party", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "party-03", category: "Party", ratio: "1:1", image: null as string | null, imageAlt: null as string | null },
    { id: "party-04", category: "Party", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "party-05", category: "Party", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "party-06", category: "Party", ratio: "1:1", image: null as string | null, imageAlt: null as string | null },
    { id: "hair-01", category: "Hair", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "hair-02", category: "Hair", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "hair-03", category: "Hair", ratio: "1:1", image: null as string | null, imageAlt: null as string | null },
    { id: "hair-04", category: "Hair", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "hair-05", category: "Hair", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    { id: "hair-06", category: "Hair", ratio: "1:1", image: null as string | null, imageAlt: null as string | null },
    ],
  },

  /**
   * Instagram strip. This is a static export with no Instagram API access, so
   * these are local files chosen by hand — NOT a live feed. The heading says
   * "selected work" rather than "latest posts" because nothing here updates
   * itself, and claiming otherwise would go stale the day after launch.
   */
  instagramStrip: {
    items: [
    { id: "ig-01", image: null as string | null, imageAlt: null as string | null },
    { id: "ig-02", image: null as string | null, imageAlt: null as string | null },
    { id: "ig-03", image: null as string | null, imageAlt: null as string | null },
    { id: "ig-04", image: null as string | null, imageAlt: null as string | null },
    { id: "ig-05", image: null as string | null, imageAlt: null as string | null },
    { id: "ig-06", image: null as string | null, imageAlt: null as string | null },
    { id: "ig-07", image: null as string | null, imageAlt: null as string | null },
    { id: "ig-08", image: null as string | null, imageAlt: null as string | null },
    { id: "ig-09", image: null as string | null, imageAlt: null as string | null },
    ],
  },

  /**
   * Testimonials. Facebook shows 84% recommend from 5 reviews, which is real
   * but too thin to quote from without permission.
   *
   * verified stays false until real quotes are supplied, and the section does
   * not render at all while it is — the same gate as hours. Nothing here is
   * ever invented.
   */
  testimonials: {
    verified: false,
    items: [] as ReadonlyArray<{
      id: string;
      quote: string;
      name: string;
      event: string | null;
    }>,
  },

  /**
   * Before & after. A plain two-up comparison, no drag slider — the slider is
   * a lot of JavaScript for a section we may not have paired photographs for.
   * Renders only when verified is true and pairs exist.
   */
  beforeAfter: {
    verified: false,
    pairs: [] as ReadonlyArray<{
      id: string;
      label: string;
      beforeImage: string | null;
      beforeAlt: string | null;
      afterImage: string | null;
      afterAlt: string | null;
    }>,
  },
} as const;

export const CATEGORY_ORDER = ["Bridal", "Hair", "Party", "Skin"] as const;
