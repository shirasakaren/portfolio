import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site — `next build` emits ./out, which is what Cloudflare Pages serves.
  // Anything dynamic lives in /functions (Cloudflare Pages Functions), not in Next.
  output: "export",

  // No Next image optimizer exists on a static host.
  images: { unoptimized: true },

  // Cloudflare Pages resolves /about -> /about.html on its own, so keep clean URLs.
  trailingSlash: false,
};

export default nextConfig;
