"use client";

import Link from "next/link";

import { TiltCard } from "@/components/motion";
import type { Project } from "@/lib/content";

import { FocusBars } from "./FocusBars";
import { ProjectArt } from "./plates";
import { KIND_SHORT, STATUS, TIERS } from "./tiers";

/**
 * One card in the collection.
 *
 * The whole thing is a single link — a card with three separate tap targets is
 * a card nobody taps. Rarity is carried by the frame, the foil and the ribbon
 * rather than by a word, so the grid sorts itself out at a glance, and the
 * legendary builds take two columns on a wide screen and get their summary
 * paragraph as well, which is what keeps the grid from reading as a wall of
 * identical tiles.
 */
export function ProjectCard({
  project,
  wide = false,
}: {
  project: Project;
  wide?: boolean;
}) {
  const tier = TIERS[project.tier];
  const status = STATUS[project.status];
  const chips = project.stack.slice(0, 5);
  const overflow = project.stack.length - chips.length;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block h-full rounded-[2.15rem]"
    >
      <TiltCard className="h-full rounded-[2.15rem]" strength={wide ? 4 : 7}>
        {/* The gradient ring is a 1.5px padded backdrop rather than a border,
            which is the only way to get a gradient edge that follows a radius. */}
        <div
          className={`relative h-full rounded-[2.15rem] p-[1.5px] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 ${tier.frame} ${tier.glow}`}
        >
          <article
            className={`rounded-blob glass relative flex h-full flex-col overflow-hidden ${
              wide ? "xl:min-h-[21rem] xl:flex-row" : ""
            }`}
          >
            {/* ── artwork ── */}
            <div
              className={`relative shrink-0 overflow-hidden bg-sakura-100 ${
                wide
                  ? "aspect-[16/10] xl:aspect-auto xl:h-auto xl:w-[44%] xl:self-stretch"
                  : "aspect-[16/10]"
              }`}
            >
              <ProjectArt project={project} compact />

              {/* Warm scrim so the ribbons stay readable over any screenshot,
                  and so the artwork joins the card instead of sitting on it. */}
              <span
                aria-hidden
                className={`pointer-events-none absolute inset-0 ${
                  wide
                    ? "bg-linear-to-t from-cream/70 via-transparent to-sakura-900/15 xl:bg-linear-to-r xl:from-transparent xl:via-transparent xl:to-cream/80"
                    : "bg-linear-to-t from-cream/75 via-transparent to-sakura-900/15"
                }`}
              />

              <span className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs font-bold tracking-[0.16em] uppercase ${tier.ribbon}`}
                >
                  {tier.label}
                  <span aria-hidden className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`size-1.5 rounded-full bg-current ${
                          i < tier.pips ? "" : "opacity-25"
                        }`}
                      />
                    ))}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/80 px-2.5 py-1 font-mono text-xs font-bold text-ink-700 backdrop-blur-md">
                  {project.kind === "infrastructure" ? "⎈" : "◆"}{" "}
                  {KIND_SHORT[project.kind]}
                </span>
              </span>

              <span className="absolute bottom-3 left-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.chip}`}
                >
                  <span
                    className={`animate-pulse-soft size-1.5 rounded-full ${status.dot}`}
                  />
                  {status.label}
                </span>
              </span>
            </div>

            {/* ── body ── */}
            <div className="relative flex flex-1 flex-col gap-4 p-5 sm:p-6">
              <div className="flex items-start gap-3.5">
                <span
                  aria-hidden
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl text-2xl ring-1 ring-white/70 ${tier.sigil}`}
                >
                  {project.emoji}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-xl leading-tight font-extrabold text-sakura-800 transition-colors duration-300 group-hover:text-sakura-600 sm:text-2xl">
                    {project.title}
                  </h3>
                  <p className="mt-0.5 text-sm leading-snug font-semibold text-ink-500">
                    {project.kicker}
                  </p>
                </div>
              </div>

              {wide && (
                <p className="max-w-[52ch] text-sm leading-relaxed text-ink-700">
                  {project.summary}
                </p>
              )}

              <p className="font-mono text-xs tracking-wide text-ink-300">
                {project.org} · {project.year}
              </p>

              <FocusBars bars={project.focus} className="mt-auto" />

              <ul className="flex flex-wrap gap-1.5">
                {chips.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-sakura-200/70 bg-white/60 px-2.5 py-1 text-xs font-semibold text-ink-700"
                  >
                    {item}
                  </li>
                ))}
                {overflow > 0 && (
                  <li className="rounded-full border border-sakura-300/70 bg-sakura-100 px-2.5 py-1 font-mono text-xs font-bold text-sakura-700">
                    +{overflow}
                  </li>
                )}
              </ul>

              <div className="flex items-center justify-between border-t border-sakura-200/60 pt-3.5">
                <span className="font-display text-sm font-bold text-sakura-700">
                  open the dossier
                </span>
                <span
                  aria-hidden
                  className="grid size-7 place-items-center rounded-full bg-sakura-100 text-sakura-700 transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-sakura-600 group-hover:text-white"
                >
                  →
                </span>
              </div>
            </div>

            {/* Rarity, on top of everything: the prismatic sweep for legendary,
                a still diagonal highlight for epic, nothing for rare. */}
            {tier.foil && (
              <span
                aria-hidden
                className="holo-foil pointer-events-none absolute inset-0 rounded-[inherit] opacity-60"
              />
            )}
            {tier.sheen && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-tr from-transparent via-white/35 to-transparent opacity-70 mix-blend-soft-light"
              />
            )}
          </article>
        </div>
      </TiltCard>
    </Link>
  );
}
