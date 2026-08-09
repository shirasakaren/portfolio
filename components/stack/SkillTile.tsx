"use client";

import { memo, type CSSProperties } from "react";

import { levelLabel, type Skill } from "@/lib/content";

import { BrandMark, brandTint } from "./BrandMark";
import { LevelMeter } from "./LevelMeter";

/**
 * One tool.
 *
 * Memoised on purpose: a keystroke re-runs the filter over 219 skills, but only
 * the handful whose match state actually flipped need to touch the DOM. The
 * flip itself is a data attribute — the animation lives in `stack.css` and runs
 * on the compositor.
 */

type Props = {
  skill: Skill;
  /** Position within the section, for the deal-in delay. */
  index: number;
  /** Something is being filtered for, and this isn't it. */
  dim: boolean;
  /** Something is being filtered for, and this is it. */
  hit: boolean;
  /** The alias that matched, when the name itself didn't — "EKS" for AWS. */
  alias?: string;
};

export const SkillTile = memo(function SkillTile({
  skill,
  index,
  dim,
  hit,
  alias,
}: Props) {
  const tint = brandTint(skill.icon);

  return (
    <li
      className="stack-tile group/tile relative flex min-h-[6.4rem] flex-col justify-between rounded-[1.1rem] border border-sakura-200/70 bg-cream/70 p-3 backdrop-blur-[6px] data-[level=1]:border-sakura-100 data-[level=1]:bg-cream/45 data-[level=3]:bg-cream/85"
      data-level={skill.level}
      data-dim={dim ? "true" : undefined}
      data-hit={hit ? "true" : undefined}
      style={
        {
          "--i": index,
          ...(tint ? { "--brand": tint } : null),
        } as CSSProperties
      }
    >
      {/* Daily drivers get the trading-card foil, but only while the pointer
          is on them — see the play-state rule in stack.css. */}
      {skill.level === 3 && (
        <span
          aria-hidden="true"
          className="holo-foil stack-foil pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/tile:opacity-70"
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <span className="stack-mark-frame grid size-9 shrink-0 place-items-center rounded-[0.6rem] border border-sakura-200/60 bg-cream/80 text-sakura-700 transition-colors duration-300">
          <BrandMark slug={skill.icon} name={skill.name} className="size-6" />
        </span>
        <LevelMeter level={skill.level} className="mt-1" />
      </div>

      <div className="mt-2.5">
        <p className="font-display text-[0.92rem] leading-tight font-bold text-ink-900 transition-colors duration-300 group-hover/tile:text-sakura-800">
          {skill.name}
        </p>
        {skill.note && (
          <p className="mt-0.5 text-xs text-ink-300 italic">{skill.note}</p>
        )}
      </div>

      {/* The level in words, and — when a filter is running — the fact that this
          one matched. Both are for the reader who never sees the colour. */}
      <span className="sr-only">
        {levelLabel[skill.level]}
        {hit ? " — matches the current filter" : ""}
      </span>

      {/* Why it matched, when the name alone doesn't say so. Absolutely
          positioned into the grid gutter so appearing costs no layout. */}
      {alias && (
        <span className="pointer-events-none absolute -bottom-2 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-sakura-300/80 bg-cream px-2 py-0.5 font-mono text-xs font-bold text-sakura-700 shadow-[0_4px_12px_-4px_rgba(214,51,108,0.45)]">
          {alias}
        </span>
      )}
    </li>
  );
});
