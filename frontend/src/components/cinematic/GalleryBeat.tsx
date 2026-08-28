"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";
import { BEATS } from "@/lib/stage";

const GALLERY_BEAT = BEATS[2];

/**
 * The filmstrip: Sonia's bridal photographs travelling on X as the page
 * scrolls on Y.
 *
 * WHAT IS NOT HERE, and why. The brief asked for before/after pairs alongside
 * the bridal looks. salon.beforeAfter is `verified: false` with an empty
 * `pairs` array — the salon has not supplied any — so there is nothing to
 * show and nothing is invented to fill the gap. The strip is the four
 * portfolio entries that actually carry a photograph; the other three are
 * `image: null`, which salon.ts defines as "not confirmed" and forbids
 * substituting for. Empty slots would pad the strip with three grey panels
 * and misrepresent how much work is on file.
 *
 * These are the only photographs of real work on the page, so they carry their
 * full alt text rather than being decorative like the walkthrough frames.
 */
const SHOTS = salon.portfolio.items.filter(
  (item): item is typeof item & { image: string; imageAlt: string } =>
    typeof item.image === "string" && typeof item.imageAlt === "string",
);

const RATIO_CLASS: Record<string, string> = {
  "4:5": "aspect-[4/5]",
  "1:1": "aspect-square",
  "3:2": "aspect-[3/2]",
  "16:9": "aspect-[16/9]",
};

/** Travel occupies the middle of the beat, leaving room to arrive and clear. */
const TRAVEL_FROM = 0.375;
const TRAVEL_TO = 0.525;

export function GalleryBeat({ progress }: { progress: MotionValue<number> }) {
  const [start, end] = GALLERY_BEAT.range;

  const trackRef = useRef<HTMLUListElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(0);

  // How far the strip can travel is a measurement, not a guess: the frames are
  // sized in viewport units and their count comes from config, so a hardcoded
  // percentage would under-travel on a wide screen and over-travel on a narrow
  // one, leaving either dead space or photographs that never come into view.
  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const measure = () => {
      setOverflow(Math.max(0, track.scrollWidth - viewport.clientWidth));
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, []);

  const x = useTransform(progress, (v) => {
    const t = Math.min(1, Math.max(0, (v - TRAVEL_FROM) / (TRAVEL_TO - TRAVEL_FROM)));
    return -overflow * t;
  });

  const scrimOpacity = useTransform(
    progress,
    [start - 0.02, start + 0.02, end - 0.03, end],
    [0, 1, 1, 0],
  );
  const contentOpacity = useTransform(
    progress,
    [start - 0.005, start + 0.03, end - 0.035, end - 0.005],
    [0, 1, 1, 0],
  );
  const headingY = useTransform(
    progress,
    [start - 0.005, start + 0.03],
    ["18px", "0px"],
  );

  return (
    <>
      <motion.div
        style={{ opacity: scrimOpacity }}
        aria-hidden="true"
        className="stage-scrim absolute inset-0"
      />

      <motion.div
        style={{ opacity: contentOpacity }}
        className="absolute inset-0 flex flex-col justify-center gap-5 text-on-image sm:gap-7"
      >
        <motion.div style={{ y: headingY }} className="wrap">
          {/* Heading only. copy.portfolio.intro names party and colour work,
              and no photograph of either exists yet — it would describe a
              strip the visitor cannot see. */}
          <h2 className="type-h2">{copy.portfolio.heading}</h2>
        </motion.div>

        {/* Full-bleed on purpose: the strip should run off both edges so it
            reads as continuing past the frame rather than as a centred row. */}
        <div ref={viewportRef} className="w-full overflow-hidden">
          <motion.ul
            ref={trackRef}
            style={{ x, willChange: "transform" }}
            className="flex w-max items-center gap-4 px-[22vw] sm:gap-6 sm:px-[26vw]"
          >
            {SHOTS.map((shot) => (
              <li
                key={shot.id}
                className={`${RATIO_CLASS[shot.ratio] ?? "aspect-[4/5]"} h-[44vh] shrink-0 overflow-hidden rounded-xl ring-1 ring-gold-on-image/30 sm:h-[60vh]`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element --
                    images.unoptimized is set for the static export; next/image
                    would wrap and defer without resizing. Matches SalonImage. */}
                <img
                  src={shot.image}
                  alt={shot.imageAlt}
                  loading="eager"
                  decoding="async"
                  fetchPriority="low"
                  className="h-full w-full object-cover"
                />
              </li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
    </>
  );
}
