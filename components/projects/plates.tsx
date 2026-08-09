"use client";

import { useState } from "react";

import type { Project } from "@/lib/content";

import "./projects.css";

/**
 * Everything that fills the artwork slot on a project.
 *
 * Three of the eight builds have screenshots, four have an architecture
 * drawing, one of those is sealed, and two have neither. Rather than let the
 * grid go ragged, each of those cases gets its own designed plate — so a card
 * with no media is a deliberate object rather than an empty box.
 */

// ── deterministic scatter ───────────────────────────────────────────────

/** FNV-1a. Small, fast and stable between the server render and hydration. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function seeded(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type Point = { x: number; y: number; r: number };

/** A stable little constellation, unique per slug. Decorative, never data. */
function constellation(slug: string, count: number): Point[] {
  const rand = seeded(hash(slug));
  return Array.from({ length: count }, (_, i) => {
    // Spread around a ring so the centre stays clear for the sigil.
    const angle = (i / count) * Math.PI * 2 + rand() * 0.7;
    const radius = 26 + rand() * 17;
    return {
      x: 50 + Math.cos(angle) * radius * 1.55,
      y: 50 + Math.sin(angle) * radius,
      r: 0.9 + rand() * 1.6,
    };
  });
}

// ── crest ───────────────────────────────────────────────────────────────

/**
 * The stand-in for a project with no screenshot and no diagram — a generated
 * crest rather than a placeholder. Also the failure state for every image on
 * the page, so a missing file degrades into something intentional.
 */
export function CrestPlate({
  project,
  compact = false,
}: {
  project: Project;
  compact?: boolean;
}) {
  const points = constellation(project.slug, compact ? 8 : 12);

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden bg-linear-to-br from-sakura-100 via-cream to-lilac-200/70"
    >
      <span className="dot-grid absolute inset-0 opacity-55" />

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="crest-orbit absolute inset-0 h-full w-full"
      >
        <g
          stroke="var(--color-sakura-400)"
          strokeOpacity="0.45"
          strokeWidth="0.35"
          fill="none"
        >
          {points.map((p, i) => {
            const next = points[(i + 1) % points.length];
            return (
              <line key={`l${i}`} x1={p.x} y1={p.y} x2={next.x} y2={next.y} />
            );
          })}
          {points.map((p, i) => (
            <line key={`s${i}`} x1={50} y1={50} x2={p.x} y2={p.y} opacity={0.3} />
          ))}
        </g>
        {points.map((p, i) => (
          <circle
            key={`c${i}`}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill="var(--color-sakura-500)"
            opacity={0.65}
          />
        ))}
      </svg>

      <span className="absolute inset-0 grid place-items-center">
        <span
          className={`animate-float drop-shadow-[0_12px_28px_rgba(214,51,108,0.32)] ${
            compact ? "text-[clamp(2.4rem,7vw,3.6rem)]" : "text-[clamp(3rem,9vw,6rem)]"
          }`}
        >
          {project.emoji}
        </span>
      </span>

      {/* On a card the status chip already occupies this corner, so the
          caption keeps to the right and the label waits for the full size. */}
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-3 bg-linear-to-t from-cream/90 to-transparent px-4 pt-8 pb-3">
        {!compact && (
          <span className="mr-auto font-mono text-xs tracking-[0.2em] text-sakura-600 uppercase">
            no public screenshots
          </span>
        )}
        <span className="font-mono text-xs text-ink-300">{project.org}</span>
      </span>
    </div>
  );
}

// ── sealed ──────────────────────────────────────────────────────────────

/**
 * A diagram we are not allowed to publish.
 *
 * Deliberately NOT a blurred copy of the real drawing — blur is reversible and,
 * worse, it looks like an accident. This is an abstract plate: hazard weave, a
 * scanning light, an invented schematic that says "architecture" without saying
 * anything at all, and the seal itself.
 */
export function SealedPlate({
  reason,
  compact = false,
}: {
  reason?: string;
  compact?: boolean;
}) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden bg-linear-to-br from-sakura-900 via-[#5b1b34] to-ink-900"
    >
      <span className="hazard-stripes absolute inset-0 opacity-70" />

      {/* An invented schematic. Generic boxes and links — the shape of a
          diagram, none of its content. */}
      <svg
        viewBox="0 0 120 70"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full opacity-30"
      >
        <g stroke="var(--color-sakura-300)" strokeWidth="0.5" fill="none">
          <rect x="10" y="12" width="24" height="12" rx="2.5" />
          <rect x="48" y="8" width="24" height="10" rx="2.5" />
          <rect x="86" y="14" width="22" height="12" rx="2.5" />
          <rect x="14" y="42" width="22" height="12" rx="2.5" />
          <rect x="52" y="46" width="26" height="11" rx="2.5" />
          <rect x="88" y="40" width="20" height="14" rx="2.5" />
          <path d="M34 18h14M72 13h14M25 24v18M60 18v28M97 26v14M36 48h16M78 51h10" />
        </g>
      </svg>

      {/* The scanning light. One element, one transform, no repaint. */}
      <span className="seal-sweep absolute inset-x-0 top-0 h-1/4 bg-linear-to-b from-transparent via-sakura-300/25 to-transparent" />

      <span className="absolute inset-0 grid place-items-center">
        <span className="relative grid place-items-center">
          <span
            className={`animate-spin-slow absolute rounded-full border border-dashed border-sakura-300/60 ${
              compact ? "size-24" : "size-40"
            }`}
          />
          <span
            className={`grid place-items-center rounded-full bg-linear-to-br from-sakura-600 to-sakura-800 text-white shadow-[0_18px_40px_-14px_rgba(0,0,0,0.75)] ring-1 ring-sakura-300/50 ${
              compact ? "size-16" : "size-24"
            }`}
          >
            <span className={compact ? "text-xl" : "text-3xl"}>✿</span>
            <span className="font-mono text-xs font-bold tracking-[0.18em]">
              SEALED
            </span>
          </span>
        </span>
      </span>

      {/* Card-sized, this strip lands underneath the tier ribbon the card
          overlays in the same corner, so it only appears at full size. */}
      {!compact && (
        <span className="absolute inset-x-0 top-0 flex items-center gap-2 px-4 pt-3">
          <span className="animate-pulse-soft size-1.5 rounded-full bg-dandelion-300" />
          <span className="font-mono text-xs tracking-[0.24em] text-sakura-200 uppercase">
            not for public distribution
          </span>
        </span>
      )}

      {reason && !compact && (
        <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink-900/85 to-transparent px-5 pt-10 pb-4">
          <span className="block max-w-[46ch] text-sm leading-relaxed text-sakura-100">
            {reason}
          </span>
        </span>
      )}
    </div>
  );
}

// ── art resolution ──────────────────────────────────────────────────────

type Art =
  | { kind: "shot" | "diagram"; src: string; alt: string }
  | { kind: "sealed"; reason?: string }
  | { kind: "crest" };

/**
 * What goes in the artwork slot, in order of preference: a screenshot, then a
 * diagram preview, then the sealed plate, then the generated crest.
 * `full` picks the large source instead of the grid-sized one.
 */
export function resolveArt(project: Project, full = false): Art {
  const shot = project.shots?.[0];
  if (shot) {
    return {
      kind: "shot",
      src: full ? shot.src : (shot.thumb ?? shot.src),
      alt: shot.alt,
    };
  }
  const diagram = project.diagram;
  if (diagram?.sealed) {
    return { kind: "sealed", reason: diagram.sealedReason };
  }
  if (diagram) {
    return {
      kind: "diagram",
      src: full ? diagram.raster : (diagram.preview ?? diagram.raster),
      alt: diagram.alt,
    };
  }
  return { kind: "crest" };
}

/**
 * Fills its (positioned) parent with whichever plate the project earns.
 *
 * A failed load falls through to the crest rather than leaving a broken frame —
 * the media is generated by a script, and a script can always miss a file.
 */
export function ProjectArt({
  project,
  full = false,
  eager = false,
  compact = false,
  /** Card art is decorative — the title says the same thing, louder. */
  described = false,
  fit = "cover",
  className = "",
}: {
  project: Project;
  full?: boolean;
  eager?: boolean;
  compact?: boolean;
  described?: boolean;
  fit?: "cover" | "contain";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const art = resolveArt(project, full);

  if (art.kind === "sealed") {
    return <SealedPlate reason={art.reason} compact={compact} />;
  }
  if (art.kind === "crest" || failed) {
    return <CrestPlate project={project} compact={compact} />;
  }

  const isDiagram = art.kind === "diagram";

  return (
    <>
      {isDiagram && (
        <span
          aria-hidden
          className="blueprint-paper absolute inset-0 bg-white"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, no loader */}
      <img
        src={art.src}
        alt={described ? art.alt : ""}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
        className={`absolute inset-0 h-full w-full ${
          fit === "contain" ? "object-contain p-3" : "object-cover"
        } ${className}`}
      />
    </>
  );
}
