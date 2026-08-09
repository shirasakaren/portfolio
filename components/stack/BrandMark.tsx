import type { CSSProperties } from "react";

import { brandIcon } from "@/lib/stack-icons";

/**
 * A single brand mark, tinted into the page.
 *
 * The generated icon set is bare geometry, so every mark renders with
 * `fill="currentColor"` and inherits whatever the tile decides: the site's
 * pink at rest, the brand's own colour when the tile is hovered or matched.
 *
 * Five referenced slugs have no mark in `simple-icons`, and forty-odd skills
 * are things nobody ever drew a logo for ("A+B redundant power"). Those get a
 * monogram tile that was designed on purpose rather than a broken image.
 */

export function BrandMark({
  slug,
  name,
  className = "size-6",
}: {
  slug?: string;
  name: string;
  className?: string;
}) {
  const icon = brandIcon(slug);

  if (!icon) return <Monogram name={name} className={className} />;

  return (
    <svg
      viewBox={icon.box}
      className={`stack-mark ${className}`}
      fill="currentColor"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      {icon.paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fillRule={p.evenOdd ? "evenodd" : undefined}
          clipRule={p.evenOdd ? "evenodd" : undefined}
        />
      ))}
    </svg>
  );
}

/**
 * The fallback. Initials in the display face over a soft gradient, with the
 * gradient picked deterministically from the name — so "Rack & stack" and
 * "HVAC & thermal" are visibly different objects rather than two grey boxes.
 */
function Monogram({ name, className }: { name: string; className: string }) {
  const words = name.split(/[\s/·+&-]+/u).filter(Boolean);
  const initials =
    words.length > 1
      ? `${words[0][0]}${words[1][0]}`
      : name.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 2);

  const ramp = MONOGRAM_RAMPS[hash(name) % MONOGRAM_RAMPS.length];

  return (
    <span
      aria-hidden="true"
      className={`stack-mark grid place-items-center rounded-[0.5rem] font-display text-xs font-extrabold ${className}`}
      style={
        {
          backgroundImage: `linear-gradient(135deg, ${ramp[0]}, ${ramp[1]})`,
          color: ramp[2],
          // The glyphs are tiny; the display face needs the extra grip.
          letterSpacing: "-0.02em",
        } as CSSProperties
      }
    >
      {initials.toUpperCase()}
    </span>
  );
}

/** Palette-safe gradients, so a monogram never fights the pink. */
const MONOGRAM_RAMPS: [string, string, string][] = [
  ["#ffe9f1", "#ffd3e3", "#a32552"],
  ["#ecd9ff", "#dcb9ff", "#7a3f92"],
  ["#fff6dd", "#ffd98e", "#8a5a14"],
  ["#ffd3e3", "#dcb9ff", "#6d1738"],
  ["#fff7fa", "#ffb7c5", "#a32552"],
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/* ── brand colour ────────────────────────────────────────────────────── */

const tints = new Map<string, string>();

function luminance(r: number, g: number, b: number): number {
  const f = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/**
 * The brand colour, dragged down until it can actually be seen on cream.
 *
 * Sixteen of the 142 marks are brighter than the page (Unity is literally
 * white, HashiCorp Vault is highlighter yellow). Shipping those verbatim would
 * make a match *less* legible than a miss, so the hue is kept and the value is
 * walked down until it clears the background. Cached — this runs per tile.
 */
export function brandTint(slug: string | undefined): string | undefined {
  if (!slug) return undefined;
  const cached = tints.get(slug);
  if (cached) return cached;

  const icon = brandIcon(slug);
  if (!icon) return undefined;

  const n = parseInt(icon.hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;

  for (let i = 0; i < 24 && luminance(r, g, b) > 0.34; i++) {
    r = Math.round(r * 0.88);
    g = Math.round(g * 0.88);
    b = Math.round(b * 0.88);
  }

  const hex = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  tints.set(slug, hex);
  return hex;
}

/** Marks worth putting on the marquee, deduplicated and biggest names first. */
export function marqueeSlugs(
  groups: { items: { icon?: string; level: number }[] }[],
  limit: number,
): string[] {
  const seen = new Set<string>();
  const byLevel: string[][] = [[], [], []];

  for (const group of groups) {
    for (const item of group.items) {
      if (!item.icon || seen.has(item.icon)) continue;
      if (!brandIcon(item.icon)) continue; // monograms don't belong on a logo wall
      seen.add(item.icon);
      byLevel[3 - item.level].push(item.icon);
    }
  }

  return [...byLevel[0], ...byLevel[1], ...byLevel[2]].slice(0, limit);
}
