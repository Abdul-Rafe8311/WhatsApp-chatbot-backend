import { SalonImage } from "@/components/SalonImage";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";

/**
 * Hand-picked local files, not a live feed.
 *
 * This is a static export with no Instagram API access, so the heading says
 * "Selected work from Instagram" rather than "Latest posts". Nothing here
 * updates itself, and a "latest" label would be false the day after launch —
 * the kind of small lie a visitor notices when the top post is a year old.
 *
 * The follow link is the only CTA here, and it is a recessive text link: the
 * three prominent pills are spoken for.
 */
export function InstagramStrip({ id }: { id: string }) {
  // Widened from the config's literal tuple length so the empty-state guard
  // is a real runtime check rather than a comparison TypeScript can fold away.
  const items: ReadonlyArray<(typeof salon.instagramStrip.items)[number]> =
    salon.instagramStrip.items;
  if (items.length === 0) return null;

  const stats = copy.instagram.stats(
    salon.info.instagramFollowers,
    salon.info.instagramPosts,
  );

  return (
    <section id={id} className="seam bg-surface">
      <div className="wrap flex flex-col gap-8 py-16 sm:py-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="type-h2">{copy.instagram.heading}</h2>
          <p className="type-meta text-label">{stats}</p>
        </div>

        <ul className="grid grid-cols-3 gap-2 sm:gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <SalonImage
                src={item.image}
                alt={item.imageAlt}
                ratio="1:1"
                sizes="(min-width:640px) 33vw, 33vw"
              />
            </li>
          ))}
        </ul>

        <a
          href={salon.info.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="type-meta text-label inline-flex min-h-[44px] items-center self-start hover:text-gold transition-colors duration-200"
        >
          {copy.instagram.followLabel}
        </a>
      </div>
    </section>
  );
}
