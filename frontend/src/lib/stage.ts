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
export const STAGE_HEIGHT_CLASS =
  "h-[350vh] md:h-[500vh] [--stage-range:250vh] md:[--stage-range:400vh]";

/**
 * Scrollable distance inside the container, as a CSS length.
 *
 * The container is 350/500vh but only (height - 100vh) of that is scroll,
 * because the sticky stage occupies the last viewport. Anchor targets are
 * positioned against this, not against the container height, or every jump
 * would overshoot by a fifth.
 */
export const STAGE_RANGE_VAR = "var(--stage-range)";

/**
 * Which beat each nav anchor should land on.
 *
 * lib/sections.ts guarantees a nav link cannot exist without a section that
 * renders. The cinematic page broke that: its sections are beats inside a
 * sticky stage, not elements with ids, so #work, #about and #services pointed
 * at nothing and the links silently did nothing. This is the map that restores
 * it — an id here must correspond to a section in the registry, and a beat
 * that exists above.
 *
 * "hours" is absent on purpose: that section renders for real in normal flow
 * after the stage releases, and already carries its own id.
 */
export const ANCHOR_BEATS: Readonly<Record<string, BeatId>> = {
  work: "gallery",
  about: "meet",
  services: "services",
};

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
