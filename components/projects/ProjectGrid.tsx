"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

import { EASE } from "@/components/motion";
import { projects, type ProjectKind } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/motion";

import { ProjectCard } from "./ProjectCard";
import { infraCountOf, productCountOf } from "./stats";
import "./projects.css";

/**
 * The collection.
 *
 * Two things keep this from being a wall of identical tiles: legendary builds
 * take the full width and lay themselves out horizontally, and the filter
 * animates by identity rather than by index — Motion's `layout` keeps a card
 * that survives a filter change in place while its neighbours leave around it,
 * so switching tabs reads as a shuffle rather than a repaint.
 */

const FILTERS: { id: "all" | ProjectKind; label: string; emoji: string }[] = [
  { id: "all", label: "Everything", emoji: "✿" },
  { id: "product", label: "Products", emoji: "◆" },
  { id: "infrastructure", label: "Infrastructure", emoji: "⎈" },
];

export function ProjectGrid() {
  const [filter, setFilter] = useState<"all" | ProjectKind>("all");
  const reduced = usePrefersReducedMotion();

  const shown = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.kind === filter)),
    [filter],
  );

  const counts = {
    all: projects.length,
    product: productCountOf(),
    infrastructure: infraCountOf(),
  };

  return (
    <>
      <div
        role="tablist"
        aria-label="Filter projects"
        className="mt-10 flex flex-wrap gap-2"
      >
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-display text-sm font-bold transition-colors duration-300 ${
                active ? "text-white" : "text-ink-700 hover:text-sakura-700"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="project-filter-pill"
                  className="absolute inset-0 rounded-full bg-linear-to-r from-sakura-600 to-lilac-400 shadow-[0_10px_26px_-10px_rgba(214,51,108,0.85)]"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 340, damping: 32 }
                  }
                />
              )}
              {!active && (
                <span className="absolute inset-0 rounded-full border border-sakura-200/80 bg-white/60" />
              )}
              <span aria-hidden className="relative">
                {f.emoji}
              </span>
              <span className="relative">{f.label}</span>
              <span
                className={`relative font-mono text-xs tabular-nums ${
                  active ? "text-white/80" : "text-ink-300"
                }`}
              >
                {counts[f.id]}
              </span>
            </button>
          );
        })}
      </div>

      <motion.ul
        layout={!reduced}
        className="mt-8 grid gap-5 md:grid-cols-2"
        transition={{ duration: 0.5, ease: EASE }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((project) => {
            const wide = project.tier === "legendary";
            return (
              <motion.li
                key={project.slug}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, scale: 0.94, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.42, ease: EASE }}
                className={wide ? "md:col-span-2" : ""}
              >
                <ProjectCard project={project} wide={wide} />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    </>
  );
}
