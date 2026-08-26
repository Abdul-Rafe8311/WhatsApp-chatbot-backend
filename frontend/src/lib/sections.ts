import type { ComponentType } from "react";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { copy } from "@/config/copy";

export type Section = {
  /** Anchor target. The section component receives this and sets it. */
  id: string;
  /** Nav label, or null for sections that belong on the page but not the nav. */
  navLabel: string | null;
  Component: ComponentType<{ id: string }>;
};

/**
 * The one place a page section is declared.
 *
 * `page.tsx` renders this list and `<SiteHeader>` builds its nav from it, so a
 * section cannot exist in the nav without existing on the page, and an anchor
 * cannot drift from the id it points at.
 *
 * Order is render order.
 */
export const SECTIONS: Section[] = [
  { id: "hero", navLabel: null, Component: Hero },
  { id: "services", navLabel: copy.nav.services, Component: Services },
];

/** Nav items for the sections that actually render. Never hand-maintained. */
export const NAV_ITEMS = SECTIONS.filter(
  (section): section is Section & { navLabel: string } => section.navLabel !== null,
).map((section) => ({ href: `#${section.id}`, label: section.navLabel }));
