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

/** Rendered wherever a price is not set. */
export const PRICE_ON_REQUEST = "On request" as const;

/** Currency for every figure in this file. See salon.pricesAreSample. */
export const PRICE_CURRENCY = "PKR" as const;

export const salon = {
  /**
   * PRICES ARE SAMPLE DATA, NOT THE CLIENT RATES.
   *
   * Benchmarked against published Pakistani salon price lists and scaled
   * down for Sargodha, which is tier-2 and sits below Lahore and Karachi.
   * They exist so the demo does not read as an empty price list in front
   * of the owner. Sonia has quoted none of them.
   *
   * While this is true the footer says so, and /api/services.json carries
   * pricesAreSample so the booking agent presents them as indicative and
   * offers to confirm. Replace with real rates and set this to false.
   */
  pricesAreSample: true,

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
      // ---- Bridal ----
      {
        id: "mehndi",
        name: "Mehndi Makeup",
        category: "Bridal",
        featured: true,
        description: "Colourful mehndi-day makeup with floral jewellery styling.",
        priceMin: 15000,
        priceMax: 25000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: "/images/portfolio/mehndi.webp" as string | null,
        imageAlt:
          "Mehndi-day bridal look: mustard-green embroidered outfit and gold-bordered dupatta, pink fresh flowers braided through a side plait, green and gold kundan maang tikka, jhumka earrings and choker, with pink blush and warm smoky eyes" as string | null,
      },
      {
        id: "nikah",
        name: "Nikah Makeup",
        category: "Bridal",
        featured: true,
        description: "Understated bridal makeup and hair for the nikah ceremony.",
        priceMin: 18000,
        priceMax: 30000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: "/images/portfolio/bridal-04.webp" as string | null,
        imageAlt:
          "Bridal look in a bottle-green lehenga embroidered with pink and coral florals, a sage net dupatta, layered kundan and gold-bead necklaces, with deep red henna on the hands" as string | null,
      },
      {
        id: "barat",
        name: "Barat Makeup",
        category: "Bridal",
        featured: true,
        description: "Full bridal makeup, hair styling and dupatta setting for the barat.",
        priceMin: 30000,
        priceMax: 50000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: "/images/portfolio/barat.webp" as string | null,
        imageAlt:
          "Barat bridal look: deep red and gold hand-embroidered lehenga with a rose-gold dupatta, layered gold choker, jhumka earrings and a red-stone maang tikka, with deep henna on the hands" as string | null,
      },
      {
        id: "walima",
        name: "Walima Makeup",
        category: "Bridal",
        featured: true,
        description: "Softer, camera-ready bridal look with hair styling for the walima.",
        priceMin: 25000,
        priceMax: 40000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: "/images/portfolio/walima.webp" as string | null,
        imageAlt:
          "Walima bridal look: pale ice-blue outfit worked in silver and pearl with a matching net dupatta over the head, a fine gold necklace, and warm bronze smoky eyes" as string | null,
      },
      {
        id: "engagement",
        name: "Engagement Makeup",
        category: "Bridal",
        featured: false,
        description: "Makeup and hair for the engagement or mayun.",
        priceMin: 12000,
        priceMax: 20000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "bridal-trial",
        name: "Bridal Trial",
        category: "Bridal",
        featured: false,
        description: "A full trial run of the look before the wedding week.",
        priceMin: 6000,
        priceMax: 10000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "bridal-package",
        name: "Full Wedding Package",
        category: "Bridal",
        featured: false,
        description: "Mehndi, barat and walima booked together, quoted per wedding.",
        // Genuinely per-booking, not a missing price.
        priceMin: null,
        priceMax: null,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      // ---- Hair ----
      {
        id: "balayage",
        name: "Balayage",
        category: "Hair",
        featured: true,
        description: "Hand-painted colour that grows out softly, matched to your skin tone.",
        priceMin: 12000,
        priceMax: 25000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "highlights",
        name: "Full-Head Highlights",
        category: "Hair",
        featured: false,
        description: "Foil highlights through the full head.",
        priceMin: 9000,
        priceMax: 16000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "half-highlights",
        name: "Half-Head Highlights",
        category: "Hair",
        featured: false,
        description: "Foils through the top and around the face.",
        priceMin: 5000,
        priceMax: 9000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "hair-colour",
        name: "Root Touch-Up & Colour",
        category: "Hair",
        featured: false,
        description: "Global colour or a root touch-up between appointments.",
        priceMin: 4000,
        priceMax: 8000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "keratin",
        name: "Keratin Treatment",
        category: "Hair",
        featured: false,
        description: "Smoothing keratin treatment, priced by hair length.",
        priceMin: 10000,
        priceMax: 20000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "hair-treatment",
        name: "Hair Protein Treatment",
        category: "Hair",
        featured: false,
        description: "Protein and repair treatment for damaged or coloured hair.",
        priceMin: 5000,
        priceMax: 9000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "hair-mask",
        name: "Intensive Hair Mask",
        category: "Hair",
        featured: false,
        description: "Deep-conditioning mask, usually added to a cut or colour.",
        priceMin: 3000,
        priceMax: 5000,
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
        priceMin: 1500,
        priceMax: 3000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "blow-dry",
        name: "Blow Dry & Styling",
        category: "Hair",
        featured: false,
        description: "Wash, blow-dry and finish.",
        priceMin: 1200,
        priceMax: 2500,
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
        description: "Event makeup for weddings, formals and family occasions.",
        priceMin: 5000,
        priceMax: 9000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "guest-makeup",
        name: "Family & Guest Makeup",
        category: "Party",
        featured: false,
        description: "For the bride's family and guests, booked alongside a bridal day.",
        priceMin: 4000,
        priceMax: 7000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "soft-glam",
        name: "Soft Glam Makeup",
        category: "Party",
        featured: false,
        description: "A lighter daytime look for smaller events.",
        priceMin: 3500,
        priceMax: 6000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "party-hair",
        name: "Party Hair Styling",
        category: "Party",
        featured: false,
        description: "Blow-dry, curls or an updo for an event.",
        priceMin: 2500,
        priceMax: 5000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      // ---- Skin ----
      {
        id: "hydrafacial",
        name: "Hydrafacial",
        category: "Skin",
        featured: false,
        description: "Deep-cleansing hydrating facial with a visible same-day glow.",
        priceMin: 4500,
        priceMax: 7000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "bridal-facial",
        name: "Bridal Glow Facial",
        category: "Skin",
        featured: false,
        description: "Pre-wedding facial, best booked a few days before the event.",
        priceMin: 4000,
        priceMax: 7000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "whitening-facial",
        name: "Whitening Facial",
        category: "Skin",
        featured: false,
        description: "Brightening facial for uneven tone and pigmentation.",
        priceMin: 3000,
        priceMax: 5000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "gold-facial",
        name: "Gold Facial",
        category: "Skin",
        featured: false,
        description: "Gold-leaf facial for a soft finish before an event.",
        priceMin: 2800,
        priceMax: 4500,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "herbal-facial",
        name: "Herbal Facial",
        category: "Skin",
        featured: false,
        description: "Gentle herbal facial for sensitive skin.",
        priceMin: 2200,
        priceMax: 3500,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "facial",
        name: "Deep Cleansing Facial",
        category: "Skin",
        featured: false,
        description: "Cleansing facial for congested or dull skin.",
        priceMin: 1500,
        priceMax: 2500,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "full-face-threading",
        name: "Full Face Threading",
        category: "Skin",
        featured: false,
        description: "Full face and eyebrow threading.",
        priceMin: 900,
        priceMax: 1500,
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
        description: "Eyebrow shaping and threading.",
        priceMin: 250,
        priceMax: 500,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "arm-waxing",
        name: "Full Arm Waxing",
        category: "Skin",
        featured: false,
        description: "Full arms, fruit or honey wax.",
        priceMin: 1500,
        priceMax: 2200,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "leg-waxing",
        name: "Full Leg Waxing",
        category: "Skin",
        featured: false,
        description: "Full legs, fruit or honey wax.",
        priceMin: 2000,
        priceMax: 3000,
        priceNote: PRICE_ON_REQUEST,
        durationMinutes: null,
        image: null as string | null,
        imageAlt: null as string | null,
      },
      {
        id: "waxing",
        name: "Full Body Waxing",
        category: "Skin",
        featured: false,
        description: "Full-body waxing, usually booked before a wedding.",
        priceMin: 5000,
        priceMax: 8000,
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
