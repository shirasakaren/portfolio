import type { MetadataRoute } from "next";

import { navLinks, profile } from "@/lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.website.replace(/\/$/, "");
  return navLinks.map((link) => ({
    url: link.href === "/" ? base : `${base}${link.href}`,
    changeFrequency: "monthly",
    priority: link.href === "/" ? 1 : 0.7,
  }));
}
