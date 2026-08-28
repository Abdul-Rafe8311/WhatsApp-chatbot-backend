import { SalonImage } from "@/components/SalonImage";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { copy } from "@/config/copy";
import { CATEGORY_ORDER, salon } from "@/config/salon";
import { formatPrice } from "@/lib/price";

type Service = (typeof salon.services)[number];

const isBridalDay = (service: Service) =>
  service.category === "Bridal" && service.featured;

/**
 * The four wedding days. These are the business, so they get the space: a
 * photograph, a large title, room to breathe. The whole card is the target —
 * the heading wraps the link and a stretched pseudo-element covers the card,
 * which keeps the markup valid (a button may not contain a heading) and makes
 * the service name, not a button, the thing you read and click.
 */
function BridalCard({ service }: { service: Service }) {
  return (
    <li className="group relative flex flex-col gap-4">
      <SalonImage
        src={service.image}
        alt={service.imageAlt}
        ratio="4:5"
        className="tile-zoom overflow-hidden transition-opacity duration-200 group-hover:opacity-90"
        sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
      />

      <div className="flex flex-col gap-1.5">
        <h4 className="type-card-title">
          <WhatsAppLink
            prefill={copy.cta.servicePrefill(service.name)}
            ariaLabel={copy.cta.serviceAriaLabel(service.name)}
            className="after:absolute after:inset-0 after:content-[''] text-left hover:text-gold transition-colors duration-200"
          >
            {service.name}
          </WhatsAppLink>
        </h4>

        {service.description && (
          <p className="type-body text-fg/70">{service.description}</p>
        )}

        <p className="type-data text-fg/65 tabular-nums">
          {formatPrice(service)}
        </p>
      </div>
    </li>
  );
}

/**
 * The homepage section is a teaser, not the catalogue.
 *
 * It shows the four wedding days and nothing else. Hair, Party, Skin and the
 * remaining bridal items live on /services — putting all thirty-one here
 * buried the work under a price list and made the homepage read as a menu.
 * The full list is one link away, labelled with its own count so the link
 * says how much more there is.
 *
 * Nothing is re-sorted: the four are lifted out of the config array by their
 * `featured` flag, in the wedding-timeline order the array already holds.
 */
export function Services({ id }: { id: string }) {
  const BRIDAL = CATEGORY_ORDER[0];
  const bridalDays = salon.services.filter(isBridalDay);
  const note = copy.services.groupNotes[BRIDAL];

  return (
    <section id={id} className="seam bg-surface">
      <div className="wrap flex flex-col gap-8 py-16 sm:py-24">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <div className="flex flex-col gap-1">
            <h2 className="type-h2">{copy.services.heading}</h2>
            {/* Every figure is sample data, so it is labelled as such rather
                than presented as the salon's rate. */}
            <p className="type-meta text-fg/65">
              {copy.services.priceGuideNote}
            </p>
          </div>

          {/* Recessive by design — the full menu is a detail page, not a
              second call to action competing with the three pills. The count
              comes from the config so the link cannot go stale. */}
          <a
            href="/services/"
            className="type-meta text-label inline-flex min-h-[44px] items-center hover:text-gold transition-colors duration-200"
          >
            {copy.services.seeAllLabel(salon.services.length)}
          </a>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h3 className="type-meta text-label">{BRIDAL}</h3>
            {note && <p className="type-meta text-fg/65">{note}</p>}
          </div>

          <ul className="reveal grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {bridalDays.map((service) => (
              <BridalCard key={service.id} service={service} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
