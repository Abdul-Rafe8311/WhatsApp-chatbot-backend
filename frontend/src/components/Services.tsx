import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { copy } from "@/config/copy";
import { CATEGORY_ORDER, salon } from "@/config/salon";

type Service = (typeof salon.services)[number];

/**
 * Swatch fill stands in for a photograph that does not exist yet, at the 1:1
 * ratio one will use. Colour is driven by the config's own `featured` flag:
 * the salon's specialisms — the four wedding days and balayage — carry a
 * jewel tone, everything else takes the quiet surface. Nothing here is
 * random, and when photos land the fills are simply replaced.
 */
function swatchColour(service: Service): string {
  if (!service.featured) return "bg-ink-2";
  return service.category === "Hair" ? "bg-magenta" : "bg-crimson";
}

function ServiceItem({ service }: { service: Service }) {
  return (
    <li className="seam flex gap-4 pt-4 sm:flex-col sm:gap-0">
      <div
        className={`h-20 w-20 shrink-0 sm:h-auto sm:w-full sm:aspect-square ${swatchColour(service)}`}
      />

      {/* min-w-0 so the description can wrap instead of forcing the flex row
          wider than 375px — a flex item defaults to min-width:auto. */}
      <div className="flex min-w-0 flex-col items-start gap-2 sm:pt-4">
        <h4 className="type-card-title">{service.name}</h4>

        {/* priceMin is null throughout, so this is PRICE_ON_REQUEST via the
            config's priceNote. No figure is ever synthesised. */}
        <p className="type-data text-gold">{service.priceNote}</p>

        {service.description && (
          <p className="type-body text-ivory/75">{service.description}</p>
        )}

        <WhatsAppCTA
          prefill={copy.cta.servicePrefill(service.name)}
          ariaLabel={copy.cta.serviceAriaLabel(service.name)}
          label={copy.cta.label}
          size="sm"
          className="mt-1"
        />
      </div>
    </li>
  );
}

export function Services() {
  return (
    <section id="services" className="seam bg-emerald">
      <div className="wrap flex flex-col gap-12 py-16 sm:py-20">
        <h2 className="type-h2">{copy.services.heading}</h2>

        {/* Category sequence comes from CATEGORY_ORDER, and services render in
            config array order within each group. Nothing is sorted here — the
            shared database carries this same order for the agent to read, and
            a component that re-sorted would drift from it silently. */}
        {CATEGORY_ORDER.map((category) => {
          const services = salon.services.filter(
            (service) => service.category === category,
          );
          if (services.length === 0) return null;

          const note = copy.services.groupNotes[category];

          return (
            <div key={category} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h3 className="type-card-title text-gold">{category}</h3>
                {note && <p className="type-meta text-ivory/60">{note}</p>}
              </div>

              <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                {services.map((service) => (
                  <ServiceItem key={service.id} service={service} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
