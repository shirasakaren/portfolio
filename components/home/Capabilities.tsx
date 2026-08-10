"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

import { pillars, type ReactionName } from "@/lib/content";
import { ReactionClip } from "@/components/visual/ReactionClip";
import { EASE } from "@/components/motion";

/**
 * The four things Ren does, presented as editorial horizontal panels
 * below the walk video. Each card has a reaction clip on the left,
 * a context-appropriate SVG illustration on the far right beside the
 * index number, and generous breathing room.
 */

type Accent = {
  border: string;
  bg: string;
  text: string;
  glowRgba: string;
  reaction: ReactionName;
  /** Stroke / fill colour for the SVG illustration. */
  fg: string;
};

const ACCENTS: Record<string, Accent> = {
  cloud: {
    border: "border-l-sakura-400",
    bg: "bg-sakura-50/40",
    text: "text-sakura-600",
    glowRgba: "rgba(214,51,108,0.13)",
    reaction: "smug",
    fg: "#ff8fc7",
  },
  platform: {
    border: "border-l-lilac-400",
    bg: "bg-lilac-200/30",
    text: "text-lilac-500",
    glowRgba: "rgba(161,85,185,0.11)",
    reaction: "happyBounce",
    fg: "#c77dff",
  },
  security: {
    border: "border-l-dandelion-400",
    bg: "bg-dandelion-100/30",
    text: "text-[#9a6b14]",
    glowRgba: "rgba(247,194,92,0.16)",
    reaction: "sparkleEyes",
    fg: "#f7c25c",
  },
  reliability: {
    border: "border-l-emerald-400",
    bg: "bg-emerald-50/30",
    text: "text-emerald-600",
    glowRgba: "rgba(52,211,153,0.12)",
    reaction: "heartSkip",
    fg: "#34d399",
  },
};

// ── SVG Illustrations ────────────────────────────────────────────────────

/** A floating cloud above three server racks — for cloud foundations. */
function CloudIllustration({ color }: { color: string }) {
  return (
    <motion.svg viewBox="0 0 80 64" fill="none" className="h-16 w-20 shrink-0" aria-hidden>
      <motion.g
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="28" cy="22" r="14" fill={color} opacity="0.35" />
        <circle cx="46" cy="16" r="18" fill={color} opacity="0.35" />
        <circle cx="60" cy="24" r="12" fill={color} opacity="0.35" />
        <rect x="16" y="24" width="52" height="10" rx="5" fill={color} opacity="0.3" />
      </motion.g>
      <rect x="12" y="46" width="10" height="10" rx="2" fill={color} opacity="0.55" />
      <rect x="26" y="46" width="10" height="10" rx="2" fill={color} opacity="0.55" />
      <rect x="40" y="46" width="10" height="10" rx="2" fill={color} opacity="0.55" />
      <motion.rect
        x="54" y="46" width="10" height="10" rx="2" fill={color} opacity="0.55"
        animate={{ opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

/** Three interconnected nodes — a mini deployment topology. */
function PlatformIllustration({ color }: { color: string }) {
  return (
    <motion.svg viewBox="0 0 80 64" fill="none" className="h-16 w-20 shrink-0" aria-hidden>
      <line x1="12" y1="32" x2="40" y2="10" stroke={color} strokeWidth="1.5" opacity="0.45" />
      <line x1="40" y1="10" x2="68" y2="32" stroke={color} strokeWidth="1.5" opacity="0.45" />
      <line x1="40" y1="10" x2="40" y2="54" stroke={color} strokeWidth="1.5" opacity="0.45" />
      <circle cx="40" cy="10" r="8" fill={color} opacity="0.35" />
      <motion.circle
        cx="40" cy="10" r="5" fill={color} opacity="0.65"
        animate={{ scale: [1, 1.35, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="12" cy="32" r="5" fill={color} opacity="0.45" />
      <circle cx="68" cy="32" r="5" fill={color} opacity="0.45" />
      <circle cx="40" cy="54" r="4" fill={color} opacity="0.4" />
    </motion.svg>
  );
}

/** A shield with a subtle pulse — security posture. */
function SecurityIllustration({ color }: { color: string }) {
  return (
    <motion.svg viewBox="0 0 80 64" fill="none" className="h-16 w-20 shrink-0" aria-hidden>
      <motion.path
        d="M40 6L62 14V34C62 47 40 58 40 58C40 58 18 47 18 34V14L40 6Z"
        fill={color} opacity="0.25"
        animate={{ opacity: [0.25, 0.42, 0.25] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <path
        d="M40 6L62 14V34C62 47 40 58 40 58C40 58 18 47 18 34V14L40 6Z"
        stroke={color} strokeWidth="1.5" opacity="0.55" fill="none"
      />
      <motion.path
        d="M31 32L36.5 38L49 25"
        stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

/** A heartbeat line that draws itself — reliability & observability. */
function ReliabilityIllustration({ color }: { color: string }) {
  return (
    <motion.svg viewBox="0 0 80 64" fill="none" className="h-16 w-20 shrink-0" aria-hidden>
      <line x1="0" y1="20" x2="80" y2="20" stroke={color} strokeWidth="0.5" opacity="0.18" />
      <line x1="0" y1="36" x2="80" y2="36" stroke={color} strokeWidth="0.5" opacity="0.18" />
      <line x1="0" y1="52" x2="80" y2="52" stroke={color} strokeWidth="0.5" opacity="0.18" />
      <motion.polyline
        points="0,44 16,44 22,16 28,52 34,28 40,36 46,8 52,44 80,44"
        fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration: 1.6, delay: 0.2, ease: "easeInOut" }}
      />
      <motion.circle
        cx="76" cy="44" r="4" fill={color}
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

const ILLUSTRATIONS: Record<string, React.FC<{ color: string }>> = {
  cloud: CloudIllustration,
  platform: PlatformIllustration,
  security: SecurityIllustration,
  reliability: ReliabilityIllustration,
};

// ── Card ─────────────────────────────────────────────────────────────────

function CapabilityCard({
  pillar,
  index,
}: {
  pillar: (typeof pillars)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const accent = ACCENTS[pillar.id] ?? ACCENTS.cloud;
  const Illo = ILLUSTRATIONS[pillar.id] ?? CloudIllustration;

  return (
    <motion.div
      ref={ref}
      className={`
        group relative
        flex flex-col sm:flex-row sm:items-center
        gap-5 sm:gap-6
        rounded-2xl border-l-4 ${accent.border} ${accent.bg}
        px-6 py-6 sm:px-8 sm:py-7
        transition-[border-left-width,background-color] duration-500
        hover:border-l-[6px] hover:bg-white/80
      `}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: EASE }}
      whileHover={{
        boxShadow: `0 8px 32px -10px ${accent.glowRgba}`,
      }}
    >
      {/* Left: Ren's reaction clip */}
      <ReactionClip
        name={accent.reaction}
        size="w-16 sm:w-20"
        rounded="rounded-xl"
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`
            font-display text-[0.65rem] font-bold tracking-[0.22em] uppercase ${accent.text}
          `}
        >
          {pillar.short}
        </p>
        <h3 className="mt-1 font-display text-xl sm:text-2xl font-extrabold text-ink-900 tracking-[-0.01em]">
          {pillar.title}
        </h3>
        <p className="mt-2.5 max-w-2xl text-sm sm:text-base leading-relaxed text-ink-500">
          {pillar.body}
        </p>
      </div>

      {/* Right side: SVG illustration + index number */}
      <div className="hidden sm:flex sm:items-center sm:gap-2 shrink-0">
        <Illo color={accent.fg} />
        <span
          aria-hidden
          className="
            shrink-0 font-display text-5xl font-extrabold tracking-[-0.04em]
            text-ink-100/80
            transition-colors duration-500
            group-hover:text-ink-200
          "
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
    </motion.div>
  );
}

// ── Section ──────────────────────────────────────────────────────────────

export function Capabilities() {
  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {pillars.map((pillar, i) => (
        <CapabilityCard key={pillar.id} pillar={pillar} index={i} />
      ))}
    </div>
  );
}
