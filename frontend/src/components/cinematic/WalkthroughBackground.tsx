"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import {
  WALKTHROUGH,
  frameIndexAt,
  frameOpacityKeyframes,
  frameScaleRange,
} from "@/lib/walkthrough";
import { usePrefersReducedMotion } from "@/lib/viewport";

/**
 * The moving backdrop: five salon interiors cross-fading in walk order across
 * the Arrival and Services beats.
 *
 * Every frame is in the DOM from first paint, stacked and absolutely
 * positioned, with only opacity and scale animated. Cross-fading two layers
 * that already exist costs nothing at fade time — swapping one <img> src would
 * fetch and decode mid-scroll, which is the flash this avoids.
 *
 * Plain <img>, deliberately: next.config.ts sets images.unoptimized, so
 * next/image would add a wrapper and a lazy shim without ever resizing a file.
 * Same reasoning as <SalonImage>.
 *
 * Reduced motion renders frame 01 alone, static, with no transforms and no
 * other frames fetched.
 */
export function WalkthroughBackground({
  progress,
  isCompact,
}: {
  progress: MotionValue<number>;
  isCompact: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Re-render only when the frame index changes — five times over the whole
  // scroll, not once per frame. The animation itself never touches React.
  useMotionValueEvent(progress, "change", (v) => {
    const next = frameIndexAt(v, WALKTHROUGH.length);
    setActiveIndex((current) => (current === next ? current : next));
  });

  // Decode the upcoming frame before it is needed. The file is already
  // downloading; decode() is what guarantees the first cross-fade composites a
  // ready bitmap instead of blanking for a frame.
  useEffect(() => {
    if (reducedMotion) return;
    const next = imgRefs.current[activeIndex + 1];
    if (next?.decode) void next.decode().catch(() => {});
  }, [activeIndex, reducedMotion]);

  if (reducedMotion) {
    const first = WALKTHROUGH[0];
    return (
      <div className="absolute inset-0" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
        <img
          src={first.src}
          alt=""
          width={first.width}
          height={first.height}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {WALKTHROUGH.map((frame, i) => (
        <WalkthroughFrame
          key={frame.src}
          frame={frame}
          index={i}
          progress={progress}
          isCompact={isCompact}
          ref={(el) => {
            imgRefs.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}

function WalkthroughFrame({
  frame,
  index,
  progress,
  isCompact,
  ref,
}: {
  frame: (typeof WALKTHROUGH)[number];
  index: number;
  progress: MotionValue<number>;
  isCompact: boolean;
  ref: (el: HTMLImageElement | null) => void;
}) {
  const count = WALKTHROUGH.length;
  const { input, output } = frameOpacityKeyframes(index, count);
  const opacity = useTransform(progress, input, output);

  // The push-in that makes this read as walking rather than a slideshow. Off
  // under 768px, where the brief calls for fade reveals without depth.
  const scaleRange = frameScaleRange(index, count);
  const scale = useTransform(
    progress,
    scaleRange,
    isCompact ? [1, 1] : [1.04, 1.12],
  );

  return (
    <motion.div
      style={{ opacity, scale, willChange: "transform, opacity" }}
      className="absolute inset-0"
    >
      {/* eslint-disable-next-line @next/next/no-img-element --
          images.unoptimized is set for the static export; next/image would
          wrap and defer without resizing. Matches <SalonImage>. */}
      <img
        ref={ref}
        src={frame.src}
        alt=""
        width={frame.width}
        height={frame.height}
        // Every frame is fetched up front so no cross-fade waits on the
        // network. The first carries high priority so it is not queued behind
        // the four the visitor cannot see yet.
        loading="eager"
        decoding="async"
        fetchPriority={index === 0 ? "high" : "low"}
        className="h-full w-full object-cover"
      />
    </motion.div>
  );
}
