import { MobileNav } from "@/components/MobileNav";
import { Seal } from "@/components/Seal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Wordmark } from "@/components/Wordmark";
import { NAV_ITEMS } from "@/lib/sections";

/**
 * Sticky, translucent, and it keeps the nav reachable at every width.
 *
 * Sticky because the page is long now and the WhatsApp CTA is the only other
 * persistent thing on screen; a header that scrolls away leaves a visitor
 * halfway down with no way back. Translucent with a blur so the hero
 * photograph reads through it rather than being cut off by a solid bar.
 *
 * The hairline is gold at low opacity rather than full strength: a solid gold
 * rule across the top of a photograph reads as a border round a document.
 *
 * --header-h is published as a custom property so the mobile panel can sit
 * exactly beneath the bar without either of them hardcoding the other's
 * height.
 */
export function SiteHeader() {
  return (
    <header
      style={{ ["--header-h" as string]: "4rem" }}
      className="sticky top-0 z-50 border-b border-gold/25 bg-surface/85 backdrop-blur-md"
    >
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <a
          href="#top"
          className="flex items-center gap-2.5 py-2 transition-opacity duration-200 hover:opacity-80"
        >
          <Seal className="text-2xl" />
          <Wordmark className="text-2xl" />
        </a>

        {/* Desktop. Held back to md so four links plus the wordmark and the
            toggle are never crowded — at sm they fit only just. */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.length > 0 && (
            <nav>
              <ul className="flex items-center gap-8">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="type-meta relative inline-flex min-h-[44px] items-center text-fg/70 transition-colors duration-200 hover:text-fg
                        after:absolute after:bottom-2.5 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0
                        after:bg-gold after:transition-transform after:duration-300 after:ease-out
                        hover:after:origin-left hover:after:scale-x-100"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile: the same links, in a panel. */}
        <MobileNav items={NAV_ITEMS} />
      </div>
    </header>
  );
}
