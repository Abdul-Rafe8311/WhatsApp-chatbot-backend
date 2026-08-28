import type { MetadataRoute } from "next";
import { salon } from "@/config/salon";

/** Static export writes this to out/sitemap.xml. */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = salon.info.siteUrl;
  // Without an absolute base a sitemap is meaningless, so emit nothing
  // rather than relative entries no crawler will accept.
  if (!base) return [];
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/services/`, lastModified: now, priority: 0.8 },
  ];
}
