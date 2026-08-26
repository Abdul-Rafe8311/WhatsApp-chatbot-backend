import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — this site deploys to Cloudflare Pages as plain files.
  output: "export",
  // Cloudflare Pages serves /about as /about/index.html.
  trailingSlash: true,
  // No Next image optimisation server exists in a static export.
  images: { unoptimized: true },
  // `next dev` otherwise appends a managed block to CLAUDE.md on every start.
  // That file is maintained by hand; a tool silently editing it produces
  // mystery diffs and dirties the tree mid-review.
  agentRules: false,
};

export default nextConfig;
