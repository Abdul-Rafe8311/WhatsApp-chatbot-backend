import type { ReactNode } from "react";
import { Seal } from "@/components/Seal";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { Wordmark } from "@/components/Wordmark";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";
import { NAV_ITEMS } from "@/lib/sections";
import { whatsappReady } from "@/lib/whatsapp";

/**
 * Widened from the config's literal types so the null guards below are real
 * runtime checks rather than comparisons TypeScript folds away. Every one of
 * these is a string today, but the footer must omit the whole item — heading
 * included — the day any of them becomes null, rather than render an empty
 * label under a heading.
 */
const info: {
  tagline: string | null;
  address: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  followers: string | null;
} = {
  tagline: salon.info.tagline,
  address: salon.info.address,
  email: salon.info.email,
  instagram: salon.info.instagram,
  facebook: salon.info.facebook,
  followers: salon.info.instagramFollowers,
};

const linkClass =
  "type-meta text-fg/70 hover:text-gold transition-colors duration-200 inline-flex min-h-[44px] items-center";

function Column({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="type-meta text-label">{heading}</h2>
      {children}
    </div>
  );
}

export function SiteFooter() {
  // Build-time, not hardcoded. A static export bakes this in, so the year
  // advances on the next deploy rather than at midnight on 1 January.
  const year = new Date().getFullYear();

  const mapsHref = info.address ? copy.location.mapsUrl(info.address) : null;
  const hasVisit = Boolean(info.address);
  const hasContact = Boolean(info.email || info.instagram || info.facebook);
  const notices = [
    !whatsappReady ? copy.footer.demoNotice : null,
    salon.pricesAreSample ? copy.footer.sampleNotice : null,
  ].filter(Boolean);

  return (
    <footer className="seam bg-surface">
      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4">
        {/* Identity, and the conversion point. Grouping the CTA with the
            wordmark keeps the first column doing something rather than being
            a logo stranded beside dead space. */}
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2">
            <Seal className="text-2xl" />
            <Wordmark className="text-xl" />
          </div>
          {info.tagline && (
            <p className="type-body text-fg/70">{info.tagline}</p>
          )}

          {/* Recessive on purpose — see the note in the report. The sticky
              pill is on screen at the bottom of the page, so a fourth pill
              here would duplicate it inches away. Same gate, same prefill. */}
          <WhatsAppLink
            prefill={copy.cta.generalPrefill}
            ariaLabel={copy.cta.label}
            className="type-meta text-label inline-flex min-h-[44px] items-center underline underline-offset-4 hover:text-gold transition-colors duration-200"
          >
            {copy.cta.label}
          </WhatsAppLink>
        </div>

        {hasVisit && (
          <Column heading={copy.footer.visitHeading}>
            {info.address && (
              <address className="type-body text-fg/70 not-italic">
                {info.address}
              </address>
            )}
            {mapsHref && (
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {copy.location.mapsLabel}
              </a>
            )}
          </Column>
        )}

        {hasContact && (
          <Column heading={copy.footer.contactHeading}>
            <ul className="flex flex-col">
              {info.email && (
                <li>
                  <a href={`mailto:${info.email}`} className={linkClass}>
                    {info.email}
                  </a>
                </li>
              )}
              {info.instagram && (
                <li>
                  <a
                    href={info.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {/* Follower count doubles as social proof. If it is ever
                        unset the link falls back to a plain label rather than
                        rendering "· followers" with nothing in front. */}
                    {info.followers
                      ? copy.footer.instagramWithFollowers(info.followers)
                      : copy.footer.instagram}
                  </a>
                </li>
              )}
              {info.facebook && (
                <li>
                  <a
                    href={info.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {copy.footer.facebook}
                  </a>
                </li>
              )}
            </ul>
          </Column>
        )}

        {NAV_ITEMS.length > 0 && (
          <Column heading={copy.footer.exploreHeading}>
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  {/* Absolute, not a bare hash: the footer is in the layout,
                      so these have to resolve from /services too. */}
                  <a href={`/${item.href}`} className={linkClass}>
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="/services/" className={linkClass}>
                  {copy.footer.servicesLabel}
                </a>
              </li>
            </ul>
          </Column>
        )}
      </div>

      {/* Bottom bar. pr on the right keeps the copyright clear of the sticky
          pill, which is fixed above this corner at the end of the scroll. */}
      <div className="seam">
        <div className="wrap flex flex-col gap-2 py-6 pr-40 sm:flex-row sm:items-baseline sm:justify-between sm:pr-52">
          <p className="text-xs leading-relaxed text-fg/60">
            {copy.footer.copyright(year, salon.info.name)}
          </p>
          {notices.length > 0 && (
            <p className="text-xs leading-relaxed text-fg/60">
              {notices.join(" · ")}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
