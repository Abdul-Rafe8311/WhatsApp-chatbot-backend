import { copy } from "@/config/copy";
import { salon } from "@/config/salon";

/**
 * Built, and deliberately unpopulated.
 *
 * Their Facebook shows 84% recommend from 5 reviews — real, but too thin to
 * quote from without permission. `testimonials.verified` stays false until
 * real quotes are supplied and the section renders nothing at all until then,
 * the same gate as hours. An invented testimonial in front of the client is
 * the worst possible version of this demo failing.
 *
 * When quotes land: set verified to true, fill items, and it appears in the
 * nav on its own via the section registry.
 */
export function Testimonials({ id }: { id: string }) {
  const { verified, items } = salon.testimonials;
  if (!verified || items.length === 0) return null;

  return (
    <section id={id} className="seam bg-surface">
      <div className="wrap flex flex-col gap-10 py-16 sm:py-24">
        <h2 className="type-h2">{copy.testimonials.heading}</h2>

        <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <li key={t.id} className="seam flex flex-col gap-4 pt-5">
              <blockquote className="type-lead">{t.quote}</blockquote>
              <footer className="type-meta text-label">
                {t.name}
                {t.event && copy.credentialSeparator + t.event}
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
