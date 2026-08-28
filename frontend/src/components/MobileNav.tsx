"use client";

import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { copy } from "@/config/copy";

type Item = { href: string; label: string };

/**
 * The mobile menu.
 *
 * Below the desktop breakpoint the nav links used to be `hidden` outright,
 * which left a phone visitor — almost everyone here, since they arrive from
 * an Instagram bio link — with no navigation at all.
 *
 * This is the one place a real button beats a CSS-only disclosure. A checkbox
 * hack cannot announce expanded state, close on Escape, restore focus, or
 * close when a link is followed; with same-page anchors that last one matters,
 * because the panel would otherwise stay open covering the section just jumped
 * to. The cost is a few lines of client JS in a component that is already
 * interactive.
 *
 * Items are passed in rather than imported so this stays a leaf client
 * component and does not pull the section registry — and its server
 * components — into the browser bundle.
 */
export function MobileNav({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes and returns focus to the trigger, which is where a keyboard
  // user expects to land.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Stop the page scrolling behind the open panel.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (open) panelRef.current?.querySelector("a")?.focus();
  }, [open]);

  return (
    <div className="flex items-center gap-1 md:hidden">
      <ThemeToggle />

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? copy.nav.menuClose : copy.nav.menuOpen}
        className="type-meta inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-fg/80 transition-colors duration-200 hover:text-fg"
      >
        {/* Two rules that become an X. Decorative — the button's accessible
            name carries the meaning. */}
        <span aria-hidden="true" className="relative block h-4 w-5">
          <span
            className={`absolute left-0 block h-px w-full bg-current transition-transform duration-200 ease-out ${
              open ? "top-1/2 rotate-45" : "top-1"
            }`}
          />
          <span
            className={`absolute left-0 block h-px w-full bg-current transition-transform duration-200 ease-out ${
              open ? "top-1/2 -rotate-45" : "top-[11px]"
            }`}
          />
        </span>
      </button>

      {open && (
        <>
          {/* Tapping outside closes, matching the affordance of the X. */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[var(--header-h,4rem)] z-30 cursor-default bg-surface/70 backdrop-blur-sm"
          />

          <div
            id="mobile-menu"
            ref={panelRef}
            className="fixed inset-x-0 top-[var(--header-h,4rem)] z-40 border-b border-gold/25 bg-surface"
          >
            <nav aria-label={copy.nav.menuLabel} className="wrap py-4">
              <ul className="flex flex-col">
                {items.map((item) => (
                  <li key={item.href} className="border-t border-gold/15 first:border-t-0">
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="type-card-title flex min-h-[56px] items-center text-fg transition-colors duration-200 hover:text-gold"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
