"use client";

import { copy } from "@/config/copy";

/**
 * Theme toggle. Deliberately stateless.
 *
 * Which label shows is decided by CSS off the `.dark` class, not by React
 * state, so there is nothing to hydrate and no mismatch between the server
 * render and the class the pre-paint script has already applied. The click
 * handler is the only JavaScript involved.
 *
 * Each variant carries its own visible word and its own screen-reader
 * sentence: the visible "Dark" is short enough for a 375px nav bar, while
 * the accessible name says what pressing it will do.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const isDark = root.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      // Private mode or blocked storage: the toggle still works for this
      // page view, it just will not be remembered.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="type-meta inline-flex min-h-[44px] items-center px-1 text-fg/70 hover:text-fg transition-colors duration-200"
    >
      <span className="dark:hidden">
        <span aria-hidden="true">{copy.theme.toDarkShort}</span>
        <span className="sr-only">{copy.theme.toDark}</span>
      </span>
      <span className="hidden dark:inline">
        <span aria-hidden="true">{copy.theme.toLightShort}</span>
        <span className="sr-only">{copy.theme.toLight}</span>
      </span>
    </button>
  );
}
