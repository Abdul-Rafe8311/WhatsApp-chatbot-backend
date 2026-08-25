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
    facebook: "https://www.facebook.com/soniasmakeupsalon/",    // CONFIRMED

    credentials: [
      "Certified makeup artist, Pakistan",     // CONFIRMED
      "Trained by Kashee's Official and Amina Raja Makeup Studio", // CONFIRMED
    ],

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
} as const;

export const CATEGORY_ORDER = ["Bridal", "Hair", "Party", "Skin"] as const;
