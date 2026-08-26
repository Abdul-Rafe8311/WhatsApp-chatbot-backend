import { SalonImage } from "@/components/SalonImage";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";

/**
 * Inverted hierarchy: the section label is the smallest type here and the
 * copy is the largest. "About" carries no information — the paragraph does —
 * so the heading stays a quiet gold label and the prose dominates.
 *
 * Paragraphs are split from the config string rather than assumed to be one,
 * so the client swapping in two or three paragraphs changes nothing but the
 * length of the column.
 */
export function About({ id }: { id: string }) {
  const paragraphs = salon.info.about
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section id={id} className="seam bg-ink">
      <div className="wrap grid gap-8 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
        {/* Sonia herself — the section is about the person. Sits left where
            the hero's sits right, so the two portraits never read as a
            repeating pattern down the page. */}
        <SalonImage
          src={salon.info.aboutImage}
          alt={salon.info.aboutImageAlt}
          ratio="4:5"
        />

        <div className="flex flex-col gap-7">
          <h2 className="type-meta text-gold">{copy.about.heading}</h2>

          <div className="flex flex-col gap-4">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="type-lead">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Stacked rather than joined with · as in the hero: same facts, but
              here they read as a credentials block instead of a byline. */}
          <div className="seam flex flex-col items-start gap-1.5 pt-5">
            <ul className="flex flex-col gap-1.5">
              {salon.info.credentials.map((credential) => (
                <li key={credential} className="type-meta text-gold">
                  {credential}
                </li>
              ))}
            </ul>

            {/* Social proof, and a link rather than a claim — the follower
                count and verified badge are checkable in one tap. Both values
                come from salon.ts; only the wording is copy. */}
            <a
              href={salon.info.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="type-meta text-gold inline-flex min-h-[44px] items-center hover:text-ivory transition-colors duration-200"
            >
              {copy.about.socialProof(salon.info.instagramFollowers)}
              {salon.info.instagramVerified &&
                copy.credentialSeparator + copy.about.verifiedLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
