import type { MetadataRoute } from "next";

import { navLinks, profile, projects } from "@/lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.website.replace(/\/$/, "");

  return [
    ...navLinks.map((link) => ({
      url: link.href === "/" ? base : `${base}${link.href}`,
      changeFrequency: "monthly" as const,
      priority: link.href === "/" ? 1 : 0.7,
    })),
    // Every dossier is a real page with its own metadata, so it belongs here
    // too — otherwise the deepest, most linkable content on the site is the
    // only part a crawler has to guess at.
    ...projects.map((project) => ({
      url: `${base}/projects/${project.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
