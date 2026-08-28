/**
 * The scroll walkthrough — generated salon interiors used as the moving
 * backdrop for the Arrival and Services beats.
 *
 * THESE ARE NOT SONIA'S WORK. They are synthetic room renders and must never
 * appear in the portfolio gallery, which is her real bridal photography. They
 * live under /images/walkthrough/ for that reason, and the two sets are kept
 * apart by construction: nothing in this project globs an image directory, so
 * a file can only reach the gallery by being listed explicitly in
 * `salon.portfolio.items`. Adding a frame here cannot leak it there.
 *
 * Order is the walk: 01 is the wide view from the entrance, 05 is a close
 * detail of brushes on marble. Consecutive frames cross-fade, so reordering
 * this array reorders the journey.
 */

export type WalkthroughFrame = {
  src: string;
  /** Intrinsic size, so the browser can reserve the right decode buffer. */
  width: number;
  height: number;
  /** Authoring note. Not rendered — the frames are decorative. */
  note: string;
};

export const WALKTHROUGH: readonly WalkthroughFrame[] = [
  {
    src: "/images/walkthrough/stage-01.webp",
    width: 1376,
    height: 768,
    note: "Wide view from the entrance.",
  },
  {
    src: "/images/walkthrough/stage-02.webp",
    // Half the resolution of its neighbours. Upscaled to the same box, so it
    // is the one frame that can look soft on a high-density screen.
    width: 688,
    height: 387,
    note: "Second step in. LOW RES — regenerate at 1376x768 to match.",
  },
  {
    src: "/images/walkthrough/stage-03.webp",
    width: 1376,
    height: 768,
    note: "Deeper into the room.",
  },
  {
    src: "/images/walkthrough/stage-04.webp",
    width: 1376,
    height: 768,
    note: "Approaching the station.",
  },
  {
    src: "/images/walkthrough/stage-05.webp",
    width: 1376,
    height: 768,
    note: "Close detail — brushes on marble.",
  },
] as const;

/**
 * The frames span Arrival and Services together, so the walk keeps moving
 * while the service cards arrive rather than freezing on the last interior.
 */
export const WALKTHROUGH_RANGE = [0, 0.35] as const;

/** Cross-fade overlap, in global progress units. Must be under half a segment. */
export const WALKTHROUGH_FADE = 0.02;

/**
 * Keyframes for one frame's opacity, as [input, output] for useTransform.
 *
 * The first frame is already on screen at progress 0 and the last has to hold
 * to the end of the range, so those two get open-ended ramps — useTransform
 * clamps outside its input range, which is exactly the hold we want.
 */
export function frameOpacityKeyframes(
  index: number,
  count: number,
): { input: number[]; output: number[] } {
  const [start, end] = WALKTHROUGH_RANGE;
  const seg = (end - start) / count;
  const from = start + index * seg;
  const to = start + (index + 1) * seg;
  const f = WALKTHROUGH_FADE;

  if (index === 0) return { input: [to - f, to + f], output: [1, 0] };
  if (index === count - 1)
    return { input: [from - f, from + f], output: [0, 1] };
  return {
    input: [from - f, from + f, to - f, to + f],
    output: [0, 1, 1, 0],
  };
}

/** The window a frame is scaling across, slightly wider than its visible slot. */
export function frameScaleRange(index: number, count: number): [number, number] {
  const [start, end] = WALKTHROUGH_RANGE;
  const seg = (end - start) / count;
  const f = WALKTHROUGH_FADE;
  return [start + index * seg - f, start + (index + 1) * seg + f];
}

/** Which frame is nearest to on-screen, used to decide what to preload next. */
export function frameIndexAt(progress: number, count: number): number {
  const [start, end] = WALKTHROUGH_RANGE;
  const seg = (end - start) / count;
  const i = Math.floor((progress - start) / seg);
  return Math.min(count - 1, Math.max(0, i));
}
