"use client";

import { useState } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { BEATS, activeBeat, beatWidth, localProgress } from "@/lib/stage";

/**
 * Development overlay for the scroll score. Not part of the finished page —
 * it exists to prove the progress mapping before any of it is styled.
 *
 * Reads the motion values through useMotionValueEvent and mirrors them into
 * React state. That is a re-render per frame, which is exactly what the real
 * sections must NOT do, and is fine here because this component is removed
 * once the beats are confirmed.
 */
export function ScrollDebug({
  progress,
  smoothed,
  isCompact,
  reducedMotion,
}: {
  progress: MotionValue<number>;
  smoothed: MotionValue<number>;
  isCompact: boolean;
  reducedMotion: boolean;
}) {
  const [raw, setRaw] = useState(0);
  const [spring, setSpring] = useState(0);

  useMotionValueEvent(progress, "change", setRaw);
  useMotionValueEvent(smoothed, "change", setSpring);

  const beat = activeBeat(raw);
  const local = localProgress(raw, beat);

  return (
    <div className="pointer-events-none fixed left-3 top-20 z-[60] w-[19rem] max-w-[calc(100vw-1.5rem)] rounded-lg border border-gold/60 bg-black/85 p-3 font-mono text-[11px] leading-relaxed text-white shadow-xl">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-bold tracking-wide text-gold">SCROLL DEBUG</span>
        <span className="opacity-60">{isCompact ? "compact" : "full"}</span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3">
        <dt className="opacity-60">progress</dt>
        <dd className="tabular-nums">{raw.toFixed(4)}</dd>

        <dt className="opacity-60">spring</dt>
        <dd className="tabular-nums">{spring.toFixed(4)}</dd>

        <dt className="opacity-60">beat</dt>
        <dd>
          {beat.label}{" "}
          <span className="opacity-60">
            [{beat.range[0]} – {beat.range[1]}]
          </span>
        </dd>

        <dt className="opacity-60">local</dt>
        <dd className="tabular-nums">{local.toFixed(3)}</dd>

        <dt className="opacity-60">container</dt>
        <dd>{isCompact ? "350vh" : "500vh"}</dd>

        <dt className="opacity-60">reduced</dt>
        <dd className={reducedMotion ? "text-gold" : "opacity-60"}>
          {reducedMotion ? "ON — stage bypassed" : "off"}
        </dd>
      </dl>

      {/* Ruler: proportional beat segments with a playhead. */}
      <div className="mt-3">
        <div className="relative flex h-5 w-full overflow-hidden rounded border border-white/25">
          {BEATS.map((b, i) => (
            <div
              key={b.id}
              style={{ width: `${beatWidth(b) * 100}%` }}
              className={[
                "flex items-center justify-center text-[9px] uppercase tracking-wider",
                i % 2 ? "bg-white/10" : "bg-white/[0.04]",
                b.id === beat.id ? "text-gold" : "text-white/40",
              ].join(" ")}
            >
              {b.label.slice(0, 4)}
            </div>
          ))}
          <div
            className="absolute top-0 h-full w-0.5 bg-gold"
            style={{ left: `${Math.min(100, Math.max(0, raw * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
