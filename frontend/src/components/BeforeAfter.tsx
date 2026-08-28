import { SalonImage } from "@/components/SalonImage";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";

/**
 * A plain two-up comparison. No drag slider: that is a lot of JavaScript and
 * a pointer-events surface for a section we may not have paired photographs
 * for, and side-by-side reads perfectly well on a phone.
 *
 * Renders only when verified is true and pairs exist.
 */
export function BeforeAfter({ id }: { id: string }) {
  const { verified, pairs } = salon.beforeAfter;
  if (!verified || pairs.length === 0) return null;

  return (
    <section id={id} className="seam bg-surface">
      <div className="wrap flex flex-col gap-10 py-16 sm:py-24">
        <h2 className="type-h2">{copy.beforeAfter.heading}</h2>

        <ul className="flex flex-col gap-12">
          {pairs.map((pair) => (
            <li key={pair.id} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <figure className="flex flex-col gap-2">
                  <SalonImage
                    src={pair.beforeImage}
                    alt={pair.beforeAlt}
                    ratio="4:5"
                    sizes="50vw"
                  />
                  <figcaption className="type-meta text-label">
                    {copy.beforeAfter.beforeLabel}
                  </figcaption>
                </figure>
                <figure className="flex flex-col gap-2">
                  <SalonImage
                    src={pair.afterImage}
                    alt={pair.afterAlt}
                    ratio="4:5"
                    sizes="50vw"
                  />
                  <figcaption className="type-meta text-label">
                    {copy.beforeAfter.afterLabel}
                  </figcaption>
                </figure>
              </div>
              <p className="type-body text-fg/70">{pair.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
