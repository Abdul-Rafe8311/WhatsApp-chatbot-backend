# CLAUDE.md — Sonia's Makeup Salon, public website

## What this is

A public marketing website for Sonia's Makeup Salon in Sargodha, Pakistan. Its single job is to get a visitor to open WhatsApp and message the salon's booking agent.

This is one of three components in a larger system:

| Component | Owner | Status |
|---|---|---|
| Public salon website | Ali (this repo) | in progress |
| WhatsApp booking agent | Rafe | separate repo |
| Salon CRM | Ali | later phase |

All three will eventually share one database. **This site does not talk to the agent or the database yet.** Content lives in a local config file. Do not add a backend, API routes, or database client to this repo.

## Non-goals

Do not build these. If a change seems to require one, stop and ask:

- **Any booking form, date picker, time field, service selector, or name/phone
  input.** WhatsApp *is* the booking flow. Reaffirmed in Revision 4 against a
  proposed booking section, for two reasons worth keeping: a form would split
  booking data across two systems, so the site and the agent would each hold
  half a booking and neither would be authoritative; and it would compete with
  the WhatsApp agent this entire project exists to demonstrate. Every booking
  path on this site goes through <WhatsAppLink>.
- Login, accounts, or admin UI
- Payments or pricing checkout
- CMS integration
- Blog, reviews system, or newsletter signup (testimonials are static config,
  gated behind a verified flag — never a review submission form)
- Analytics, tracking pixels, cookie banners
- Multi-language or i18n framework (site is English only)

### Reversed: dark mode toggle

"Dark mode toggle" was a non-goal until Revision 3, when the site flipped to
a warm light palette and a toggle was added to the nav. Recorded here rather
than silently deleted, because the original reason was sound: a toggle costs
a second palette to maintain, and a salon site does not obviously need one.

What changed is that the dark palette already existed and was already
paid for — Revisions 1 and 2 shipped on it — so the toggle costs one button
and a class, not a second design. Both palettes are in the same token set;
no component knows which is active. See docs/design-plan.md R3.

**Light is the unconditional default.** `prefers-color-scheme` is
deliberately ignored: only an explicit stored choice turns dark on. Most
visitors arrive from the Instagram bio link and see the page once, so a
visitor with dark mode enabled would otherwise never see the intended design.
Respecting the OS is right for an app people return to; it is wrong for a
single-visit brand page. Do not "fix" this by re-adding a `matchMedia` check
to `src/lib/theme.ts` — it was removed on purpose. See R3.4.

### Reversed: the site now talks to the booking agent

"This site does not talk to the agent or the database yet" and "do not add a
backend, API routes, or database client to this repo" stood until the chat
widget was ported in. `src/components/ChatWidget.tsx` calls the agent's
`/api/chat` over HTTP.

What has NOT changed, and is the part of the rule that mattered: there is no
API route, no server, no database client, and no build-time data fetch. This
is still a static export. The widget is a client component that calls a
separate service the same way it calls wa.me — from the visitor's browser,
after load. Content still lives in `salon.ts` and `copy.ts`; the agent answers
from its own copy of the salon data, not from this repo.

The base URL resolves in `src/lib/api.ts` (`NEXT_PUBLIC_API_URL`, else
localhost when served from localhost, else the deployed API). Do not hardcode
a host in the component.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Static export target — this deploys to **Cloudflare Pages**, not Vercel
- No component library (no shadcn, MUI, Chakra). Hand-build the handful of components needed.
- Minimal dependencies. Justify any new package in the PR description.

## Content architecture

Nothing user-visible is hardcoded in a component. Content lives in one of two
config files, and the boundary between them matters:

- **`src/config/salon.ts` — salon data the client owns.** Facts about the
  business: services, prices, hours, address, socials, credentials. This is
  the file that mirrors the eventual shared database, and the booking agent
  will answer from the same rows. If it belongs in a `salon_info` or
  `services` table, it goes here.
- **`src/config/copy.ts` — interface text the developer owns.** Button
  labels, nav items, headline, WhatsApp prefill templates, the demo notice.
  None of this describes the salon and none of it belongs in a database —
  "Book on WhatsApp" should never end up in a `salon_info` table.

When adding a string, ask which side of that line it falls on. Data the agent
would need to answer a customer goes in `salon.ts`; words that only exist
because this is a website go in `copy.ts`.

Shape the config to mirror the eventual database tables, so migrating to live data is a data-source swap and not a rewrite:

```ts
export const salon = {
  info: {
    name: "Sonia's Makeup Salon",
    tagline: "...",
    about: "...",
    address: "...",
    city: "Sargodha",
    whatsappNumber: "...",     // digits only, country code, no + or spaces
    isDemoNumber: true,        // gate every CTA on this
    instagram: "...",
    parkingNote: "...",
    paymentMethods: ["Cash", "Easypaisa", "JazzCash"],
  },
  services: [
    {
      id: "mehndi",
      name: "Mehndi Makeup",
      category: "Bridal",       // Bridal | Hair | Party | Skin
      description: "...",
      priceMin: null,            // null = not confirmed
      priceMax: null,
      priceNote: PRICE_ON_REQUEST,
      durationMinutes: null,
    },
  ],
  hours: {
    verified: false,
    days: [{ day: "Monday", open: null, close: null, closed: null }],
  },
} as const;
```

Rules:
- **Never substitute a value for a null.** A null means "not confirmed". Render
  the explicit unconfirmed state — never a plausible-looking stand-in.
- No price figures anywhere. Every price is currently unconfirmed:
  `priceMin: null` renders `PRICE_ON_REQUEST`, and that service's CTA carries
  the enquiry into WhatsApp. Import the constant; don't retype the string.
- Every price on the page must come from `services[]`. The agent will one day
  answer from this same data, and the site contradicting the bot is the worst
  possible demo failure.
- `hours.verified` is false. While it is, the hours section renders
  "Call to confirm timings" with a WhatsApp CTA — never a schedule.
- `services[]` order is meaningful. Bridal runs in wedding-timeline order
  (Mehndi → Nikah → Barat → Walima). Render the array as-is; do not re-sort
  in a component. `CATEGORY_ORDER` governs category sequence.
- Placeholder values are marked `// TODO: confirm with client`. Keep those
  comments until real data arrives.

## Pages

Single scrolling page with anchor navigation. No multi-page routing.

Sections in order: hero, services, about, hours & location, contact/CTA, footer.

## The WhatsApp CTA

This is the conversion point and the demo's punchline. It must be correct.

- Link format: `https://wa.me/<number>?text=<encoded prefilled message>`
- Number is digits only with country code, no `+`, no spaces
- **Never build a wa.me deep link while `info.isDemoNumber` is true without
  the demo label showing.** The number is a team test line, not the salon's.
  A visitor must never be able to tap through to it believing it reaches
  Sonia's.
- Prefill the message with context so the agent starts warm, e.g. from a service card: `Assalam o Alaikum, I'd like to book Bridal Makeup`
- Every service card gets its own CTA with that service prefilled
- Primary CTA in hero, sticky CTA on mobile, one in the contact section
- The button label says what happens: "Book on WhatsApp", not "Get Started" or "Contact Us"
- Use `rel="noopener noreferrer"` and open in a new tab
- Do **not** use the official WhatsApp logo asset or brand green as the site's accent color — it makes the whole page look like a template. A small chat glyph is fine.

## Design direction

Audience is Pakistani women booking bridal and party makeup, browsing on a phone, often after finding the salon on Instagram. The site should feel like a salon with taste, not a tech product.

**Explicitly avoid** the default AI aesthetic, which this brief attracts hard: cream `#F4F1EA` background, high-contrast serif display, terracotta or warm-clay accent. Also avoid generic "luxury beauty" clichés — rose gold gradients, thin all-caps letterspaced headings, cursive script fonts, marble textures.

Draw instead from the visual world of Pakistani bridal styling: jewel tones, gold as a thin structural line rather than a fill, the deep saturated reds and greens of bridal textiles. Pick a palette of 4–6 hex values and define them as Tailwind theme tokens. No arbitrary color values in components.

Typography: pair a characterful display face with a clean body face. Not Playfair + Lato. Set a real type scale.

Spend boldness in one place — pick a single signature element and keep everything else disciplined and quiet.

Since there are no photos yet, the layout must not depend on imagery. Type, color, and space carry it. Where images will eventually go, use solid-color blocks with correct aspect ratios, not gray boxes with placeholder icons.

## Quality floor

Meet these without being asked:

- Mobile-first. Most visitors arrive from an Instagram bio link on a phone. Design at 375px first, then scale up.
- Visible keyboard focus states on every interactive element
- `prefers-reduced-motion` respected
- Semantic HTML, real heading hierarchy, alt text on every image
- Lighthouse: 90+ on performance and accessibility
- No layout shift on load
- Tap targets at least 44px

## Conventions

- `src/components/` for components, one per file, PascalCase
- `src/config/` for content
- Conventional commits: `feat:`, `fix:`, `style:`, `docs:`, `chore:`
- Feature branches and PRs, even solo
- Run `npm run build` before every commit — this deploys as a static export and a build break is a broken demo

## Working style

- Ask before adding a dependency, adding a section not listed above, or changing the config shape
- Show the design plan (palette, type, layout concept) before writing component code
- Do not add placeholder Lorem Ipsum. Write real copy in the salon's voice — plain, warm, specific. No "elevate your beauty journey".
