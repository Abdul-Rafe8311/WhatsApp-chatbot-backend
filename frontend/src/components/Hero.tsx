import { SalonImage } from "@/components/SalonImage";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";

export function Hero({ id }: { id: string }) {
  // The strongest trust signal on the page in this market. Composed from the
  // config's three separate strings rather than stored pre-joined.
  const credentialLine = salon.info.credentials.join(copy.credentialSeparator);

  return (
    <section id={id} className="bg-ink">
      <div className="wrap grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <h1 className="type-hero">{copy.hero.headline}</h1>

          {/* Set plainly on the headline's own left edge — no pill, no
              border, no checkmark. Boxing it would make it read as an
              advertisement for itself; as type it reads as fact. */}
          <p className="type-meta text-gold">{credentialLine}</p>

          <WhatsAppCTA
            prefill={copy.cta.generalPrefill}
            label={copy.cta.label}
          />
        </div>

        {/* The one image above the fold, so it loads eagerly. Until a file
            lands this is a quiet tonal panel, not a coloured block. */}
        <SalonImage
          src={salon.info.heroImage}
          alt={salon.info.heroImageAlt}
          ratio="4:5"
          priority
        />
      </div>
    </section>
  );
}
