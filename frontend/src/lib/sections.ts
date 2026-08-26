import type { ComponentType } from "react";
import { BeforeAfter } from "@/components/BeforeAfter";
import { Hero } from "@/components/Hero";
import { HoursLocation } from "@/components/HoursLocation";
import { InstagramStrip } from "@/components/InstagramStrip";
import { MeetSonia } from "@/components/MeetSonia";
import { Portfolio } from "@/components/Portfolio";
import { Services } from "@/components/Services";
import { Testimonials } from "@/components/Testimonials";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";

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
 * Sections gated on unconfirmed data are filtered out here rather than
 * returning null from the component alone. A component that renders nothing
 * while still sitting in the registry would put a dead anchor in the nav —
 * the exact bug the registry was built to prevent.
 *
 * Order is render order, and it is the conversion argument: the work first
 * because for a makeup salon the work is the product, then the person behind
 * it, then what it costs, then proof, then how to get there.
 */
const ALL: ReadonlyArray<Section & { enabled: boolean }> = [
  { id: "hero", navLabel: null, Component: Hero, enabled: true },
  {
    id: "work",
    navLabel: copy.nav.work,
    Component: Portfolio,
    enabled: salon.portfolio.items.length > 0,
  },
  {
    id: "about",
    navLabel: copy.nav.about,
    Component: MeetSonia,
    enabled: true,
  },
  {
    id: "services",
    navLabel: copy.nav.services,
    Component: Services,
    enabled: true,
  },
  {
    id: "before-after",
    navLabel: null,
    Component: BeforeAfter,
    enabled: salon.beforeAfter.verified && salon.beforeAfter.pairs.length > 0,
  },
  {
    id: "testimonials",
    navLabel: null,
    Component: Testimonials,
    enabled:
      salon.testimonials.verified && salon.testimonials.items.length > 0,
  },
  {
    id: "instagram",
    navLabel: null,
    Component: InstagramStrip,
    enabled: salon.instagramStrip.items.length > 0,
  },
  {
    id: "hours",
    navLabel: copy.nav.hours,
    Component: HoursLocation,
    enabled: true,
  },
];

export const SECTIONS: Section[] = ALL.filter((s) => s.enabled).map(
  ({ id, navLabel, Component }) => ({ id, navLabel, Component }),
);

/** Nav items for the sections that actually render. Never hand-maintained. */
export const NAV_ITEMS = SECTIONS.filter(
  (section): section is Section & { navLabel: string } =>
    section.navLabel !== null,
).map((section) => ({ href: `#${section.id}`, label: section.navLabel }));
