import type { Metadata } from "next";
import Link from "next/link";

import { Counter, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { questStats } from "@/components/projects/stats";
import { PageTransition } from "@/components/site/PageTransition";
import { PageHeader, PageShell, PetalRule, Sparkles } from "@/components/ui";
import { ReactionClip } from "@/components/visual/ReactionClip";
import { infraCount, productCount, projects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: `${projects.length} builds — ${productCount} full-stack products and ${infraCount} infrastructure designs, from a self-hosted project HQ to a game platform running on three continents.`,
};

export default function ProjectsPage() {
  return (
    <PageTransition>
      <PageShell wide>
        <PageHeader
          kicker="quest log"
          title="Things I built and kept alive"
          lead="Some of these you can click on and use. The rest are architectures — the kind of work whose only screenshot is a diagram, so the diagram is the screenshot."
          aside={
            <ReactionClip
              name="smug"
              eager
              size="w-36 sm:w-44"
              caption="yes, all of them"
            />
          }
        />

        {/* ── the stat strip ─────────────────────────────────────────
            Every number here is counted out of the project data at build
            time, so it cannot drift away from the cards below it. */}
        <Stagger
          as="ul"
          className="mt-10 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-6"
        >
          {questStats.map((stat) => (
            <StaggerItem as="li" key={stat.id}>
              <div className="glass rounded-[1.4rem] px-4 py-4 text-center">
                <span aria-hidden className="text-lg">
                  {stat.emoji}
                </span>
                <p className="text-gradient font-display text-[clamp(1.5rem,3.4vw,2.1rem)] leading-none font-extrabold">
                  <Counter to={stat.value} />
                </p>
                <p className="mt-1.5 font-display text-xs font-bold text-ink-700">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-[0.66rem] leading-tight text-ink-300">
                  {stat.note}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <ProjectGrid />

        <PetalRule className="mt-20" />

        <Reveal className="mt-12">
          <section className="rounded-blob relative overflow-hidden border border-sakura-200/70 bg-linear-to-br from-sakura-100/80 via-white/60 to-lilac-200/50 px-6 py-14 text-center sm:px-12">
            <Sparkles count={10} className="opacity-60" />
            <div className="relative">
              <h2 className="text-gradient font-display text-[clamp(1.6rem,3.8vw,2.4rem)] font-extrabold">
                Want the parts I cannot put on a website?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-ink-500">
                Some of this lives behind an NDA or inside a private cluster.
                The trade-offs, the incidents and the things I would do
                differently travel fine over a call, though.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-sakura-600 to-lilac-400 px-7 py-3.5 font-display font-bold text-white shadow-[0_14px_36px_-12px_rgba(214,51,108,0.7)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                ask me about one <span aria-hidden>→</span>
              </Link>
            </div>
          </section>
        </Reveal>
      </PageShell>
    </PageTransition>
  );
}
