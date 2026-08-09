"use client";

import { useMemo } from "react";

import { Counter, Marquee } from "@/components/motion";
import { Sparkles } from "@/components/ui";
import { brandIcons } from "@/lib/stack-icons";
import { stack, skillCount, type Level } from "@/lib/content";

import { BrandMark, marqueeSlugs } from "./BrandMark";

/**
 * The opening.
 *
 * Two counter-rotating ribbons of real brand marks with the numbers floating
 * over the top — the "yes, all of that" moment before anyone has to read a
 * word. The marks are decorative here (the wall below is the actual list), so
 * they're hidden from assistive tech and the whole thing is one CSS animation.
 *
 * Forty-four marks, not all 142: the ribbon is duplicated to loop seamlessly,
 * so every mark on it costs two DOM nodes and the wall underneath still needs
 * two hundred.
 */

const RIBBON = 44;

export function LogoWall() {
  const [top, bottom, levels] = useMemo(() => {
    const slugs = marqueeSlugs(stack, RIBBON);
    const tally: Record<Level, number> = { 1: 0, 2: 0, 3: 0 };
    for (const group of stack) {
      for (const item of group.items) tally[item.level]++;
    }
    return [slugs.slice(0, RIBBON / 2), slugs.slice(RIBBON / 2), tally];
  }, []);

  return (
    <section
      aria-label="Brand marks from the stack"
      className="relative mt-12 overflow-hidden rounded-blob border border-sakura-200/60 bg-cream/45 py-8 backdrop-blur-md sm:py-10"
    >
      <Sparkles count={10} className="opacity-60" />

      <div className="flex flex-col gap-3 sm:gap-4">
        <Marquee speed={58}>
          {top.map((slug) => (
            <LogoChip key={slug} slug={slug} />
          ))}
        </Marquee>
        <Marquee speed={72} reverse>
          {bottom.map((slug) => (
            <LogoChip key={slug} slug={slug} />
          ))}
        </Marquee>
      </div>

      {/* The readout sits on top of the ribbons, which is what makes the whole
          block read as one object instead of a banner with a caption. */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center px-4">
        <div className="glass pointer-events-auto rounded-blob px-6 py-5 text-center shadow-[0_24px_60px_-30px_rgba(214,51,108,0.7)] sm:px-10 sm:py-6">
          <p className="text-gradient font-display text-[clamp(2.6rem,8vw,4.4rem)] leading-none font-extrabold">
            <Counter to={skillCount} duration={2.1} />
          </p>
          <p className="mt-1 font-display text-sm font-bold tracking-[0.24em] text-sakura-600 uppercase">
            tools on the shelf
          </p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-semibold text-ink-500">
            <Stat n={stack.length} label="categories" />
            <Stat n={levels[3]} label="daily drivers" />
            <Stat n={levels[2]} label="run in production" />
            <Stat n={Object.keys(brandIcons).length} label="real logos" />
          </ul>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <li className="flex items-baseline gap-1.5">
      <span className="font-display text-base font-extrabold text-sakura-700">
        {n}
      </span>
      {label}
    </li>
  );
}

function LogoChip({ slug }: { slug: string }) {
  const icon = brandIcons[slug];
  return (
    <span
      title={icon?.title}
      className="group/chip grid size-14 shrink-0 place-items-center rounded-[1rem] border border-sakura-200/60 bg-cream/70 text-sakura-700/80 transition-[transform,color,border-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-transparent hover:text-(--chip-brand) sm:size-16"
      style={{ ["--chip-brand" as string]: icon?.hex }}
    >
      <BrandMark slug={slug} name={icon?.title ?? slug} className="size-7 sm:size-8" />
    </span>
  );
}
