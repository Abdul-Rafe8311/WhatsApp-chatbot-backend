"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { OPEN_CHAT_EVENT } from "@/components/ChatWidget";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { copy } from "@/config/copy";
import { BEATS } from "@/lib/stage";
import { whatsappReady } from "@/lib/whatsapp";

const BOOKING_BEAT = BEATS[3];

/**
 * Beat 4 — the room goes dark and the ask arrives.
 *
 * Two routes, and which one is load-bearing depends on config. The WhatsApp
 * pill is the salon's primary conversion, but it routes through
 * <WhatsAppCTA> → <WhatsAppLink>, which renders an inert button while
 * salon.info.whatsappNumber is not dialable. That is the state today, so the
 * chat widget — which does reach the booking agent — is the only route that
 * currently works, and it is named rather than left as a floating icon the
 * visitor has to notice on their own.
 *
 * The pill is deliberately not hidden while inert. Its presence is what tells
 * a visitor WhatsApp is how this salon books; the gate stops them tapping
 * through to a number that would not answer. The demo notice underneath is the
 * honest explanation, and it disappears on its own the moment a real number is
 * set — nothing here needs editing when that happens.
 */
export function BookingBeat({ progress }: { progress: MotionValue<number> }) {
  const [start, end] = BOOKING_BEAT.range;

  // The dim is on top of .stage-scrim, not instead of it: the walkthrough
  // should recede to almost nothing here so the CTA is the only thing with
  // any weight left on screen.
  const dimOpacity = useTransform(
    progress,
    [start - 0.02, start + 0.05, end - 0.02, end],
    [0, 0.72, 0.72, 0.5],
  );

  const contentOpacity = useTransform(
    progress,
    [start, start + 0.045, end - 0.04, end - 0.01],
    [0, 1, 1, 0],
  );
  // Scales in, never out: shrinking on exit reads as the offer being withdrawn.
  const contentScale = useTransform(
    progress,
    [start, start + 0.06],
    [0.92, 1],
  );

  function openChat() {
    window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT));
  }

  return (
    <>
      <motion.div
        style={{ opacity: dimOpacity }}
        aria-hidden="true"
        className="absolute inset-0 bg-black"
      />

      <motion.div
        style={{ opacity: contentOpacity, scale: contentScale }}
        className="absolute inset-0 flex items-center"
      >
        <div className="wrap flex w-full flex-col items-center gap-6 text-center text-on-image">
          <h2 className="type-h2">{copy.cinematic.booking.heading}</h2>
          <p className="type-lead max-w-[36ch]">{copy.services.pageOutro}</p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <WhatsAppCTA
              prefill={copy.cta.generalPrefill}
              label={copy.cta.label}
              tone="onImage"
            />

            <button
              type="button"
              onClick={openChat}
              className="type-cta inline-flex min-h-[44px] items-center justify-center rounded-full border border-gold-on-image px-7 py-4 text-on-image transition-colors duration-200 hover:bg-gold-on-image/15 focus-visible:outline-on-image focus-visible:outline-offset-4"
            >
              {copy.cinematic.booking.chatLabel}
            </button>
          </div>

          {/* Auto-hides the moment a dialable number is configured. */}
          {!whatsappReady && (
            <p className="type-meta text-on-image/80">
              {copy.footer.demoNotice}
            </p>
          )}
        </div>
      </motion.div>
    </>
  );
}
