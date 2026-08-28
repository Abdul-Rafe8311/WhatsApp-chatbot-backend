"use client";

import { useEffect, type RefObject } from "react";
import { ANCHOR_BEATS, at, beat } from "@/lib/stage";
import { usePrefersReducedMotion } from "@/lib/viewport";

/**
 * Makes #work, #about and #services scroll to their beat.
 *
 * A beat is a range of scroll inside a sticky stage, not an element at a
 * document position, so there is nothing for a hash jump to land on: the
 * browser either does nothing or lands on the stage container, and the link
 * reads as dead. An earlier attempt parked zero-height marker elements at the
 * right offsets, which worked in Chromium and did not in Safari — a hidden 1px
 * box is not a dependable scroll target.
 *
 * So the offset is computed instead of being staked out in the DOM. The target
 * is the midpoint of the beat's own range, taken through the same at() helper
 * the reveals use, so re-spacing the score moves the anchors with it. Nothing
 * here knows a number.
 *
 * Only ids in ANCHOR_BEATS are handled. #hours is a real section in normal
 * flow after the stage releases and already has an id, so it is left to the
 * browser — as is every cross-page link.
 *
 * This component only mounts inside the stage. Under prefers-reduced-motion
 * there is no stage: the page is the ordinary stacked one, every section is a
 * real element with its own id, and plain anchors already work. Nothing here
 * runs on that path, so nothing here can break it.
 */
/**
 * Fired once an anchor jump has finished scrolling, so the stage can snap its
 * smoothing spring to the landing position instead of easing there.
 */
export const STAGE_JUMP_EVENT = "stage:jump";

export function AnchorScroll({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";

    /** Scroll position that puts a beat on screen, or null if not ours. */
    function targetFor(rawHash: string): number | null {
      const id = rawHash.replace(/^#/, "");
      const beatId = ANCHOR_BEATS[id];
      if (!beatId) return null;

      const el = containerRef.current;
      if (!el) return null;

      // Measured live rather than cached: the container is sized in vh, so it
      // changes with the viewport and with the mobile URL bar.
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const range = rect.height - window.innerHeight;
      if (range <= 0) return null;

      return Math.round(top + range * at(beat(beatId), 0.5));
    }

    function go(hash: string, how: ScrollBehavior): boolean {
      const y = targetFor(hash);
      if (y === null) return false;
      window.scrollTo({ top: y, behavior: how });

      // The reveals are driven by a spring that eases toward the new progress
      // over about three seconds for a jump this size, so the beat you asked
      // for would fade up long after you arrived. Tell the stage a jump is
      // under way; it tracks the scroll frame by frame until it stops.
      //
      // Announced at the start rather than the end: scrollend is not
      // universally supported, and a fixed timer either fires mid-scroll on a
      // long jump or wastes time on a short one.
      window.dispatchEvent(new CustomEvent(STAGE_JUMP_EVENT));
      return true;
    }

    // Clicks. Handled directly rather than via hashchange alone, because
    // clicking the link for the hash already in the URL fires no hashchange
    // and would otherwise do nothing the second time.
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      // Same-document hashes only. "/services/#facial" is a real navigation.
      if (!href.startsWith("#")) return;
      if (!targetFor(href)) return;

      event.preventDefault();
      // Keep the URL and history honest, so back returns where it should.
      if (window.location.hash !== href) {
        window.history.pushState(null, "", href);
      }
      go(href, behavior);
    }

    // Back and forward. popstate covers both, including moving between two
    // hashes and returning to a URL with no hash at all.
    function onPopState() {
      const hash = window.location.hash;
      if (!hash) return;
      go(hash, behavior);
    }

    // First load with a hash in the URL.
    //
    // Applied more than once on purpose. The container is sized in vh and the
    // walkthrough images are still arriving, so a target computed on the first
    // frames can be measured against a layout that then changes underneath it
    // — on a 390px viewport that overshot to the bottom of the document. So it
    // is re-applied after load, and again shortly after, but only while the
    // visitor has not taken over: any real scroll input cancels the rest.
    let raf1 = 0;
    let raf2 = 0;
    let retry = 0;
    let userScrolled = false;

    function claimScroll() {
      userScrolled = true;
    }

    function applyInitialHash() {
      if (userScrolled) return;
      // "auto" regardless: a smooth scroll from the top of a freshly loaded
      // page is a long animation nobody asked for.
      go(window.location.hash, "auto");
    }

    if (window.location.hash && targetFor(window.location.hash) !== null) {
      // The browser restores the previous scroll position on a reload, which
      // would fight the jump.
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.addEventListener("wheel", claimScroll, { passive: true, once: true });
      window.addEventListener("touchstart", claimScroll, { passive: true, once: true });
      window.addEventListener("keydown", claimScroll, { once: true });

      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(applyInitialHash);
      });
      if (document.readyState === "complete") {
        retry = window.setTimeout(applyInitialHash, 250);
      } else {
        window.addEventListener("load", applyInitialHash, { once: true });
        retry = window.setTimeout(applyInitialHash, 600);
      }
    }

    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onPopState);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(retry);
      window.removeEventListener("wheel", claimScroll);
      window.removeEventListener("touchstart", claimScroll);
      window.removeEventListener("keydown", claimScroll);
      window.removeEventListener("load", applyInitialHash);
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onPopState);
    };
  }, [containerRef, reducedMotion]);

  return null;
}
