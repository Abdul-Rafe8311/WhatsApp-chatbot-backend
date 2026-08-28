"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { STAGE_HEIGHT_CLASS } from "@/lib/stage";
import { useIsCompact, usePrefersReducedMotion } from "@/lib/viewport";
import { ScrollDebug } from "@/components/cinematic/ScrollDebug";
import { WalkthroughBackground } from "@/components/cinematic/WalkthroughBackground";
import { Arrival } from "@/components/cinematic/Arrival";
import { ServicesBeat } from "@/components/cinematic/ServicesBeat";
import { GalleryBeat } from "@/components/cinematic/GalleryBeat";
import { BookingBeat } from "@/components/cinematic/BookingBeat";

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
            {/* Walkthrough frames carry their own depth, so the outer
                parallax wrapper is gone; each frame scales independently. */}
            <motion.div
              style={{ y: bgY, willChange: "transform" }}
              className="absolute inset-0 bg-surface-2"
            >
              <WalkthroughBackground
                progress={smoothed}
                isCompact={isCompact}
              />
            </motion.div>

            <Arrival progress={smoothed} />
            <ServicesBeat progress={smoothed} />
            <GalleryBeat progress={smoothed} />
            <BookingBeat progress={smoothed} />
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
