/**
 * The scroll score for the cinematic landing page.
 *
 * One tall scroll container drives a sticky stage. `scrollYProgress` runs 0→1
 * across that container, and each beat owns a slice of it. Everything that
 * animates reads its range from here, so the timing of the whole page can be
 * retuned in one file rather than hunted through components.
 *
 * Beats are contiguous and cover 0→1 with no gaps: a gap would be a stretch of
 * scroll where nothing is on screen.
 */

export type Beat = {
  id: string;
  /** Shown in the debug overlay only. */
  label: string;
  /** [start, end] of this beat within scrollYProgress. */
  range: readonly [number, number];
};

export const BEATS = [
  { id: "arrival", label: "Arrival", range: [0, 0.12] },
  { id: "services", label: "Services", range: [0.12, 0.3] },
  { id: "gallery", label: "Gallery", range: [0.3, 0.48] },
  { id: "meet", label: "Meet Sonia", range: [0.48, 0.62] },
  { id: "booking", label: "Booking", range: [0.62, 0.8] },
  { id: "contact", label: "Contact", range: [0.8, 1] },
] as const satisfies readonly Beat[];

/** A beat by id, so a component never depends on its index in the score. */
export function beat(id: BeatId): Beat {
  const found = BEATS.find((b) => b.id === id);
  if (!found) throw new Error(`stage: no beat "${id}"`);
  return found;
}

/**
 * A point inside a beat, as a fraction of its width.
 *
 * Beats express their internal timing this way rather than as absolute
 * progress numbers, so re-spacing the score — which happened when Meet Sonia
 * was added as a sixth section — moves every reveal with its beat instead of
 * leaving hardcoded constants pointing into a neighbour.
 */
export function at(b: Beat, fraction: number): number {
  const [start, end] = b.range;
  return start + (end - start) * fraction;
}

export type BeatId = (typeof BEATS)[number]["id"];

/**
 * Scroll length of the container.
 *
 * Under 768px this drops to 350vh: the same five beats over less scroll, so a
 * phone reaches the booking CTA without a marathon. Expressed as Tailwind
 * classes rather than a JS media query so the height is correct on first paint
 * and never needs a re-render to fix itself.
 */
export const STAGE_HEIGHT_CLASS = "h-[350vh] md:h-[500vh]";

/**
 * Where a beat sits as a fraction, for the debug overlay's ruler.
 */
export function beatWidth(beat: Beat): number {
  return beat.range[1] - beat.range[0];
}

/**
 * Progress *within* one beat, 0→1, clamped outside it.
 *
 * Sections use this so their internal timing is independent of where the beat
 * sits in the global score; moving a beat does not re-time its contents.
 */
export function localProgress(progress: number, beat: Beat): number {
  const [start, end] = beat.range;
  if (end === start) return 0;
  return Math.min(1, Math.max(0, (progress - start) / (end - start)));
}

/** The beat a given global progress falls in. The last beat owns 1.0. */
export function activeBeat(progress: number): Beat {
  for (const beat of BEATS) {
    if (progress >= beat.range[0] && progress < beat.range[1]) return beat;
  }
  return BEATS[BEATS.length - 1];
}
