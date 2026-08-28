import type { MetadataRoute } from "next";
import { salon } from "@/config/salon";

/** Static export writes this to out/robots.txt. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    // Omitted until the deploy URL is known — a sitemap line pointing at the
    // wrong host is worse than none.
    ...(salon.info.siteUrl
      ? { sitemap: `${salon.info.siteUrl}/sitemap.xml` }
      : {}),
  };
}
