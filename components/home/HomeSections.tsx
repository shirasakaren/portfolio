"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  Marquee,
  Reveal,
  Stagger,
  StaggerItem,
  TiltCard,
  useParallax,
} from "@/components/motion";
import { ReactionClip } from "@/components/visual/ReactionClip";
import { brandIcon } from "@/lib/stack-icons";
import { favourites, pillars, projects, stack } from "@/lib/content";

/**
 * The homepage below the hero.
 *
 * The hero already did the spectacle, so everything here is written to be the
 * calm after it: one idea per screen, each one ending in a door to a deeper
 * page. Nothing on this page is the whole story — it is all an invitation.
 */

/** The marks that open the page, straight off the Stack data. */
const LOGO_WALL = [
  ...(stack.find((g) => g.id === "clouds")?.items ?? []),
  ...(stack.find((g) => g.id === "orchestration")?.items ?? []).slice(0, 8),
  ...(stack.find((g) => g.id === "observability")?.items ?? []).slice(0, 6),
  ...(stack.find((g) => g.id === "iac")?.items ?? []).slice(0, 6),
].filter((s) => brandIcon(s.icon));

export function LogoWall() {
  return (
    <Marquee speed={54} className="py-1">
      {LOGO_WALL.map((skill, i) => {
        const icon = brandIcon(skill.icon)!;
        return (
          <span
            key={`${skill.name}-${i}`}
            className="group/logo flex shrink-0 items-center gap-2.5 rounded-2xl border border-sakura-200/60 bg-white/55 px-4 py-3 backdrop-blur-sm"
            title={skill.name}
          >
            <svg
              viewBox={icon.box}
              aria-hidden
              className="h-5 w-auto shrink-0 text-ink-300 transition-colors duration-300 group-hover/logo:text-(--brand)"
              style={{ ["--brand" as string]: icon.hex, maxWidth: "2.6rem" }}
              fill="currentColor"
            >
              {icon.paths.map((p, k) => (
                <path
                  key={k}
                  d={p.d}
                  fillRule={p.evenOdd ? "evenodd" : undefined}
                />
              ))}
            </svg>
            <span className="font-display text-xs font-bold whitespace-nowrap text-ink-500">
              {skill.name}
            </span>
          </span>
        );
      })}
    </Marquee>
  );
}

export function Pillars() {
  return (
    <Stagger as="ul" className="grid gap-4 md:grid-cols-2">
      {pillars.map((pillar, i) => (
        <StaggerItem as="li" key={pillar.id} className="group">
          <TiltCard
            strength={6}
            className="glass rounded-blob relative h-full overflow-hidden p-6 sm:p-8"
          >
            <span
              aria-hidden
              className="absolute top-4 right-6 font-display text-6xl font-extrabold text-sakura-200/60 transition-transform duration-700 group-hover:-translate-y-1"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span aria-hidden className="text-3xl">
              {pillar.emoji}
            </span>
            <p className="mt-4 font-display text-xs font-bold tracking-[0.24em] text-sakura-500 uppercase">
              {pillar.short}
            </p>
            <h3 className="mt-1.5 font-display text-2xl font-extrabold text-sakura-800">
              {pillar.title}
            </h3>
            <p className="mt-3 leading-relaxed text-ink-500">{pillar.body}</p>
          </TiltCard>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

const FEATURED = ["atlas", "a-thousand-rallies", "kaizin-platform"] as const;

export function FeaturedWork() {
  const picks = FEATURED.map((slug) => projects.find((p) => p.slug === slug)!).filter(
    Boolean,
  );

  return (
    <Stagger as="ul" className="grid gap-5 md:grid-cols-3">
      {picks.map((project) => {
        const art =
          project.shots?.[0]?.thumb ??
          project.shots?.[0]?.src ??
          project.diagram?.preview;
        const sealed = project.diagram?.sealed;

        return (
          <StaggerItem as="li" key={project.slug} className="group">
            <Link
              href={`/projects/${project.slug}`}
              className="glass rounded-blob block h-full overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-sakura-100">
                {art && !sealed ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static export
                  <img
                    src={art}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-top transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                ) : (
                  <SealedPlate emoji={project.emoji} />
                )}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-linear-to-t from-sakura-900/45 via-transparent to-transparent"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-2.5 py-1 font-display text-[0.65rem] font-bold tracking-wide text-sakura-700 uppercase backdrop-blur-sm">
                  {project.kind === "product" ? "product" : "infrastructure"}
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-display text-lg font-extrabold text-sakura-800">
                  <span aria-hidden className="mr-1.5">
                    {project.emoji}
                  </span>
                  {project.title}
                </h3>
                <p className="mt-1 font-display text-xs font-bold text-sakura-500">
                  {project.kicker}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">
                  {project.summary}
                </p>
              </div>
            </Link>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

/**
 * Stands in for a diagram that carries a not-for-public notice. Deliberately
 * abstract — a blurred copy of the real thing would still be the real thing.
 */
function SealedPlate({ emoji }: { emoji: string }) {
  return (
    <span className="dot-grid absolute inset-0 grid place-items-center bg-linear-to-br from-ink-900/90 to-sakura-900/85">
      <span className="flex flex-col items-center gap-2 text-center">
        <span aria-hidden className="text-3xl opacity-90">
          {emoji}
        </span>
        <span className="font-display text-[0.62rem] font-bold tracking-[0.3em] text-sakura-200 uppercase">
          under seal
        </span>
      </span>
    </span>
  );
}

/** A slow drift on the portrait column, tying the section to the scroll. */
export function PersonalTeaser() {
  const { ref, y } = useParallax(28);
  const picks = favourites.filter((f) =>
    ["okonomiyaki", "sora", "diving"].includes(f.id),
  );

  return (
    <div ref={ref} className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
      <motion.div style={{ y }} className="flex justify-center gap-3">
        <ReactionClip
          name="hehe"
          size="w-32 sm:w-40"
          rounded="rounded-[1.5rem]"
          className="mt-8"
        />
        <ReactionClip
          name="cheekPuff"
          size="w-32 sm:w-40"
          rounded="rounded-[1.5rem]"
        />
      </motion.div>

      <div>
        <Reveal>
          <p className="font-display text-xs font-bold tracking-[0.34em] text-sakura-500 uppercase">
            ✿ and off the clock
          </p>
          <h2 className="text-gradient mt-3 font-display text-[clamp(1.8rem,4.4vw,2.9rem)] leading-tight font-extrabold">
            There is a person under all this YAML.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-500">
            She is a picky eater with a cat, an archery habit and extremely
            strong feelings about which Marvel character is correct.
          </p>
        </Reveal>

        <Stagger as="ul" className="mt-7 grid gap-3 sm:grid-cols-3">
          {picks.map((f) => (
            <StaggerItem as="li" key={f.id}>
              <div className="glass rounded-[1.3rem] p-4">
                <span aria-hidden className="text-2xl">
                  {f.emoji}
                </span>
                <p className="mt-2 font-display text-sm font-extrabold text-ink-900">
                  {f.label}
                </p>
                <p className="text-[0.7rem] font-bold tracking-[0.18em] text-sakura-500 uppercase">
                  {f.category}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1}>
          <Link
            href="/about"
            className="mt-7 inline-flex items-center gap-2 font-display font-bold text-sakura-700 underline decoration-sakura-300 decoration-2 underline-offset-4 transition-colors hover:text-sakura-600"
          >
            meet her properly <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
