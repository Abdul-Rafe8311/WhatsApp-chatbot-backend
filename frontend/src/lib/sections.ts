import type { ComponentType } from "react";
import { About } from "@/components/About";
import { Hero } from "@/components/Hero";
import { HoursLocation } from "@/components/HoursLocation";
import { Portfolio } from "@/components/Portfolio";
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
 * nav link cannot exist without a section that renders, and an anchor cannot
 * drift from the id it points at.
 *
 * Order is render order, and it is the conversion argument: the work first,
 * because for a makeup salon the work is the product.
 */
export const SECTIONS: Section[] = [
  { id: "hero", navLabel: null, Component: Hero },
  { id: "work", navLabel: copy.nav.work, Component: Portfolio },
  { id: "about", navLabel: copy.nav.about, Component: About },
  { id: "services", navLabel: copy.nav.services, Component: Services },
  { id: "hours", navLabel: copy.nav.hours, Component: HoursLocation },
];

/** Nav items for the sections that actually render. Never hand-maintained. */
export const NAV_ITEMS = SECTIONS.filter(
  (section): section is Section & { navLabel: string } =>
    section.navLabel !== null,
).map((section) => ({ href: `#${section.id}`, label: section.navLabel }));
