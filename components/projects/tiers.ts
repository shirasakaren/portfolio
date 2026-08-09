import type { Project, ProjectKind, Tier } from "@/lib/content";

/**
 * Rarity, as presentation.
 *
 * `tier` in the data is a grade, not a score — so the job here is to make it
 * legible in a single glance across a grid: legendary gets the prismatic foil
 * and the ring of light, epic gets a lilac frame and a static sheen, rare gets
 * nothing but good glass. Anything more elaborate on the lower tiers and the
 * rarest cards stop reading as rare.
 */

export type TierStyle = {
  label: string;
  /** Three pips, filled by rank. Read at card size where text is too small. */
  pips: number;
  /** Gradient ring: an outer padded element behind the card surface. */
  frame: string;
  /** Resting shadow, upgraded on hover by the card itself. */
  glow: string;
  /** The rarity ribbon on the artwork. */
  ribbon: string;
  /** Ring around the emoji sigil. */
  sigil: string;
  /** Prismatic sweep — legendary only. */
  foil: boolean;
  /** Static diagonal sheen — epic only. */
  sheen: boolean;
};

export const TIERS: Record<Tier, TierStyle> = {
  legendary: {
    label: "legendary",
    pips: 3,
    frame:
      "bg-linear-to-br from-sakura-400/90 via-lilac-300/80 to-dandelion-300/90",
    glow: "tier-glow",
    ribbon:
      "border-transparent bg-linear-to-r from-sakura-600 to-lilac-400 text-white shadow-[0_6px_18px_-8px_rgba(214,51,108,0.9)]",
    sigil:
      "bg-linear-to-br from-sakura-500 via-sakura-400 to-lilac-400 shadow-[0_10px_26px_-10px_rgba(214,51,108,0.85)]",
    foil: true,
    sheen: false,
  },
  epic: {
    label: "epic",
    pips: 2,
    frame: "bg-linear-to-br from-lilac-300/80 via-sakura-200/70 to-lilac-200/70",
    glow: "shadow-[0_14px_40px_-24px_rgba(161,85,185,0.75)]",
    ribbon: "border-lilac-300/80 bg-lilac-200/70 text-lilac-500",
    sigil: "bg-linear-to-br from-lilac-300 to-sakura-300",
    foil: false,
    sheen: true,
  },
  rare: {
    label: "rare",
    pips: 1,
    frame: "bg-sakura-200/70",
    glow: "shadow-[0_10px_30px_-22px_rgba(214,51,108,0.6)]",
    ribbon: "border-sakura-200 bg-sakura-100 text-sakura-700",
    sigil: "bg-linear-to-br from-sakura-200 to-sakura-100",
    foil: false,
    sheen: false,
  },
};

/** Matches the `Tag` tones in components/ui so status reads the same site-wide. */
export const STATUS: Record<
  Project["status"],
  { label: string; chip: string; dot: string }
> = {
  live: {
    label: "live",
    chip: "border-sakura-200/80 bg-sakura-100 text-sakura-700",
    dot: "bg-sakura-500",
  },
  shipped: {
    label: "shipped",
    chip: "border-lilac-300/70 bg-lilac-200/50 text-lilac-500",
    dot: "bg-lilac-400",
  },
  internal: {
    label: "internal",
    chip: "border-dandelion-300/80 bg-dandelion-100 text-[#9a6b14]",
    dot: "bg-dandelion-400",
  },
};

export const KIND_LABEL: Record<ProjectKind, string> = {
  product: "product",
  infrastructure: "infrastructure",
};

/** Short form for the card ribbon, where the long word doesn't fit. */
export const KIND_SHORT: Record<ProjectKind, string> = {
  product: "product",
  infrastructure: "infra",
};

export const LINK_LABEL: Record<Project["links"][number]["kind"], string> = {
  live: "visit",
  repo: "source",
  docs: "docs",
};

export const LINK_ICON: Record<Project["links"][number]["kind"], string> = {
  live: "↗",
  repo: "⌥",
  docs: "☰",
};
