import { Seal } from "@/components/Seal";
import { Wordmark } from "@/components/Wordmark";
import { NAV_ITEMS } from "@/lib/sections";

export function SiteHeader() {
  return (
    <header className="bg-ink border-b border-gold">
      <div className="wrap flex items-center justify-between gap-4 py-4">
        <a
          href="#top"
          className="flex items-center gap-2 min-h-[44px] -my-2 py-2"
        >
          <Seal className="text-2xl" />
          <Wordmark className="text-xl" />
        </a>

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
                    className="type-meta text-ivory/75 hover:text-ivory transition-colors duration-200"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
