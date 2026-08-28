"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";
import { formatPrice } from "@/lib/price";
import { BEATS } from "@/lib/stage";

const SERVICES_BEAT = BEATS[1];

/**
 * The cards shown at this station, by id, in walk order.
 *
 * Ids, not names or a filter: a typo here is a build-time failure rather than
 * a card that silently disappears. Every entry resolves against salon.ts, so
 * nothing on screen is written for this page.
 *
 * NOTE: "bridal makeup" is not a service — Bridal is a *category* covering the
 * four wedding days plus Engagement. Rather than invent an entry, the
 * category's own note from copy.services.groupNotes carries that idea as the
 * beat's lead line. "Hair styling" resolves to "Haircut & Styling".
 */
const CARD_IDS = [
  "mehndi",
  "nikah",
  "barat",
  "walima",
  "engagement",
  "balayage",
  "haircut",
] as const;

const CARDS = CARD_IDS.map((id) => {
  const service = salon.services.find((s) => s.id === id);
  if (!service) {
    throw new Error(
      `ServicesBeat: no service with id "${id}" in salon.services`,
    );
  }
  return service;
});

/** Entry window per card. Each lands on its own slice, none together. */
const FIRST_IN = 0.165;
const STAGGER = 0.018;
const RISE = 0.03;
/** Everything clears before the Gallery beat takes the frame. */
const HOLD_UNTIL = 0.325;
const CLEAR_BY = 0.348;

export function ServicesBeat({ progress }: { progress: MotionValue<number> }) {
  const [start] = SERVICES_BEAT.range;

  // The scrim and heading lead the cards in.
  const scrimOpacity = useTransform(
    progress,
    [start - 0.02, start + 0.02, HOLD_UNTIL, CLEAR_BY],
    [0, 1, 1, 0],
  );
  const headingOpacity = useTransform(
    progress,
    [start - 0.005, start + 0.025, HOLD_UNTIL, CLEAR_BY],
    [0, 1, 1, 0],
  );
  const headingY = useTransform(
    progress,
    [start - 0.005, start + 0.025],
    ["18px", "0px"],
  );

  return (
    <>
      <motion.div
        style={{ opacity: scrimOpacity }}
        aria-hidden="true"
        className="stage-scrim absolute inset-0"
      />

      <div className="absolute inset-0 flex items-center">
        <div className="wrap flex w-full flex-col gap-5 text-on-image sm:gap-7">
          <motion.div
            style={{ opacity: headingOpacity, y: headingY }}
            className="flex flex-col gap-1"
          >
            <h2 className="type-h2">{copy.services.heading}</h2>
            <p className="type-body">{copy.services.groupNotes.Bridal}</p>
          </motion.div>

          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {CARDS.map((service, i) => (
              <ServiceCard
                key={service.id}
                index={i}
                progress={progress}
                name={service.name}
                description={service.description}
                price={formatPrice(service)}
              />
            ))}
          </ul>

          {/* Every figure in salon.ts is priceEstimated. The note is not
              decoration — it is the difference between a guide and a quote. */}
          <motion.p
            style={{ opacity: headingOpacity }}
            className="type-meta text-on-image/80"
          >
            {copy.services.priceGuideNote}
          </motion.p>
        </div>
      </div>
    </>
  );
}

function ServiceCard({
  index,
  progress,
  name,
  description,
  price,
}: {
  index: number;
  progress: MotionValue<number>;
  name: string;
  description: string;
  price: string;
}) {
  const from = FIRST_IN + index * STAGGER;
  const to = from + RISE;

  const opacity = useTransform(
    progress,
    [from, to, HOLD_UNTIL, CLEAR_BY],
    [0, 1, 1, 0],
  );
  // Transform only — never top/height.
  const y = useTransform(progress, [from, to], ["32px", "0px"]);

  return (
    <motion.li
      style={{ opacity, y, willChange: "transform, opacity" }}
      // bg-black/40, not a lighter tint: measured against the brightest pixel
      // under every card across all five frames, /25 left the gold price line
      // at 3.81:1 — under AA for its size. /40 is the least that clears it.
      className="flex flex-col gap-1 rounded-xl border border-gold-on-image/40 bg-black/40 p-3 backdrop-blur-[2px] sm:gap-1.5 sm:p-4"
    >
      {/* The link wraps the name, never the card: WhatsAppLink's children must
          be phrasing content, and a heading may wrap it but not the reverse.
          Same gate as every other WhatsApp destination on the site — while the
          number is not dialable this renders an inert button, styled
          identically, so the card never changes shape when the gate opens. */}
      <h3 className="type-card-title">
        <WhatsAppLink
          prefill={copy.cta.servicePrefill(name)}
          ariaLabel={copy.cta.serviceAriaLabel(name)}
          className="text-left underline-offset-4 hover:underline focus-visible:outline-on-image focus-visible:outline-offset-4"
        >
          {name}
        </WhatsAppLink>
      </h3>
      {/* The line that explains the service is the first thing to go when
          there is no room for it — the name and the price are the payload. */}
      <p className="type-body hidden text-[0.9375rem] text-on-image/85 sm:block">
        {description}
      </p>
      <p className="type-data text-gold-on-image">{price}</p>
    </motion.li>
  );
}
