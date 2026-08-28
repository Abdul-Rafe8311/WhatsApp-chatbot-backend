"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribe to a media query without a hydration mismatch.
 *
 * useSyncExternalStore rather than useEffect + useState: the server snapshot is
 * explicit, so the prerendered HTML and the first client render agree, and the
 * correct value lands on the first commit instead of a frame later.
 */
function useMediaQuery(query: string, serverSnapshot: boolean): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverSnapshot,
  );
}

/**
 * Under Tailwind's `md` breakpoint. Matches STAGE_HEIGHT_CLASS, which shortens
 * the scroll container at the same width.
 *
 * Server snapshot is false. A static export has no request headers to guess
 * from, and guessing "mobile" would give every desktop visitor a frame of the
 * reduced treatment.
 */
export function useIsCompact(): boolean {
  return useMediaQuery("(max-width: 767px)", false);
}

/**
 * The OS "reduce motion" setting.
 *
 * Server snapshot is false so the animated page is what gets prerendered; the
 * first client commit switches to the static fallback for anyone who asked for
 * it. framer-motion ships its own useReducedMotion, but it initialises to null
 * and fills in after an effect, which is a frame of animation for exactly the
 * people who opted out.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)", false);
}
