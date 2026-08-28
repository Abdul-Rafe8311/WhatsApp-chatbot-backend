import { salon } from "@/config/salon";
import { formatPrice } from "@/lib/price";

/**
 * Structured data for the salon, built from the config rather than typed out,
 * so it cannot drift from what the page says.
 *
 * The null discipline applies here too, and matters more than usual: this is
 * what Google reads to build a business panel. A guessed phone number or an
 * unconfirmed opening time here is published as fact about a real business.
 *
 *   - telephone is omitted entirely while the number is a placeholder
 *   - openingHoursSpecification is omitted while hours.verified is false
 *   - priceRange is derived from the real min and max in the config
 */
export function localBusinessJsonLd() {
  const priced = salon.services.filter(
    (s): s is typeof s & { priceMin: number; priceMax: number } =>
      s.priceMin !== null && s.priceMax !== null,
  );
  const lo = priced.length ? Math.min(...priced.map((s) => s.priceMin)) : null;
  const hi = priced.length ? Math.max(...priced.map((s) => s.priceMax)) : null;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: salon.info.name,
    description: salon.info.about,
    image: salon.info.heroImage ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: salon.info.address,
      addressLocality: salon.info.city,
      addressCountry: "PK",
    },
    email: salon.info.email,
    sameAs: [salon.info.instagram, salon.info.facebook].filter(Boolean),
    founder: salon.info.owner
      ? { "@type": "Person", name: salon.info.owner }
      : undefined,
    makesOffer: salon.services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.name, category: s.category },
      priceCurrency: "PKR",
      description: formatPrice(s),
    })),
  };

  // Only claim a price range when there are real figures behind it.
  if (lo !== null && hi !== null) {
    data.priceRange = `PKR ${lo.toLocaleString("en-PK")}–${hi.toLocaleString("en-PK")}`;
  }

  // Deliberately absent: telephone while the number is a placeholder, and
  // openingHoursSpecification while the schedule is unconfirmed. Publishing
  // either as structured data would put a guess in Google's business panel.

  return JSON.stringify(data);
}
