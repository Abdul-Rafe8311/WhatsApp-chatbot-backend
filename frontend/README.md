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

## Layout

```
src/config/salon.ts    salon data — the client's, mirrors the future DB
src/config/copy.ts     interface text — buttons, nav, headline
src/lib/whatsapp.ts    the CTA gate: number validation + wa.me building
src/components/        one component per file
docs/design-plan.md    colour, type, layout decisions and why
CLAUDE.md              project brief and working rules
```
