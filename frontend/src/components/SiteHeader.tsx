import { SalonLogo } from "@/components/SalonLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NAV_ITEMS } from "@/lib/sections";

export function SiteHeader() {
  return (
    <header className="bg-surface border-b border-gold">
      <div className="wrap flex items-center justify-between gap-4 py-4">
        {/* The logo carries the accessible name via its alt text, so the link
            needs no label of its own. The typeset <Wordmark> still holds the
            name in the footer, where there is room to read it. */}
        <a
          href="#top"
          className="flex items-center min-h-[44px] -my-2 py-2"
        >
          <SalonLogo />
        </a>

        <div className="flex items-center gap-6">
          {/* Derived from the section registry, so a link can only exist for a
              section that actually renders. Anchors appear as stages land.
              Desktop-only: on a phone the page is one short scroll and the
              sticky CTA is what matters in the thumb zone. */}
          {NAV_ITEMS.length > 0 && (
            <nav className="hidden sm:block">
              <ul className="flex items-center gap-7">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="type-meta text-fg/70 hover:text-fg transition-colors duration-200"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Stays visible at 375px, where the nav does not — one short word
              beside the wordmark rather than a second row. */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
