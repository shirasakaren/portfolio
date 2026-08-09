import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { DiagramViewer } from "@/components/projects/DiagramViewer";
import { FocusBars } from "@/components/projects/FocusBars";
import { ClipPlayer, Gallery } from "@/components/projects/Media";
import { ProjectArt } from "@/components/projects/plates";
import { KIND_LABEL, LINK_ICON, LINK_LABEL, STATUS, TIERS } from "@/components/projects/tiers";
import { PageTransition } from "@/components/site/PageTransition";
import { Card, Kicker, PageShell, PetalRule, SectionTitle } from "@/components/ui";
import { projects, SHOW_LEGAL_NAME_LINKS } from "@/lib/content";

/**
 * One project dossier.
 *
 * `output: "export"` means every one of these is emitted at build time, so the
 * slug list has to be exhaustive — `generateStaticParams` is what makes that
 * true, and `notFound()` covers the case where a link outlives its project.
 */

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Not found" };
  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  if (!project) notFound();

  const tier = TIERS[project.tier];
  const status = STATUS[project.status];
  const links = project.links.filter(
    (l) => !l.legalName || SHOW_LEGAL_NAME_LINKS,
  );
  const previous = projects[(index - 1 + projects.length) % projects.length]!;
  const next = projects[(index + 1) % projects.length]!;

  return (
    <PageTransition>
      <PageShell wide className="pt-28 sm:pt-32">
        <Reveal y={10}>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-display text-sm font-bold text-sakura-700 transition-colors hover:text-sakura-600"
          >
            <span aria-hidden>←</span> back to the quest log
          </Link>
        </Reveal>

        {/* ── hero ──────────────────────────────────────────────────── */}

        <header className="mt-6">
          <div
            className={`relative rounded-[2.15rem] p-[1.5px] ${tier.frame} ${tier.glow}`}
          >
            <div className="rounded-blob glass relative overflow-hidden">
              <div className="relative aspect-16/9 max-h-[52vh] overflow-hidden bg-sakura-100 sm:aspect-21/9">
                <ProjectArt project={project} full eager described />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-linear-to-t from-cream via-cream/35 to-transparent"
                />
              </div>

              <div className="relative -mt-16 px-5 pb-6 sm:-mt-20 sm:px-8 sm:pb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs font-bold tracking-[0.16em] uppercase ${tier.ribbon}`}
                  >
                    {tier.label}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-sakura-200/80 bg-white/80 px-2.5 py-1 font-mono text-xs font-bold text-ink-700">
                    {project.kind === "infrastructure" ? "⎈" : "◆"}{" "}
                    {KIND_LABEL[project.kind]}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.chip}`}
                  >
                    <span
                      className={`animate-pulse-soft size-1.5 rounded-full ${status.dot}`}
                    />
                    {status.label}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-start gap-4">
                  <span
                    aria-hidden
                    className={`grid size-16 shrink-0 place-items-center rounded-3xl text-3xl ring-1 ring-white/70 ${tier.sigil}`}
                  >
                    {project.emoji}
                  </span>
                  <div className="min-w-0">
                    <h1 className="text-gradient font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] font-extrabold">
                      {project.title}
                    </h1>
                    {project.titleJa && (
                      <p lang="ja" className="font-jp text-lg text-sakura-600">
                        {project.titleJa}
                      </p>
                    )}
                    <p className="mt-1 font-display font-bold text-sakura-500">
                      {project.kicker}
                    </p>
                  </div>
                </div>

                <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-700">
                  {project.summary}
                </p>

                <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs">
                  {[
                    ["role", project.role],
                    ["org", project.org],
                    ["when", project.year],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="tracking-[0.2em] text-ink-300 uppercase">
                        {k}
                      </dt>
                      <dd className="mt-0.5 font-sans text-sm font-semibold text-ink-700">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>

                {links.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-sakura-600 to-sakura-500 px-5 py-2.5 font-display text-sm font-bold text-white shadow-[0_10px_26px_-10px_rgba(214,51,108,0.8)] transition-transform duration-300 hover:-translate-y-0.5"
                        >
                          <span aria-hidden>{LINK_ICON[link.kind]}</span>
                          {link.label}
                          <span className="text-white/70">
                            {LINK_LABEL[link.kind]}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── the write-up ──────────────────────────────────────────── */}

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <Reveal>
              <SectionTitle emoji="📖">What it is</SectionTitle>
            </Reveal>
            <div className="space-y-5">
              {project.story.map((paragraph, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <p className="max-w-[68ch] text-lg leading-relaxed text-ink-700">
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-10">
              <Kicker>where the effort went</Kicker>
              <div className="glass rounded-blob mt-4 p-6">
                <FocusBars bars={project.focus} large />
              </div>
            </Reveal>
          </div>

          <div className="space-y-6">
            <Reveal>
              <Card>
                <Kicker>the numbers</Kicker>
                <dl className="mt-4 space-y-3.5">
                  {project.facts.map((fact) => (
                    <div
                      key={fact.label}
                      className="border-b border-sakura-200/50 pb-3 last:border-0 last:pb-0"
                    >
                      <dt className="text-xs font-bold tracking-[0.16em] text-ink-300 uppercase">
                        {fact.label}
                      </dt>
                      <dd className="text-gradient mt-0.5 font-display text-2xl font-extrabold">
                        {fact.value}
                      </dd>
                      {fact.note && (
                        <p className="text-xs text-ink-500 italic">
                          {fact.note}
                        </p>
                      )}
                    </div>
                  ))}
                </dl>
              </Card>
            </Reveal>

            <Reveal delay={0.06}>
              <Card>
                <Kicker>built with</Kicker>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {project.stack.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-sakura-200/70 bg-white/65 px-2.5 py-1 text-xs font-semibold text-ink-700"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </div>
        </div>

        {/* ── the rack ──────────────────────────────────────────────── */}

        {project.nodes && project.nodes.length > 0 && (
          <section className="mt-20">
            <Reveal>
              <SectionTitle
                emoji="🖥️"
                note="Named machines, as they appear in the diagram. Yes, they are all named after something."
              >
                The rack
              </SectionTitle>
            </Reveal>
            <Stagger
              as="ul"
              className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {project.nodes.map((node) => (
                <StaggerItem as="li" key={node.name}>
                  <div className="rack-rail glass relative flex items-center gap-3 overflow-hidden rounded-[1.1rem] p-4">
                    <span aria-hidden className="rack-vents size-9 shrink-0 rounded-lg" />
                    <span className="min-w-0">
                      <span className="block font-mono text-sm font-bold text-sakura-800">
                        {node.name}
                      </span>
                      <span className="block text-xs text-ink-500">
                        {node.role}
                      </span>
                      {node.spec && (
                        <span className="block font-mono text-[0.68rem] text-ink-300">
                          {node.spec}
                        </span>
                      )}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        )}

        {/* ── the diagram ───────────────────────────────────────────── */}

        {project.diagram && (
          <section className="mt-20">
            <Reveal>
              <SectionTitle
                emoji="🗺️"
                note={
                  project.diagram.sealed
                    ? undefined
                    : "Drawn as it was built. Open it full size — the labels are the interesting part."
                }
              >
                Architecture
              </SectionTitle>
            </Reveal>
            <Reveal delay={0.06}>
              <DiagramViewer diagram={project.diagram} title={project.title} />
            </Reveal>
          </section>
        )}

        {/* ── screenshots ───────────────────────────────────────────── */}

        {project.shots && project.shots.length > 0 && (
          <section className="mt-20">
            <Reveal>
              <SectionTitle emoji="🖼️">Screens</SectionTitle>
            </Reveal>
            <Reveal delay={0.06}>
              <Gallery shots={project.shots} title={project.title} />
            </Reveal>
          </section>
        )}

        {/* ── clips ─────────────────────────────────────────────────── */}

        {project.clips && project.clips.length > 0 && (
          <section className="mt-16">
            <Reveal>
              <SectionTitle emoji="🎬">In motion</SectionTitle>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-2">
              {project.clips.map((clip) => (
                <Reveal key={clip.mp4}>
                  <ClipPlayer clip={clip} />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <PetalRule className="mt-20" />

        {/* ── prev / next ───────────────────────────────────────────── */}

        <nav
          aria-label="Other projects"
          className="mt-10 grid gap-3 pb-4 sm:grid-cols-2"
        >
          {[
            { p: previous, dir: "previous", arrow: "←" },
            { p: next, dir: "next", arrow: "→" },
          ].map(({ p, dir, arrow }) => (
            <Link
              key={dir}
              href={`/projects/${p.slug}`}
              className={`glass rounded-blob group flex items-center gap-4 p-5 transition-transform duration-500 hover:-translate-y-1 ${
                dir === "next" ? "sm:flex-row-reverse sm:text-right" : ""
              }`}
            >
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-full bg-sakura-100 text-sakura-700 transition-colors group-hover:bg-sakura-600 group-hover:text-white"
              >
                {arrow}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[0.65rem] font-bold tracking-[0.24em] text-ink-300 uppercase">
                  {dir}
                </span>
                <span className="block truncate font-display text-lg font-extrabold text-sakura-800">
                  {p.emoji} {p.title}
                </span>
              </span>
            </Link>
          ))}
        </nav>
      </PageShell>
    </PageTransition>
  );
}
