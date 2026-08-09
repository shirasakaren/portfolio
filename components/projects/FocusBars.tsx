"use client";

import { motion } from "motion/react";

import { EASE } from "@/components/motion";
import type { StatBar } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/motion";

/**
 * Where the engineering effort went, as RPG stat bars.
 *
 * Animated with `scaleX` rather than `width` — a transform is composited, a
 * width is a layout pass, and there are thirty-two of these bars on the index
 * page. `transform-origin: left` is what makes it read as a bar filling rather
 * than a bar growing from its middle.
 */
export function FocusBars({
  bars,
  className = "",
  large = false,
}: {
  bars: StatBar[];
  className?: string;
  /** Detail-page sizing: taller track, roomier labels. */
  large?: boolean;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <ul
      className={`grid grid-cols-2 ${large ? "gap-x-6 gap-y-4" : "gap-x-4 gap-y-2.5"} ${className}`}
    >
      {bars.map((bar, i) => (
        <li key={bar.label}>
          <div className="flex items-baseline justify-between gap-2">
            <span
              className={`font-mono ${large ? "text-sm" : "text-xs"} font-semibold tracking-[0.1em] text-ink-500 lowercase`}
            >
              {bar.label}
            </span>
            <span
              className={`font-mono ${large ? "text-sm" : "text-xs"} font-bold text-sakura-700 tabular-nums`}
            >
              {bar.value}
            </span>
          </div>
          <div
            className={`mt-1.5 w-full overflow-hidden rounded-full bg-sakura-100 ring-1 ring-sakura-200/70 ring-inset ${
              large ? "h-2.5" : "h-1.5"
            }`}
          >
            {reduced ? (
              <span
                className="block h-full origin-left rounded-full bg-linear-to-r from-sakura-600 via-sakura-500 to-lilac-400"
                style={{ transform: `scaleX(${bar.value / 100})` }}
              />
            ) : (
              <motion.span
                className="block h-full origin-left rounded-full bg-linear-to-r from-sakura-600 via-sakura-500 to-lilac-400"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: bar.value / 100 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.95, delay: 0.06 * i, ease: EASE }}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
