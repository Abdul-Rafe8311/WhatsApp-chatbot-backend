import { Wordmark } from "@/components/Wordmark";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";
import { NAV_ITEMS } from "@/lib/sections";
import { whatsappReady } from "@/lib/whatsapp";

/**
 * Four columns over an oversized wordmark watermark.
 *
 * <Seal> is gone from here. It renders a standalone gold apostrophe, and set
 * beside <Wordmark> — whose own apostrophe is already gold — it read as a
 * stray leading mark: "’ Sonia’s". The seal is still the brand's mark; it just
 * cannot sit next to the word it was lifted out of. The header dropped it when
 * the logo landed, and this matches.
 *
 * Every destination is real. The service links go to the /services page that
 * exists, the section links come from the same registry the nav is built from,
 * so a link cannot outlive its section, and the contact column carries only
 * the address and email that are in config. Nothing is invented to fill a
 * column, which is why there are four rather than five.
 *
 * Palette: this stays on the theme tokens rather than being pinned dark. The
 * reference is a dark footer, but light is the unconditional default here
 * (CLAUDE.md R3.4) and a hardcoded dark band would be the one element on the
 * page ignoring the toggle. In dark theme it already resolves to dark ground
 * with cream text; in light it is paper with ink, and gold accents either way.
 */

const SOCIALS = [
  { href: salon.info.instagram, label: copy.footer.instagram },
  { href: salon.info.facebook, label: copy.footer.facebook },
];

/** Category anchors on the services page — all of which that page renders. */
const SERVICE_LINKS = salon.services.slice(0, 5).map((service) => ({
  href: `/services/#${service.id}`,
  label: service.name,
}));

export function SiteFooter() {
  return (
    <footer className="seam relative isolate overflow-hidden bg-surface">
      <div className="wrap relative z-10 grid gap-10 pt-16 pb-28 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 lg:pt-20 lg:pb-32">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <Wordmark className="text-2xl" />
          <p className="type-body max-w-[34ch] text-fg/70">
            {salon.info.tagline}
          </p>
          <ul className="mt-1 flex items-center gap-3">
            {SOCIALS.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 text-fg/80 transition-colors duration-200 hover:bg-gold/10 hover:text-fg"
                >
                  {social.label === copy.footer.instagram ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
                      <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5h1.65V4.62c-.29-.04-1.27-.12-2.41-.12-2.39 0-4.02 1.46-4.02 4.13v2.27H7.5V14h2.77v8h3.23z" />
                    </svg>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <nav aria-label={copy.footer.servicesHeading}>
          <h2 className="type-meta text-gold">{copy.footer.servicesHeading}</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {SERVICE_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="type-body inline-flex min-h-[36px] items-center text-fg/70 transition-colors duration-200 hover:text-fg"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/services/"
                className="type-body inline-flex min-h-[36px] items-center text-gold underline-offset-4 hover:underline"
              >
                {copy.footer.seeAllServices}
              </a>
            </li>
          </ul>
        </nav>

        {/* Explore — built from the section registry, so no dead anchors. */}
        <nav aria-label={copy.footer.exploreHeading}>
          <h2 className="type-meta text-gold">{copy.footer.exploreHeading}</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="type-body inline-flex min-h-[36px] items-center text-fg/70 transition-colors duration-200 hover:text-fg"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h2 className="type-meta text-gold">{copy.footer.contactHeading}</h2>
          <address className="mt-4 flex flex-col gap-3 not-italic">
            <p className="type-body max-w-[28ch] text-fg/70">
              {salon.info.address}
            </p>
            <a
              href={`mailto:${salon.info.email}`}
              className="type-body inline-flex min-h-[36px] items-center break-all text-fg/70 transition-colors duration-200 hover:text-fg"
            >
              {salon.info.email}
            </a>
          </address>

          {!whatsappReady && (
            <p className="mt-6 text-xs leading-relaxed text-fg/60">
              {copy.footer.demoNotice}
            </p>
          )}
        </div>
      </div>

      {/*
        Watermark — the wordmark oversized, behind the columns, bleeding off
        the bottom edge.

        SVG with textLength rather than a sized <span>: a font-size in vw makes
        the word a width the container did not choose, so it was overflowing
        and getting clipped mid-letter on the right. textLength pins the text
        to exactly the viewBox width and lengthAdjust="spacing" opens the
        letter-spacing to get there — glyph shapes are untouched, so the serif
        does not stretch. The word therefore always fits the width exactly, at
        any viewport, with no measurement and no overflow.

        Only the bottom is cropped: translate-y pushes the lower part of the
        letterforms past the footer's edge, which clips them.

        Decorative, so aria-hidden and select-none — never read, never
        selected, never a tab stop.

        The apostrophe is normalised here. salon.info.name carries a straight
        ASCII quote (U+0027); <Wordmark> quietly substitutes a curly one at
        render, so using the raw string put a straight quote next to curly ones
        everywhere else. Fixing it at source would change the name string the
        API contract publishes, so it is normalised at the point of display.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 select-none overflow-hidden"
      >
        <svg
          viewBox="0 0 1000 210"
          className="w-full translate-y-[26%] fill-current text-fg/[0.24]"
          role="presentation"
          focusable="false"
        >
          <text
            x="0"
            y="168"
            textLength="1000"
            lengthAdjust="spacing"
            className="font-display"
            style={{ fontSize: "200px", fontWeight: 600 }}
          >
            {salon.info.name.split(" ")[0].replace(/'/g, "\u2019")}
          </text>
        </svg>
      </div>

      {/* Clearance for the fixed sticky CTA so it never covers the last row. */}
      <div aria-hidden="true" className="relative z-10 h-24" />
    </footer>
  );
}
