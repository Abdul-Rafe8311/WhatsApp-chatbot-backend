"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";
import { BEATS, type Beat } from "@/lib/stage";

const ARRIVAL: Beat = BEATS[0];

/**
 * Beat 1 — the salon name over the opening frame of the walkthrough.
 *
 * The scrim lifts rather than cuts: it opens near full strength so the type is
 * legible against whatever the render happens to put behind it, then thins as
 * the visitor scrolls and the room becomes the subject. It never reaches zero
 * while the type is still on screen.
 *
 * Composition deliberately matches <Hero> — bottom-left inside `.wrap`, name
 * in the display face, supporting line beneath — so arriving on the cinematic
 * page and arriving on the reduced-motion stacked page look like the same
 * brand rather than two designs.
 *
 * Name and tagline come from salon.ts, both marked CONFIRMED. Nothing here is
 * written for the page.
 */
export function Arrival({ progress }: { progress: MotionValue<number> }) {
  const [start, end] = ARRIVAL.range;

  // Present at rest, then clears well before the beat ends so it is gone by
  // the time the second walkthrough frame takes over.
  //
  // It does NOT fade in on scroll. Keying the entrance to progress means the
  // name is invisible until the visitor moves, so the page lands on a dark
  // empty frame — the opposite of an arrival. The fade-in is a mount
  // animation on the inner element instead, which plays on load.
  const textOpacity = useTransform(
    progress,
    [start, end - 0.055, end - 0.02],
    [1, 1, 0],
  );
  const textY = useTransform(progress, [start, end], ["0px", "-40px"]);

  // The lift. Held above the value the type needs while the type is visible.
  const scrimOpacity = useTransform(progress, [start, end], [1, 0.45]);

  // The cue is the first thing to go — once someone is scrolling it has done
  // its job and would only be clutter.
  const cueOpacity = useTransform(progress, [start, start + 0.03], [1, 0]);

  return (
    <>
      <motion.div
        style={{ opacity: scrimOpacity }}
        aria-hidden="true"
        className="hero-scrim absolute inset-0"
      />

      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="wrap absolute inset-x-0 bottom-0 flex flex-col items-start gap-4 pb-24 text-on-image sm:pb-28"
      >
        <motion.div
          className="flex flex-col items-start gap-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          <h1 className="type-hero">{salon.info.name}</h1>
          <p className="type-lead">{salon.info.tagline}</p>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity: cueOpacity }}
        aria-hidden="true"
        className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-on-image"
      >
        <span className="type-meta">{copy.cinematic.scrollCue}</span>
        {/* Transform-only bob. The reduced-motion media query in globals.css
            already flattens animation durations, and this whole stage is
            bypassed under that setting anyway. */}
        <motion.svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.div>
    </>
  );
}
