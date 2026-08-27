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
        className="transition-opacity duration-200 group-hover:opacity-90"
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

        <p className="type-data text-fg/65">{formatPrice(service)}</p>
      </div>
    </li>
  );
}

/**
 * Everything else. A dense text row: name, price, no image, no button. These
 * are real services people book, but Highlights is not what the salon is
 * known for and the page should not pretend otherwise.
 */
function ServiceRow({ service }: { service: Service }) {
  return (
    <li className="relative border-t border-gold/25">
      <WhatsAppLink
        prefill={copy.cta.servicePrefill(service.name)}
        ariaLabel={copy.cta.serviceAriaLabel(service.name)}
        // w-full and text-left: this renders as a <button> while the number
        // is unset, and buttons shrink-wrap and centre their text.
        className="flex w-full min-h-[44px] items-baseline justify-between gap-4 py-3 text-left hover:text-gold transition-colors duration-200"
      >
        <span className="type-body">{service.name}</span>
        <span className="type-data shrink-0 text-fg/65">
          {formatPrice(service)}
        </span>
      </WhatsAppLink>
    </li>
  );
}

export function Services({ id }: { id: string }) {
  const BRIDAL = CATEGORY_ORDER[0];

  const bridalDays = salon.services.filter(isBridalDay);
  // Bridal services that are not one of the four days — Engagement today.
  // They sit as rows under the cards rather than forming a second "Bridal"
  // heading further down the page.
  const bridalRest = salon.services.filter(
    (service) => service.category === BRIDAL && !isBridalDay(service),
  );

  // Every category still renders in CATEGORY_ORDER and every service in config
  // array order — the four wedding days are lifted out, nothing is re-sorted.
  const compactGroups = CATEGORY_ORDER.filter(
    (category) => category !== BRIDAL,
  )
    .map((category) => ({
      category,
      services: salon.services.filter(
        (service) => service.category === category,
      ),
    }))
    .filter((group) => group.services.length > 0);

  return (
    <section id={id} className="seam bg-surface">
      <div className="wrap flex flex-col gap-14 py-16 sm:py-24">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <div className="flex flex-col gap-1">
            <h2 className="type-h2">{copy.services.heading}</h2>
            {/* Every figure is an estimate, so it is labelled as one rather
                than presented as the salon's rate. */}
            <p className="type-meta text-fg/65">
              {copy.services.priceGuideNote}
            </p>
          </div>
          {/* Recessive by design — the full menu is a detail page, not a
              second call to action competing with the three pills. */}
          <a
            href="/services/"
            className="type-meta text-label inline-flex min-h-[44px] items-center hover:text-gold transition-colors duration-200"
          >
            {copy.services.seeAllLabel}
          </a>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h3 className="type-meta text-label">{BRIDAL}</h3>
            {copy.services.groupNotes[BRIDAL] && (
              <p className="type-meta text-fg/65">
                {copy.services.groupNotes[BRIDAL]}
              </p>
            )}
          </div>

          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {bridalDays.map((service) => (
              <BridalCard key={service.id} service={service} />
            ))}
          </ul>

          {bridalRest.length > 0 && (
            <ul className="flex flex-col sm:max-w-md">
              {bridalRest.map((service) => (
                <ServiceRow key={service.id} service={service} />
              ))}
            </ul>
          )}
        </div>

        {/* The rest of the menu, three columns of quiet rows. Party is a
            single service and would look stranded as its own block, so the
            groups sit side by side rather than stacking down the page. */}
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {compactGroups.map((group) => (
            <div key={group.category} className="flex flex-col gap-3">
              <h3 className="type-meta text-label">{group.category}</h3>
              <ul className="flex flex-col">
                {group.services.map((service) => (
                  <ServiceRow key={service.id} service={service} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
