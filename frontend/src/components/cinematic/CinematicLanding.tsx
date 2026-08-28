"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  BEATS,
  STAGE_HEIGHT_CLASS,
  type Beat,
} from "@/lib/stage";
import { useIsCompact, usePrefersReducedMotion } from "@/lib/viewport";
import { ScrollDebug } from "@/components/cinematic/ScrollDebug";

/**
 * SCAFFOLD — structure only, no styling yet.
 *
 * One tall container drives one sticky stage. Native scrolling throughout:
 * nothing here calls preventDefault, no scroll library, no scrollTo. The page
 * is a normal document that happens to read its own scroll position.
 *
 * Two escape hatches, both decided before anything animates:
 *   - prefers-reduced-motion renders `fallback` — the ordinary stacked page —
 *     and never mounts the stage at all. Not "the same page with transitions
 *     set to 0s": the sticky container itself is gone.
 *   - Under 768px the container is shorter (see STAGE_HEIGHT_CLASS) and the
 *     background layer's parallax is switched off, keeping the fade/slide
 *     reveals only.
 *
 * The stage occupies beats 1–4. Contact and footer sit after the container in
 * normal flow, so the sticky element releases on its own at the container's
 * end and the footer scrolls like any other page.
 */
export function CinematicLanding({
  fallback,
  contact,
}: {
  /** Rendered instead of the stage when reduced motion is requested. */
  fallback: ReactNode;
  /** Normal-flow content after the stage releases. */
  contact: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isCompact = useIsCompact();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Springing the progress takes the jitter out of trackpad and momentum
  // scrolling. Kept light — too much damping and the stage lags behind the
  // finger on a phone, which reads as jank rather than smoothness.
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.35,
  });

  // Background depth. Disabled on compact viewports per the brief, by feeding
  // the transform a constant instead of branching on the hook result — the
  // number of hooks called must not depend on viewport width.
  const bgScale = useTransform(
    smoothed,
    [0, 0.15, 0.75],
    isCompact ? [1, 1, 1] : [1.15, 1, 1.06],
  );
  const bgY = useTransform(
    smoothed,
    [0, 1],
    isCompact ? ["0%", "0%"] : ["0%", "-6%"],
  );
  // The stage dims through the final beat and hands over to the footer.
  const stageOpacity = useTransform(smoothed, [0.75, 0.97], [1, 0]);

  if (reducedMotion) {
    return (
      <>
        {fallback}
        {contact}
      </>
    );
  }

  return (
    <>
      <div ref={containerRef} className={`relative ${STAGE_HEIGHT_CLASS}`}>
        <div className="sticky top-0 h-dvh overflow-hidden">
          <motion.div
            style={{ opacity: stageOpacity }}
            className="relative h-full w-full"
          >
            {/* Background layer. will-change lives here and nowhere else —
                it is the only element transforming for the whole scroll. */}
            <motion.div
              style={{ scale: bgScale, y: bgY, willChange: "transform" }}
              className="absolute inset-0 bg-surface-2"
              aria-hidden="true"
            >
              <div className="flex h-full w-full items-center justify-center">
                <span className="type-meta text-label">
                  background layer — parallax{" "}
                  {isCompact ? "OFF (compact)" : "ON"}
                </span>
              </div>
            </motion.div>

            {BEATS.filter((b) => b.id !== "contact").map((beat) => (
              <BeatPanel key={beat.id} beat={beat} progress={smoothed} />
            ))}
          </motion.div>
        </div>
      </div>

      {contact}

      <ScrollDebug
        progress={scrollYProgress}
        smoothed={smoothed}
        isCompact={isCompact}
        reducedMotion={reducedMotion}
      />
    </>
  );
}

/**
 * One beat's placeholder. Its own component so each can call useTransform
 * without hooks running in a loop body whose length could change.
 *
 * Fades in over the first fifth of its range and out over the last fifth, so
 * adjacent beats cross-fade rather than cutting.
 */
function BeatPanel({
  beat,
  progress,
}: {
  beat: Beat;
  progress: MotionValue<number>;
}) {
  const [start, end] = beat.range;
  const ramp = (end - start) * 0.2;

  const opacity = useTransform(
    progress,
    [start, start + ramp, end - ramp, end],
    [0, 1, 1, 0],
  );
  // Slide is small and in transform space only.
  const y = useTransform(progress, [start, end], ["24px", "-24px"]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-2"
    >
      <p className="type-h2">{beat.label}</p>
      <p className="type-meta text-label">
        beat {beat.range[0]} – {beat.range[1]}
      </p>
    </motion.div>
  );
}
