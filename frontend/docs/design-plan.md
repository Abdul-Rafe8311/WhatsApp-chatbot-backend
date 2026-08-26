# Design plan — Sonia's Makeup Salon

Status: **built, then revised.** Revision 2 below supersedes the colour,
image-slot, CTA-count, signature and services decisions in the original plan.
The original reasoning is retained deliberately — the arguments that turned
out to be wrong are the useful part.

---

# Revision 2 — near-neutral

Recorded after reviewing the built site. Revision 1's palette and repetition
were wrong in ways that only showed once the whole page existed. The original
reasoning is left below rather than deleted, because the arguments that were
wrong are worth keeping visible.

## R2.1 — One ground, near-neutral

**Was:** `crimson`, `emerald` and `magenta` rotating as full-bleed section
grounds, on the argument that the page should read as "a sequence of fabric
panels".

**Is:** a single near-black ground (`ink` `#170E11`, warmed very slightly from
`#1B0F13`), `ivory` text, `gold` as the only accent. `ink-2` and `ink-3` are
tonal steps for surfaces and image placeholders. Crimson, emerald and magenta
are **removed from the theme entirely**.

**Why the original argument failed.** It was reasoning about fabric, not about
a screen with photographs on it. In practice the emerald services panel with
dark maroon squares on it read as a default dark theme with broken images —
the exact generic look the plan set out to avoid.

The decisive fact is one the first plan noted and then ignored: **this salon's
own imagery is already extremely saturated.** Crimson lehengas, emerald and
magenta mehndi, kundan gold. When the site's chrome competes with that, the
result is noise. When the chrome goes quiet, the photographs become the only
colour on the page and it reads as expensive. The jewel tones still arrive —
they arrive in the pictures, which is where they were always going to be
better than in a CSS token.

Sections now separate by **spacing and the gold hairline seam**, never by
changing colour. Distinction between sections is carried by layout and rhythm,
which revision 1 already got right.

`gold` is deliberately **rationed**: hairline seams, small labels, prices,
the three CTA borders, the wordmark apostrophe. It should feel scarce. Nothing
is filled with it.

## R2.2 — Image slots, not colour fields

**Was:** solid saturated rectangles at correct aspect ratios, on the argument
that a colour block "belongs in the composition" where a grey box does not.

**Is:** `<SalonImage>` — one component taking `src`, `alt` and `ratio`. With
no `src` it renders a tonal panel one step off the ground (`ink-2` with a
`gold/12` inset hairline).

**Why.** Half the original argument held: a grey box with an icon is worse.
But a flat saturated rectangle reads as a *failed image load*, and seven of
them read as a broken page. The placeholder has to recede rather than
announce itself — close enough to the ground to look like deliberate space,
distinct enough to hold the composition.

The aspect box lives on the wrapper, so a real photograph replaces a
placeholder with zero layout shift and no redesign. Paths live in
`salon.ts` as `null` until files land — the same never-render-from-a-null
discipline as prices and hours.

## R2.3 — Three prominent CTAs, not sixteen

**Was:** every one of thirteen services carried its own outlined pill, plus
hero, hours and sticky.

**Is:** the pill appears in exactly **three** places — hero, hours, sticky.
Service names are themselves the WhatsApp link, styled recessively.

**Why.** Thirteen identical outlined pills was the single loudest signal that
the page was generated. Real sites do not ask sixteen times, and repetition
at that volume reads as a template regardless of how good the individual
element is.

Nothing was lost behaviourally. `<WhatsAppLink>` is the headless gate; the
pill is `<WhatsAppCTA>` wrapping it. Every service still opens WhatsApp with
its own prefill and its own accessible name, still inert while
`isDemoNumber` is true. On a bridal card the heading wraps the link and a
stretched pseudo-element covers the card, so the whole card is the target
while the markup stays valid — a `<button>` may not contain a heading.

## R2.4 — No seal on buttons

**Was:** the signature was "the seal inside a gold-hairline pill", on the
argument that a bare mark could not tell a bride what tapping did.

**Is:** the pill carries **plain type**. The seal appears only in the
wordmark, and standing alone in the header and footer.

**Why.** The label was the right half of that fix; the seal was not. At pill
size, beside a word, a raised apostrophe reads as a stray comma rather than a
mark — punctuation that has come loose. It needs the word it belongs to. In
the wordmark it is unmistakably part of "Sonia's"; next to "Book on WhatsApp"
it is debris.

The signature is therefore now **the raised gold apostrophe in the wordmark
itself** — carved-sign detail, gold, appearing twice on the page. Rationed,
like the rest of the gold.

## R2.5 — Services reflects what the salon sells

**Was:** thirteen structurally identical cards in a uniform grid.

**Is:** two tiers.

- **The four wedding days** — Mehndi, Nikah, Barat, Walima — as large cards
  with 4:5 photographs, full titles and room around them.
- **Everything else** — Engagement beneath the cards, then Hair, Party and
  Skin as dense name-and-price rows in three columns.

**Why.** Thirteen identical cards is a catalogue, not a design, and it told
the visitor that Waxing matters as much as Barat. It does not. The bridal
four are the business; the rest is a real menu that people do book, and it
should be legible without pretending to be the headline.

Party is a single service and would look stranded as its own stacked block,
so the compact groups sit side by side rather than running down the page.

Selection is data-driven — `category === "Bridal" && featured` — so the tiers
follow the config rather than a hardcoded list. `CATEGORY_ORDER` and array
order are still authoritative; the four days are lifted out, never re-sorted.

---

## What the config actually says

Before picking anything, here's what `src/config/salon.ts` implies about how
this page has to work:

- It's a **bridal** salon first, and brides think in **events** — Nikah,
  Barat, Mehndi, Walima — not in generic service categories. The IG
  highlights already prove this; the services section should follow the same
  mental model.
- **Balayage** is a named specialism, not "we also do hair." It earns real
  space, not a footnote.
- The **Kashee's Official / Amina Raja** training is the single strongest
  trust signal on the page in this market. It needs to read like a
  credential, not like marketing copy.
- Traffic is **Instagram bio → phone → already sold on the work**. Nobody
  lands here cold. The page isn't persuading a skeptic; it's giving a
  half-decided bride the last details and the fastest possible path to
  WhatsApp.
- The **real signage** — carved wood, serif, raised apostrophe — is the only
  physical brand asset that exists. It's the one thing to design *from*
  rather than invent around.
- **No photography yet.** Colour, type and space have to carry the whole page.

---

## 1. Colour

| Token | Hex | Role |
|---|---|---|
| `ink` | `#1B0F13` | Primary ground — deep aubergine-black with a warm crimson undertone, not a true black |
| `ink-2` | `#2A1820` | Elevated surface within `ink` (cards, nav bar) — one step up, still dark |
| `crimson` | `#8C2331` | Barat red — oxblood, not fire-engine. Primary accent, CTA fill |
| `gold` | `#BE9B4D` | Kundan gold — hairlines, borders, small credential text. Structural, never a fill |
| `emerald` | `#1E5C4C` | Mehndi/Nikah green — secondary section ground |
| `magenta` | `#9C2A5E` | Mehndi/Nikah rani pink — tertiary accent, used sparingly |
| `ivory` | `#EFE7D8` | Body text on dark grounds, occasional light card fill. Warm, not stark white |

**How they're actually used.** `ink` is the dominant page background — not
white, not cream. `crimson`, `emerald` and `magenta` rotate as *section*
grounds (services on emerald, contact on crimson) so the page reads like
moving through a sequence of fabric panels rather than scrolling a single
brochure. `gold` never fills a shape — it's the 1–2px rule between sections,
the border on the signature mark, the colour of small credential labels
("Certified · trained by Kashee's Official"). `ivory` carries body copy on
every dark ground, so contrast is inherited automatically rather than
re-solved per section: `ivory` on `ink`/`crimson`/`emerald`/`magenta` all sit
well past AA for body text; `gold` is reserved for large text, rules and
icons, never small paragraph copy, so it's never doing a contrast job it
can't handle.

**Self-check.** First pass had `ivory` as the *dominant* background with the
jewel tones as accents — the safe, airy "beauty salon" read. I rejected it:
against a light ground, gold hairlines just look like thin grey lines with a
warm tint — decorative, not structural — and without photography, a light
page has nothing to hold visual weight. Flipping to a dark, saturated ground
is what makes "gold as hairline" actually true, and it's what makes the
colour blocks (standing in for missing photos) read as jewel-toned fabric
rather than empty placeholders. It also flatly rules out the cream/terracotta
default by construction rather than by avoidance.

---

## 2. Type

**Display — [Fraunces](https://fonts.google.com/specimen/Fraunces).**
Variable serif with a soft, ink-trapped, slightly carved quality at high
optical size — closer to hand-cut lettering than to a thin editorial Didone.
This is the reason it's the pick over Playfair Display: Playfair's high
contrast and hairline serifs read as "generic luxury editorial"; Fraunces'
thicker, warmer strokes read as *carved*, which is the actual brief (their
sign is carved wood). Used at large sizes only — hero line, section
headings, the wordmark. Never for body copy, never for UI labels.

**Body — [Karla](https://fonts.google.com/specimen/Karla).** Humanist
grotesque with rounded terminals and a generous x-height — warm enough to sit
next to Fraunces without fighting it, plain enough to disappear at 16px on a
phone screen. This is the swap-out for Lato: Lato is neutral to the point of
having no relationship to the display face at all; Karla's slightly rounded
letterforms echo Fraunces' softness without becoming a second display face.
Karla also carries all UI text — nav, buttons, hours, captions — so there
are exactly two families on the page, not three.

**Type scale:**

| Role | Face / weight | Size | Line-height | Notes |
|---|---|---|---|---|
| Hero H1 | Fraunces 600, opsz 144 | `clamp(2.75rem, 8vw, 5.5rem)` | 0.95 | `text-wrap: balance` |
| Section H2 | Fraunces 600, opsz 72 | `clamp(1.75rem, 4vw, 2.5rem)` | 1.05 | |
| Service/card title | Fraunces 500, opsz 36 | `1.25rem` | 1.2 | |
| Body | Karla 400 | `1.0625rem` (17px) | 1.6 | max ~65ch measure |
| CTA button label | Karla 600 | `1rem` | 1 | sentence case, +0.01em tracking |
| Credential / meta label | Karla 600, `gold` | `0.8125rem` | 1.4 | +0.02em tracking — the one place letter-spacing is used, and only because it's a *label*, not a heading |
| Hours / prices | Karla 500, tabular figures | `0.9375rem` | 1.5 | `font-variant-numeric: tabular-nums` so times and prices align in columns |

**The wordmark.** "Sonia's" set in Fraunces 600 at hero size, upright (no
script, no italic). The apostrophe is pulled into its own `<span>`, nudged up
and enlarged slightly (`translateY(-0.15em) scale(1.15)`) and set in `gold`
instead of `ivory` — a flat digital echo of a raised carved apostrophe
catching light differently than the flat-painted letters around it. This
mark is reused wherever the salon name appears, not just in the hero.

**Self-check.** The obvious failure mode here was landing on Playfair +
Lato exactly, or something so close it doesn't matter (Cormorant + Inter,
DM Serif + Work Sans — same shape, different names). I also nearly reached
for small-caps letterspaced section headers, which is its own cliché the
brief separately bans — revised to sentence-case headings that get their
weight from size and Fraunces' own character instead of tracking. The only
surviving letter-spacing is on the tiny credential label, where it's doing
a real legibility job at 13px, not standing in for hierarchy.

---

## 3. Layout

### Two things the sections must do

**The hero carries the Kashee's credential as type, not as a badge.** Directly
under the H1, above the CTA, one line in Karla 600 / 13px / `gold`:

> Certified Makeup Artist · trained at Kashee's Official & Amina Raja Makeup Studio

Set as a line of text on the same left edge as the headline — no pill, no
border, no icon, no "verified" checkmark. It's the strongest trust signal on
the page in this market, and it reads as credential precisely because it's
set plainly. Boxing it would make it look like an advertisement for itself.

Composed at render time by joining `salon.info.credentials[]` with ` · ` —
the config holds three separate strings ("Certified makeup artist, Pakistan",
"Trained by Kashee's Official", "Trained by Amina Raja Makeup Studio"), not a
pre-joined line.

**Services lead with the four wedding events, in the salon's own order:
Mehndi → Nikah → Barat → Walima.** That's their Instagram taxonomy and the
sequence a bride actually books against, so it's the primary group and it
appears first. Hair follows as the second group, led by **Balayage** — the
named specialism — with general styling after it.

Because that order is a real wedding timeline and not an arbitrary list,
this is the one place on the page where sequence carries information, so the
four events read as a progression (left-to-right on desktop, top-to-bottom
on mobile) rather than an unordered grid.

Every service swatch carries **its own WhatsApp CTA**, prefilled with that
service — tapping Barat opens WhatsApp already saying "Assalam o Alaikum,
I'd like to book Barat Makeup." That register is set in CLAUDE.md and is the
right one for a Sargodha bridal salon; the prefill is composed at render time
from `services[].name`, not stored per-service.

Prices render `PRICE_ON_REQUEST` wherever `priceMin` is null — plain text in
the swatch, never "from Rs —" and never a blank. All of this reads from
`salon.services[]`, in array order.

**Concept.** The page moves like a sequence of jewel-toned panels rather
than one continuous brochure: each section is a full-bleed colour field
(`ink`, `emerald`, `crimson`) seamed to the next by a single gold hairline,
so gold literally stitches the page together the way piping trims a bridal
outfit. Where photography will eventually go, solid-colour blocks sit at the
real target aspect ratio (4:5 portrait for people, 1:1 for service swatches,
16:9 for the map) in the section's accent colour — they read as fabric
swatches now, and drop in as photos later without touching layout. Type sits
directly on these fields in `ivory`/`gold`, large and confident, so the page
gets its warmth from colour and craft instead of imagery. Built mobile-first:
one column, generous vertical rhythm, everything reachable with a thumb.

**Mobile — 375px**

```
┌─────────────────────────────┐
│ ink   Sonia's         ( ' ) │  header: wordmark + bare seal
│ ─────────────────gold rule──│
│                              │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │   crimson block       │  │  4:5 — future hero portrait
│  │   (4:5)               │  │
│  │                       │  │
│  └───────────────────────┘  │
│                              │
│  Sargodha's Bridal Artist   │  Fraunces H1, ivory
│  & Balayage Expert          │
│                              │
│  Certified Makeup Artist ·  │  gold, Karla 600 13px
│  trained at Kashee's        │  plain type — no badge
│  Official & Amina Raja      │
│  Makeup Studio               │
│                              │
│  ╭────────────────────────╮ │
│  │ ( ' )  Book on WhatsApp│ │  in-flow hairline pill
│  ╰────────────────────────╯ │
│ ─────────────────gold rule──│
├──────────────────────────────┤
│ emerald   SERVICES           │
│                              │
│  Bridal — the four events    │
│  in wedding order:           │
│                              │
│  ┌────┐ Mehndi   On request  │
│  │1:1 │ Festive look…        │
│  └────┘ ( ' ) Ask about this │  per-service prefilled CTA
│  ┌────┐ Nikah    On request  │
│  │1:1 │ Soft, camera-ready…  │
│  └────┘ ( ' ) Ask about this │
│  ┌────┐ Barat    On request  │
│  │1:1 │ Full bridal glam…    │
│  └────┘ ( ' ) Ask about this │
│  ┌────┐ Walima   On request  │
│  │1:1 │ Elegant reception…   │
│  └────┘ ( ' ) Ask about this │
│                              │
│  Hair                        │
│  ┌────┐ Balayage On request  │
│  │1:1 │ Hand-painted colour  │
│  └────┘ ( ' ) Ask about this │
│  ┌────┐ Hair Styling         │
│  │1:1 │          On request  │
│  └────┘ ( ' ) Ask about this │
│ ─────────────────gold rule──│
├──────────────────────────────┤
│ ink   ABOUT                  │
│                              │
│  ┌───────────────────────┐  │
│  │ magenta block (4:5)   │  │  future owner portrait
│  └───────────────────────┘  │
│  Trained by Kashee's        │
│  Official & Amina Raja      │
│  Makeup Studio               │
│  49.9K on Instagram ✓        │
│ ─────────────────gold rule──│
├──────────────────────────────┤
│ ink   HOURS & LOCATION        │
│                              │
│  Call to confirm timings     │  hours.verified === false
│  + WhatsApp CTA               │  NO invented schedule
│                              │
│  Sargodha, Punjab            │  city only until confirmed
│                              │
│  ┌───────────────────────┐  │
│  │ crimson block (16:9)  │  │  future map / storefront
│  └───────────────────────┘  │
│ ─────────────────gold rule──│
├──────────────────────────────┤
│ crimson   CONTACT             │
│  Ready to book your day?     │  Fraunces H2, ivory
│  ╭────────────────────────╮ │
│  │ ( ' )  Book on WhatsApp│ │  in-flow pill, repeated
│  ╰────────────────────────╯ │
│ ─────────────────gold rule──│
├──────────────────────────────┤
│ ink   FOOTER                  │
│  ( ' )  Sonia's · Sargodha    │  bare seal as brand mark
│  Instagram · WhatsApp         │
└──────────────────────────────┘
     ╭─────────────────────╮
     │ ( ' ) Book on WhatsApp│   sticky, fixed bottom-right
     ╰─────────────────────╯    hairline pill + label
```

**Desktop — ~1440px**

```
┌──────────────────────────────────────────────────────────────────┐
│ ink ( ' ) Sonia's   Services   About   Hours                     │
│ ──────────────────────────────gold rule───────────────────────── │
│                                                                    │
│   Sargodha's Bridal          ┌──────────────┐                     │
│   Artist & Balayage          │   crimson     │                    │
│   Expert                     │   block 4:5   │                    │
│                               │              │                    │
│   Certified Makeup Artist ·  │              │                    │
│   trained at Kashee's        └──────────────┘                     │
│   Official & Amina Raja                                           │
│   Makeup Studio                                                   │
│                                                                    │
│   ╭──────────────────────────╮                                    │
│   │ ( ' )  Book on WhatsApp  │                                    │
│   ╰──────────────────────────╯                                    │
│ ──────────────────────────────gold rule───────────────────────── │
│ emerald  SERVICES                                                 │
│                                                                    │
│   Bridal — wedding order ──────────────────────────────►          │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                          │
│  │emerald│  │magenta│  │crimson│  │ gold  │   1:1 swatches         │
│  │  1:1  │  │  1:1  │  │  1:1  │  │  1:1  │                        │
│  └──────┘  └──────┘  └──────┘  └──────┘                          │
│   Mehndi     Nikah     Barat     Walima                           │
│   On request On request On request On request                     │
│   ( ' ) Ask  ( ' ) Ask  ( ' ) Ask  ( ' ) Ask   prefilled per svc   │
│                                                                    │
│   Hair                                                             │
│  ┌──────┐  ┌──────┐                                               │
│  │magenta│  │crimson│                                              │
│  └──────┘  └──────┘                                               │
│   Balayage   Hair Styling                                          │
│   On request On request                                            │
│   ( ' ) Ask  ( ' ) Ask                                             │
│ ──────────────────────────────gold rule───────────────────────── │
│ ink  ABOUT                                                         │
│                                                                    │
│  ┌──────────────┐   Trained by Kashee's Official &                │
│  │  magenta      │   Amina Raja Makeup Studio.                    │
│  │  block 4:5    │   Certified Makeup Artist ·                    │
│  │               │   49.9K followers on Instagram ✓               │
│  └──────────────┘                                                 │
│ ──────────────────────────────gold rule───────────────────────── │
│ ink  HOURS & LOCATION                    two columns              │
│                                                                    │
│  Call to confirm timings     ┌───────────────────┐                │
│  + WhatsApp CTA               │  crimson block     │                │
│                               │  16:9              │                │
│  Sargodha, Punjab            └───────────────────┘                │
│ ──────────────────────────────gold rule───────────────────────── │
│ crimson  CONTACT — centered                                       │
│              Ready to book your day?                              │
│           ╭──────────────────────────╮                            │
│           │ ( ' )  Book on WhatsApp  │                            │
│           ╰──────────────────────────╯                            │
│ ──────────────────────────────gold rule───────────────────────── │
│ ink  FOOTER — 3 cols: ( ' ) wordmark | nav | Instagram/WhatsApp   │
└──────────────────────────────────────────────────────────────────┘
                          ╭──────────────────────────╮
                          │ ( ' )  Book on WhatsApp  │  sticky
                          ╰──────────────────────────╯
```

**Self-check.** The default move for "no photos yet" is grey boxes with a
mountain-icon placeholder — explicitly ruled out in the brief, and I'd
default to it too if I weren't watching for it. Revised to aspect-correct
colour blocks in the actual section accent, so they're doing double duty as
real design (fabric-swatch colour blocking) rather than reading as
"unfinished." I also nearly gave services a generic 3-column card grid with
rounded corners and drop shadows — the standard SaaS-card look — and swapped
to flat, square-cornered swatches with hairline gold edges so they feel
inlaid rather than floating.

---

## 4. Signature

**The gold seal — a mark pulled from the wordmark's own raised apostrophe —
carried inside a hairline pill that says what it does.**

The apostrophe in "Sonia's" is extracted as its own small gold glyph. It has
two jobs, and they are deliberately separated:

**As the sticky CTA (its working job).** A pill with a 1px `gold` hairline
border on a transparent ground, containing the seal glyph followed by the
words **"Book on WhatsApp"** in Karla 600. Fixed to the bottom-right thumb
zone, constant shape and position while ink / emerald / crimson grounds
scroll behind it. The seal stays the memorable mark; the label removes all
doubt about what tapping does. Nothing about it resembles the stock green
bubble — it's a hairline pill in the page's own gold, not a filled circle in
Meta's brand colour.

**As the brand mark (its quiet job).** The bare seal, no label, no pill, in
the header beside the wordmark and again in the footer. There it's pure
identity — it isn't asking for a tap, so it doesn't need to explain itself.

The same glyph in both places ties the page together; only the CTA carries
the words.

**Self-check.** Two defaults were in play here. The first is the floating
circular green WhatsApp bubble — the single most "any business anywhere"
element available, and rejecting it was right. But the first draft of this
plan over-corrected into the opposite failure: a bare abstract gold
apostrophe, floating unlabelled, is distinctive and *illegible* — a bride
has no way to know it opens WhatsApp, and the page has exactly one job that
this element exists to serve. Revised to the labelled hairline pill: this is
the one place on the page where legibility outranks distinctiveness, and the
seal keeps its memorability by living unlabelled in the header and footer
instead. Distinctiveness moved to where it costs nothing.

---

## What I'd flag before building

- **Blocking:** `src/config/salon.ts` is the client-authored config. Real,
  confirmed data (owner, email, socials, address, credentials) is tagged
  `CONFIRMED`; everything unconfirmed is `null` or tagged `TODO`. Prices are
  all `priceMin: null` rendering `PRICE_ON_REQUEST`; `hours.verified` is
  `false` with every time nulled; `info.isDemoNumber` is `true`. The page can
  be built and viewed in this state but **cannot ship** until real values
  land — and the nulls must be replaced by the client, never guessed. Two
  sections render an unconfirmed state until then: hours ("Call to confirm
  timings" plus a WhatsApp CTA) and every WhatsApp CTA (demo label showing).
- `info.whatsappNumber` is still the literal `"92XXXXXXXXXX"` — not a
  dialable number. Every CTA must stay gated until a real test line is set.
- `gold` (`#BE9B4D`) on `ink` is fine for large text and rules; I'm
  deliberately keeping it off small body copy so contrast is never in
  question. Worth a second look once real content (especially the
  credential line) is in place.
- The `@theme` tokens below are the proposed Tailwind names — not yet
  written into `globals.css`.

```css
@theme {
  --color-ink: #1B0F13;
  --color-ink-2: #2A1820;
  --color-crimson: #8C2331;
  --color-gold: #BE9B4D;
  --color-emerald: #1E5C4C;
  --color-magenta: #9C2A5E;
  --color-ivory: #EFE7D8;

  --font-display: "Fraunces", ui-serif, Georgia, serif;
  --font-body: "Karla", ui-sans-serif, system-ui, sans-serif;
}
```

Waiting on your approval before any component or page code gets written.
