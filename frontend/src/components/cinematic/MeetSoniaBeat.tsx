"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";
import { at, beat } from "@/lib/stage";

const MEET_BEAT = beat("meet");

/**
 * Beat 4 of six — see the work, meet the person, then book.
 *
 * Portrait one side, bio the other, arriving from opposite directions so the
 * two halves meet in the middle rather than sliding in as one block. Same
 * idiom as the other beats: opacity and transform only, timing expressed as
 * fractions of the beat.
 *
 * Nothing here is written for the page. The bio is salon.info.about, which the
 * config marks TODO pending the client's approval of the wording; the heading
 * comes from copy.meetSonia, which already derives it from the owner's name.
 * The credentials line is the same one the hero uses.
 */
export function MeetSoniaBeat({ progress }: { progress: MotionValue<number> }) {
  const [start, end] = MEET_BEAT.range;

  const scrimOpacity = useTransform(
    progress,
    [start - 0.015, at(MEET_BEAT, 0.1), at(MEET_BEAT, 0.9), end],
    [0, 1, 1, 0],
  );
  const contentOpacity = useTransform(
    progress,
    [start, at(MEET_BEAT, 0.18), at(MEET_BEAT, 0.84), at(MEET_BEAT, 0.97)],
    [0, 1, 1, 0],
  );

  // Opposite directions, so the halves converge.
  const portraitX = useTransform(
    progress,
    [start, at(MEET_BEAT, 0.4)],
    ["-6%", "0%"],
  );
  const textX = useTransform(
    progress,
    [start, at(MEET_BEAT, 0.4)],
    ["6%", "0%"],
  );
  const portraitScale = useTransform(
    progress,
    [start, at(MEET_BEAT, 0.95)],
    [1.08, 1],
  );

  const credentials = salon.info.credentials.join(copy.credentialSeparator);
  // salon.ts rule 1: never substitute a value for a null. No portrait on file
  // means the text takes the full width, not a stand-in image.
  const portrait = salon.info.aboutImage;

  return (
    <>
      <motion.div
        style={{ opacity: scrimOpacity }}
        aria-hidden="true"
        className="stage-scrim absolute inset-0"
      />

      <motion.div
        style={{ opacity: contentOpacity }}
        className="absolute inset-0 flex items-center"
      >
        <div className="wrap grid w-full items-center gap-6 text-on-image sm:grid-cols-[5fr_7fr] sm:gap-10">
          {portrait && (
          <motion.div
            style={{ x: portraitX, willChange: "transform" }}
            className="mx-auto w-40 overflow-hidden rounded-2xl ring-1 ring-gold-on-image/40 sm:mx-0 sm:w-full sm:max-w-[22rem]"
          >
            <motion.div style={{ scale: portraitScale }} className="aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element --
                  images.unoptimized is set for the static export; next/image
                  would wrap and defer without resizing. Matches SalonImage. */}
              <img
                src={portrait}
                alt={salon.info.aboutImageAlt ?? ""}
                loading="eager"
                decoding="async"
                fetchPriority="low"
                className="h-full w-full object-cover"
              />
            </motion.div>
          </motion.div>
          )}

          <motion.div
            style={{ x: textX, willChange: "transform" }}
            className="flex flex-col gap-3 sm:gap-4"
          >
            <h2 className="type-h2">
              {copy.meetSonia.headingFor(salon.info.owner)}
            </h2>
            {/* line-clamp rather than a shortened copy: the full bio stays in
                config and on the stacked page, and the stage shows as much of
                it as one viewport holds. */}
            <p className="type-body line-clamp-6 text-on-image/90 sm:line-clamp-none">
              {salon.info.about}
            </p>
            <p className="type-meta text-gold-on-image">{credentials}</p>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
