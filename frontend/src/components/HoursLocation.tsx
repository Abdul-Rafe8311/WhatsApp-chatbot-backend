import { SalonImage } from "@/components/SalonImage";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";

type HourRow = {
  day: string;
  open: string | null;
  close: string | null;
  closed: boolean | null;
};

/**
 * Structure differs from both neighbours on purpose: the heading holds a
 * narrow left column and everything else runs down a wider right one, with a
 * full-bleed 16:9 field closing the section. Services is a grid, About is an
 * offset editorial column, this is a two-column split with a banner.
 *
 * While hours.verified is false no schedule renders — not a blank slot or an
 * apology, but the section doing its job: the honest answer to "are you open
 * at 6 tomorrow" is to ask, and asking is the product. When real hours land
 * and verified flips to true, the schedule replaces the invitation inside the
 * same column and nothing around it moves.
 */
export function HoursLocation({ id }: { id: string }) {
  // Widened from the config's literal types so the verified branch typechecks
  // against real data rather than against `false` and `null`.
  const hoursVerified: boolean = salon.hours.verified;
  const days: readonly HourRow[] = salon.hours.days;
  const mapsUrl = copy.location.mapsUrl(salon.info.address);

  return (
    <section id={id} className="seam bg-surface">
      <div className="reveal wrap grid gap-8 pt-16 sm:pt-20 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <h2 className="type-h2">{copy.hours.heading}</h2>

        <div className="flex flex-col gap-8">
          {hoursVerified ? (
            <dl className="flex flex-col">
              {days.map((row) => {
                // Never render a time from a null: a day missing either end of
                // its range reads as closed, never as a half-empty row.
                const closed = row.closed === true || !row.open || !row.close;
                return (
                  <div
                    key={row.day}
                    className="flex items-baseline justify-between gap-6 border-t border-gold/25 py-2"
                  >
                    <dt className="type-data">{row.day}</dt>
                    <dd className="type-data text-fg/70">
                      {closed
                        ? copy.hours.closedLabel
                        : `${row.open}–${row.close}`}
                    </dd>
                  </div>
                );
              })}
            </dl>
          ) : (
            <div className="flex flex-col items-start gap-4">
              <p className="type-lead">{copy.hours.unverifiedLead}</p>
              <p className="type-body text-fg/70">
                {copy.hours.unverifiedNote}
              </p>
              <WhatsAppCTA
                prefill={copy.cta.hoursPrefill}
                label={copy.cta.label}
                className="mt-1"
              />
            </div>
          )}

          <div className="seam flex flex-col items-start gap-2 pt-6">
            <p className="type-data">{salon.info.address}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="type-meta text-label inline-flex min-h-[44px] items-center hover:text-fg transition-colors duration-200"
            >
              {copy.location.mapsLabel}
            </a>
          </div>
        </div>
      </div>

      {/* Storefront or map. The only landscape image on the page, which is
          what lets it close the section. */}
      <div className="wrap pt-12 pb-16 sm:pb-24">
        <SalonImage
          src={salon.info.locationImage}
          alt={salon.info.locationImageAlt}
          ratio="16:9"
        />
      </div>
    </section>
  );
}
