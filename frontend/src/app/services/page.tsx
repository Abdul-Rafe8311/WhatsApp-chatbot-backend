import type { Metadata } from "next";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { copy } from "@/config/copy";
import { formatPrice } from "@/lib/price";
import { CATEGORY_ORDER, salon } from "@/config/salon";

export const metadata: Metadata = {
  title: `Services — ${salon.info.name}`,
  description: `Bridal, hair, party and skin services at ${salon.info.name} in ${salon.info.city}.`,
};

type Service = (typeof salon.services)[number];

/**
 * The full menu, in more detail than the homepage section.
 *
 * Reads the same `salon.services` array the homepage and the JSON endpoint
 * read, so the three can never disagree. Order is config order — Bridal runs
 * in wedding-timeline sequence and nothing is re-sorted here.
 *
 * Every row is a recessive WhatsApp link, not a pill. The page carries one
 * prominent CTA at the end; the three-pill rule still holds.
 */
function ServiceRow({ service }: { service: Service }) {
  return (
    <li className="relative border-t border-gold/25">
      <WhatsAppLink
        prefill={copy.cta.servicePrefill(service.name)}
        ariaLabel={copy.cta.serviceAriaLabel(service.name)}
        /**
         * A two-column grid, not flex, so the edges are structural rather
         * than emergent: column 1 always starts at the container's left edge
         * and column 2 always ends at its right, whatever the name or price
         * happens to be. The description sits in column 1 of row 2, so it
         * shares the name's left edge exactly.
         *
         * w-full and text-left are load-bearing. While the WhatsApp number is
         * unset this renders as a <button>, and a button shrink-wraps to its
         * content and centres its text — which is what made every row's name
         * land at a different indent.
         */
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 py-4 text-left transition-colors duration-200 hover:text-gold"
      >
        <span className="type-card-title">{service.name}</span>

        {/* Sample prices — see salon.pricesAreSample. A null min still renders
            "On request"; formatPrice never invents a figure. Tabular figures
            so the digits line up down the column. */}
        <span className="type-data text-right text-fg/65 tabular-nums">
          {formatPrice(service)}
        </span>

        {service.description && (
          <span className="type-body col-start-1 text-fg/70">
            {service.description}
          </span>
        )}
      </WhatsAppLink>
    </li>
  );
}

export default function ServicesPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-surface">
        <div className="wrap flex flex-col gap-14 py-16 sm:py-24">
          <div className="flex flex-col gap-3">
            <h1 className="type-h2">{copy.services.pageHeading}</h1>
            <p className="type-body text-fg/70">{copy.services.pageIntro}</p>
          </div>

          {CATEGORY_ORDER.map((category) => {
            const services = salon.services.filter(
              (s) => s.category === category,
            );
            if (services.length === 0) return null;
            const note = copy.services.groupNotes[category];

            return (
              <div key={category} className="flex flex-col gap-2">
                <div className="flex flex-col gap-0.5 pb-1">
                  <h2 className="type-meta text-label">{category}</h2>
                  {note && <p className="type-meta text-fg/65">{note}</p>}
                </div>
                <ul className="flex flex-col">
                  {services.map((s) => (
                    <ServiceRow key={s.id} service={s} />
                  ))}
                </ul>
              </div>
            );
          })}

          <div className="seam flex flex-col items-start gap-4 pt-10">
            <p className="type-lead">{copy.services.pageOutro}</p>
            <WhatsAppCTA
              prefill={copy.cta.generalPrefill}
              label={copy.cta.label}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
