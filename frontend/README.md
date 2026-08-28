# Sonia's Makeup Salon — public website

Hi Rafe. This is the public marketing site for the salon. It's a separate thing
from your agent and doesn't talk to it — the only connection between them is
that the site's buttons open WhatsApp, which is where your engine takes over.

**The site has one job:** get a bride to open WhatsApp and message the booking
agent. Everything on the page is pointed at that.

## Run it

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

Next.js App Router, TypeScript, Tailwind. Static export (`output: 'export'`),
deploying to Cloudflare Pages — so no server, no API routes, no database
client. `npm run build` writes plain files to `out/`.

## The bit that matters to you

**All salon content lives in [`src/config/salon.ts`](src/config/salon.ts).**

That file is deliberately shaped to mirror the tables we'll eventually share —
`info`, `services[]`, `hours` — so that when we move to a real database, this
becomes a data-source swap rather than a rewrite. **Your agent will one day
answer from this same data.**

So: **if you need a field that isn't in there, tell me and I'll add it.** Better
that we agree the shape now than discover the site and the bot disagree in
front of the client. Two things worth knowing about the current shape:

- `services[]` order is meaningful, not cosmetic. Bridal runs in wedding-
  timeline order — Mehndi → Nikah → Barat → Walima. Neither of us should
  re-sort it; the order is information a bride reads.
- Every service has a stable `id` (`mehndi`, `barat`, `balayage`, …). If you
  need to key anything against a service, key it on that.

## Three things are intentionally unfinished

Don't file these as bugs — they're all waiting on the client:

1. **The WhatsApp number is unset.** `whatsappNumber` is still
   `"92XXXXXXXXXX"` and `isDemoNumber` is `true`. Every CTA on the page
   therefore renders as an inert button rather than a `wa.me` link — **by
   design, not broken.** The gate lives in
   [`src/lib/whatsapp.ts`](src/lib/whatsapp.ts): anything that isn't 8–15
   digits fails, and `<WhatsAppCTA>` renders a dead button instead of a link.
   The inert button is styled *identically* to the live one so the design can
   still be reviewed. Set a real number and every CTA activates at once —
   nothing else needs changing. The footer carries a small "Demo build" note
   that disappears on its own when that happens.
2. **All prices show "On request."** Every `priceMin` is `null` pending the
   client. There is no price figure anywhere in this repo, and please don't
   add one — if the site quotes a number your bot doesn't, that's the worst
   version of this demo failing.
3. **Opening hours are unverified.** `hours.verified` is `false` and every
   time is `null`, so that section renders "Call to confirm timings" instead
   of a schedule.

The rule underneath all three: **never render a value from a null.** A null
means "not confirmed", and a plausible-looking guess in front of the client is
worse than an obvious gap.

## The JSON endpoint — read this one, Rafe

**`/api/services.json`** — everything your agent needs about services, the
salon and its hours, as JSON.

**Do not scrape the rendered HTML.** That would couple your answers to my
layout and break every time the design changes, which it has done five times
already. This file is the contract.

It is generated from [`src/config/salon.ts`](src/config/salon.ts) at build
time by [`scripts/generate-api.mjs`](scripts/generate-api.mjs), which runs on
the `prebuild` and `predev` npm hooks. It is never hand-written, so it cannot
drift from what the site renders. It is gitignored — build the site and it
appears, or fetch it from the deployed URL.

### Two rules that matter more than the shape

**`null` means UNKNOWN. Not zero, not free.**

Every `priceMin` and `priceMax` is currently `null`, because the client has
not given us prices. If your agent sees `null` it must say it does not know
and offer to check — never quote a number, never imply the service is free.
`priceNote` carries the human phrasing ("On request") if you want to echo it.

**`hours.verified: false` means the schedule is not confirmed.**

The `days` array exists and has all seven entries, but every `open` and
`close` is `null`. While `verified` is false your agent must not state
opening times as fact. The website renders "Call to confirm timings" in
exactly this state.

Same rule for `salon.whatsapp.number`: it is `null` while
`isDemoNumber` is true. The configured value is a placeholder, not a
dialable number, so the endpoint emits `null` rather than handing you
something that looks like a phone number and is not.

### Shape

```jsonc
{
  "generatedAt": "2026-08-27T14:15:13.942Z",   // ISO 8601, build time
  "contract": {
    "version": 1,              // bump = breaking change, check this
    "status": "temporary",
    "source": "frontend/src/config/salon.ts"
  },

  "salon": {
    "name": "Sonia's Makeup Salon",
    "owner": "Sonia Shabbir",
    "tagline": "...",
    "city": "Sargodha",
    "address": "...",         // street portion still unconfirmed
    "email": "...",
    "whatsapp": {
      "number": null,          // null until a real number is set
      "isDemoNumber": true
    },
    "socials": {
      "instagram": "...", "facebook": "...",
      "instagramFollowers": "49.9K",   // strings, as displayed
      "instagramPosts": "1,352",
      "instagramVerified": true
    },
    "credentials": ["...", "..."]
  },

  "categoryOrder": ["Bridal", "Hair", "Party", "Skin"],

  "services": [
    {
      "id": "mehndi",          // stable key — use this, not the name
      "name": "Mehndi Makeup",
      "category": "Bridal",
      "description": "...",
      "priceMin": null,        // null = UNKNOWN
      "priceMax": null,
      "priceNote": "On request",
      "durationMinutes": null
    }
  ],

  "hours": {
    "verified": false,         // false = do not state times as fact
    "days": [
      { "day": "Monday", "open": null, "close": null, "closed": null }
    ]
  }
}
```

### Order is information

`services[]` is in deliberate order and `categoryOrder` gives the category
sequence. Bridal runs in wedding-timeline order — Mehndi, Nikah, Barat,
Walima — because that is how a bride thinks about booking. Render or read it
as given; do not sort alphabetically.

`id` is the stable key. Names may be reworded; ids will not change without a
`contract.version` bump.

### This is temporary

This endpoint is a stopgap until the shared database lands. At that point
both the site and your agent should read from the database and this file
should go away. Until then it is the single place our two systems agree on
the services list — if the site and the bot ever quote different things in
front of the client, that is the worst version of this demo failing.

If you need a field that is not here, tell me and I will add it to
`salon.ts`; it will flow into the JSON automatically.

---

## Layout

```
src/config/salon.ts    salon data — the client's, mirrors the future DB
src/config/copy.ts     interface text — buttons, nav, headline
src/lib/whatsapp.ts    the CTA gate: number validation + wa.me building
src/components/        one component per file
docs/design-plan.md    colour, type, layout decisions and why
CLAUDE.md              project brief and working rules
```
