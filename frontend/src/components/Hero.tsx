import { SalonImage } from "@/components/SalonImage";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";

/**
 * Full-bleed photograph with the headline overlaid.
 *
 * Two rendering modes, because a scrim over nothing is not a design. With a
 * photograph the frame goes edge to edge, a bottom-weighted scrim carries the
 * type, and the text switches to --color-on-image in BOTH themes — the layer
 * underneath is the image, not the page ground, so the theme has no bearing
 * on what is legible. The scrim is sized for the worst case: pure white
 * photograph under the strongest stop still composites dark enough to clear
 * AA (see docs/design-plan.md R4).
 *
 * Until a photograph lands it falls back to the page ground with normal theme
 * colours. Rendering ivory-on-scrim over an empty placeholder would be
 * illegible in light theme and would misrepresent the finished design.
 */
export function Hero({ id }: { id: string }) {
  const credentialLine = salon.info.credentials.join(copy.credentialSeparator);
  const hasImage = Boolean(salon.info.heroImage);

  return (
    <section id={id} className="relative isolate bg-surface">
      {hasImage && (
        <>
          <SalonImage
            src={salon.info.heroImage}
            alt={salon.info.heroImageAlt}
            ratio="16:9"
            fill
            priority
            sizes="100vw"
          />
          <div
            aria-hidden="true"
            className="hero-scrim absolute inset-0 -z-0"
          />
        </>
      )}

      <div
        className={`wrap relative flex flex-col items-start justify-end gap-6 py-16 sm:py-24 ${
          hasImage ? "min-h-[78svh] text-on-image" : ""
        }`}
      >
        <h1 className="type-hero">{copy.hero.headline}</h1>

        {/* Plain type on the headline's own left edge — no pill, no border,
            no checkmark. It reads as a credential precisely because it is not
            boxed. */}
        <p className={hasImage ? "type-meta" : "type-meta text-label"}>
          {credentialLine}
        </p>

        <WhatsAppCTA
          prefill={copy.cta.generalPrefill}
          label={copy.cta.label}
          tone={hasImage ? "onImage" : "default"}
        />
      </div>
    </section>
  );
}
