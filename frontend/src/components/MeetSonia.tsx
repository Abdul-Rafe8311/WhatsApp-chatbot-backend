import { SalonImage } from "@/components/SalonImage";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";

/**
 * Absorbs the old About section. A named person with a face converts better
 * than an anonymous salon, and here the person is the credential: certified,
 * trained at Kashee's and Amina Raja, 49.9K verified following.
 *
 * Keeps the inverted hierarchy the About section had — the section label is
 * the smallest type here and the prose is the largest, because "Meet Sonia"
 * carries no information and the story does. Paragraphs are split from the
 * config string, so swapping in two or three changes nothing but the length
 * of the column.
 */
export function MeetSonia({ id }: { id: string }) {
  const paragraphs = salon.info.about
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Never render from a null: fall back to the generic heading if the owner's
  // name is ever unset rather than printing "Meet undefined".
  const heading = salon.info.owner
    ? copy.meetSonia.headingFor(salon.info.owner)
    : copy.meetSonia.heading;

  const stats = copy.instagram.stats(
    salon.info.instagramFollowers,
    salon.info.instagramPosts,
  );

  return (
    <section id={id} className="seam bg-surface">
      <div className="wrap grid gap-8 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
        <SalonImage
          src={salon.info.aboutImage}
          alt={salon.info.aboutImageAlt}
          ratio="4:5"
          sizes="(min-width:1024px) 33vw, 100vw"
        />

        <div className="flex flex-col gap-7">
          <h2 className="type-meta text-label">{heading}</h2>

          <div className="flex flex-col gap-4">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="type-lead">
                {p}
              </p>
            ))}
          </div>

          <div className="seam flex flex-col items-start gap-1.5 pt-5">
            <ul className="flex flex-col gap-1.5">
              {salon.info.credentials.map((c) => (
                <li key={c} className="type-meta text-label">
                  {c}
                </li>
              ))}
            </ul>

            {/* Linked rather than asserted — the follower count and verified
                badge are checkable in one tap. Both numbers come from the
                config and are the only two figures on the page. */}
            <a
              href={salon.info.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="type-meta text-label inline-flex min-h-[44px] items-center hover:text-gold transition-colors duration-200"
            >
              {stats}
              {salon.info.instagramVerified &&
                copy.credentialSeparator + copy.about.verifiedLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
