import type { Metadata } from "next";
import Link from "next/link";

import { Card, PageHeader, PageShell, Petals } from "@/components/ui";
import { projects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Platform, cloud and reliability work — landing zones, GitOps on Talos, signed supply chains, and observability that answers questions.",
};

export default function ProjectsPage() {
  return (
    <>
      <Petals />
      <PageShell>
        <PageHeader
          kicker="selected work"
          title="Things I build"
          lead="Patterns I keep coming back to, and the reasoning behind each one. Infrastructure work rarely has a screenshot — so here's the thinking instead."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Card
              key={project.slug}
              className="flex flex-col hover:-translate-y-1"
            >
              <span aria-hidden className="text-3xl">
                {project.emoji}
              </span>
              <h2 className="mt-4 font-display text-2xl font-extrabold text-sakura-800">
                {project.title}
              </h2>
              <p className="mt-3 leading-relaxed font-medium text-ink-700">
                {project.summary}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                {project.detail}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2 pt-1">
                {project.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-sakura-100 px-2.5 py-1 text-xs font-semibold text-sakura-700"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <section className="rounded-blob mt-16 border border-sakura-200/70 bg-white/70 p-8 text-center backdrop-blur-sm">
          <h2 className="font-display text-xl font-extrabold text-sakura-800">
            Want the details?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-500">
            Most of this lives behind an NDA or inside a private cluster. Happy
            to walk through architecture, trade-offs and war stories over a call.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-sakura-600 px-7 py-3.5 font-display font-bold text-white transition-transform duration-300 hover:-translate-y-0.5"
          >
            get in touch <span aria-hidden>→</span>
          </Link>
        </section>
      </PageShell>
    </>
  );
}
