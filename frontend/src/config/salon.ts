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
    heroImage: "/images/hero.webp" as string | null,
    heroImageAlt:
      "The salon's carved wooden Sonia's sign, raised lettering on a gold-washed panel, banked with cream roses" as string | null,
    aboutImage: "/images/about-sonia.webp" as string | null,
    aboutImageAlt:
      "Sonia Shabbir in a deep pink kurta and sequinned dupatta, long caramel-balayaged hair worn loose, wearing a pearl necklace with an ornate pendant" as string | null,
    locationImage: "/images/location-salon.webp" as string | null,
    locationImageAlt:
      "The salon shopfront in Sargodha: gold Sonia's Makeup Salon lettering on a black fascia above a grey stone facade" as string | null,

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
   * REDUCED DEMO SET. Six slots, not the twenty-four the full build plans.
   * This is a pitch shown to the salon owner, and thirty-seven photographs
   * is more than anyone will source before that meeting.
   *
   * The full manifest is in docs/design-plan.md R4 and R5. Scaling back up
   * is adding entries here: no component change, no CSS change. The section
   * derives its column count, its filter and which tiles to show from
   * whatever this array holds.
   *
   * Three Bridal slots are filled. Party and Hair are empty, so they render
   * nothing and the filter hides itself — a filter whose buttons lead to
   * empty grids is worse than no filter.
   */
  portfolio: {
    /** Filter order. These are portfolio groupings, not service categories. */
    filters: ["Bridal", "Party", "Hair"] as const,
    items: [
      {
        id: "bridal-01",
        category: "Bridal",
        ratio: "4:5",
        image: "/images/portfolio/mehndi.webp" as string | null,
        imageAlt:
          "Mehndi-day bridal look: mustard-green embroidered outfit and gold-bordered dupatta, pink fresh flowers braided through a side plait, green and gold kundan maang tikka, jhumka earrings and choker, with pink blush and warm smoky eyes" as string | null,
      },
      {
        id: "bridal-02",
        category: "Bridal",
        ratio: "4:5",
        image: "/images/portfolio/barat.webp" as string | null,
        imageAlt:
          "Barat bridal look: deep red and gold hand-embroidered lehenga with a rose-gold dupatta, layered gold choker, jhumka earrings and a red-stone maang tikka, with deep henna on the hands" as string | null,
      },
      {
        id: "bridal-03",
        category: "Bridal",
        ratio: "1:1",
        image: "/images/portfolio/walima.webp" as string | null,
        imageAlt:
          "Walima bridal look: pale ice-blue outfit worked in silver and pearl with a matching net dupatta over the head, a fine gold necklace, and warm bronze smoky eyes" as string | null,
      },
      {
        id: "bridal-04",
        category: "Bridal",
        ratio: "4:5",
        image: "/images/portfolio/bridal-04.webp" as string | null,
        imageAlt:
          "Bridal look in a bottle-green lehenga embroidered with pink and coral florals, a sage net dupatta, layered kundan and gold-bead necklaces, a kundan maang tikka and green-drop jhumka earrings, with deep red henna on the hands" as string | null,
      },
      { id: "party-01", category: "Party", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
      { id: "party-02", category: "Party", ratio: "1:1", image: null as string | null, imageAlt: null as string | null },
      { id: "hair-01", category: "Hair", ratio: "4:5", image: null as string | null, imageAlt: null as string | null },
    ],
  },

  /**
   * CUT FOR THE DEMO. Empty, so neither the section nor its nav entry
   * renders — the same gate every other unconfirmed section uses.
   *
   * No files were allocated to it, so it would have been nine empty
   * placeholders under a heading, duplicating the portfolio job with none
   * of its content. The follower count, post count and follow link already
   * appear in Meet Sonia, so nothing is lost.
   */
  instagramStrip: {
    items: [] as ReadonlyArray<{
      id: string;
      image: string | null;
      imageAlt: string | null;
    }>,
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
