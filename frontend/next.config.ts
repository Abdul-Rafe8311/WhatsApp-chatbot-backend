import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — this site deploys to Cloudflare Pages as plain files.
  output: "export",
  // Cloudflare Pages serves /about as /about/index.html.
  trailingSlash: true,
  // No Next image optimisation server exists in a static export.
  images: { unoptimized: true },
};

export default nextConfig;
