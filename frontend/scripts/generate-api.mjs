/**
 * Generates public/api/services.json from src/config/salon.ts at build time.
 *
 * Rafe's WhatsApp agent consumes this. It must NEVER scrape the rendered
 * HTML — that would couple his answers to this site's layout and break on
 * every design change.
 *
 * Generated, never hand-written, so it cannot drift from the config the site
 * renders from. Runs via the `prebuild` and `predev` npm hooks.
 *
 * Two semantics are load-bearing and must survive into the JSON unchanged:
 *
 *   null means UNKNOWN, not zero and not free. A null price means nobody has
 *   told us the price. The agent must say it does not know, never quote a
 *   number and never imply the service is free.
 *
 *   hours.verified === false means the schedule is unconfirmed. The agent
 *   must not state opening times as fact while it is false, even though the
 *   day rows exist.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { salon, CATEGORY_ORDER } from "../src/config/salon.ts";

/** Same rule the site uses: digits only, country code, 8-15 long. */
const isDialable = (v) => typeof v === "string" && /^\d{8,15}$/.test(v);

const payload = {
  // --- contract metadata -------------------------------------------------
  generatedAt: new Date().toISOString(),
  contract: {
    version: 1,
    status: "temporary",
    pricesAreEstimates: true,
    note: "PRICES ARE INDICATIVE MARKET ESTIMATES, not rates quoted by the salon — every service has priceEstimated true. Quote them as approximate and offer to confirm. Generated from the website's local config. This is a stopgap until the shared database lands, at which point both the site and the agent should read from that instead. Shape may change; check contract.version.",
    source: "frontend/src/config/salon.ts",
  },

  // --- salon ---------------------------------------------------------------
  salon: {
    name: salon.info.name,
    owner: salon.info.owner,
    tagline: salon.info.tagline,
    city: salon.info.city,
    // Street portion is inferred from a directory listing and unconfirmed.
    address: salon.info.address,
    email: salon.info.email,
    whatsapp: {
      // null while the configured value is not a dialable number. The site
      // renders its CTAs inert in exactly this state; the agent should treat
      // a null the same way and never surface the placeholder as a number.
      number: isDialable(salon.info.whatsappNumber)
        ? salon.info.whatsappNumber
        : null,
      isDemoNumber: salon.info.isDemoNumber,
    },
    socials: {
      instagram: salon.info.instagram,
      facebook: salon.info.facebook,
      instagramFollowers: salon.info.instagramFollowers,
      instagramPosts: salon.info.instagramPosts,
      instagramVerified: salon.info.instagramVerified,
    },
    credentials: [...salon.info.credentials],
  },

  // --- services ------------------------------------------------------------
  categoryOrder: [...CATEGORY_ORDER],
  services: salon.services.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    description: s.description,
    // null = unknown. Not free, not zero.
    priceMin: s.priceMin,
    priceMax: s.priceMax,
    priceNote: s.priceNote,
    priceCurrency: "PKR",
    // TRUE = an indicative market rate, NOT quoted by the salon. Present it
    // as approximate and offer to confirm; never commit the client to it.
    priceEstimated: s.priceEstimated ?? false,
    durationMinutes: s.durationMinutes,
  })),

  // --- hours ---------------------------------------------------------------
  hours: {
    verified: salon.hours.verified,
    days: salon.hours.days.map((d) => ({
      day: d.day,
      open: d.open,
      close: d.close,
      closed: d.closed,
    })),
  },
};

mkdirSync(new URL("../public/api/", import.meta.url), { recursive: true });
writeFileSync(
  new URL("../public/api/services.json", import.meta.url),
  JSON.stringify(payload, null, 2) + "\n",
);

const nullPrices = payload.services.filter((s) => s.priceMin === null).length;
const estimated = payload.services.filter((s) => s.priceEstimated).length;
console.log(
  `generate-api: ${payload.services.length} services ` +
    `(${nullPrices} unknown price, ${estimated} estimated), ` +
    `hours.verified=${payload.hours.verified}`,
);
