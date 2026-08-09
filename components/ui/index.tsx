import type { CSSProperties, ReactNode } from "react";

import { Reveal, SplitReveal } from "@/components/motion";

/**
 * The shared furniture. Everything on the site is assembled from these, which
 * is what keeps five very different pages reading as one place.
 */

export function PageShell({
  children,
  className = "",
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  /** Projects and Stack need the extra breathing room. */
  wide?: boolean;
}) {
  return (
    <main
      className={`relative mx-auto w-full px-6 pt-32 pb-8 sm:px-10 sm:pt-40 ${
        wide ? "max-w-[1440px]" : "max-w-[1180px]"
      } ${className}`}
    >
      {children}
    </main>
  );
}

/** The little all-caps label that sits above every heading on the site. */
export function Kicker({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-2 font-display text-xs font-bold tracking-[0.34em] text-sakura-500 uppercase ${className}`}
    >
      <span aria-hidden className="text-sakura-400">
        ✿
      </span>
      {children}
    </p>
  );
}

export function PageHeader({
  kicker,
  title,
  titleJa,
  lead,
  aside,
}: {
  kicker: string;
  title: string;
  titleJa?: string;
  lead?: string;
  /** Optional art that sits beside the heading on wide screens. */
  aside?: ReactNode;
}) {
  return (
    <header className="relative">
      <div
        className={
          aside
            ? "flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
            : ""
        }
      >
        <div className="min-w-0">
          <Reveal y={14}>
            <Kicker>{kicker}</Kicker>
          </Reveal>
          <h1 className="text-gradient mt-3 font-display text-[clamp(2.4rem,6.4vw,4.4rem)] leading-[1.02] font-extrabold tracking-[-0.025em]">
            <SplitReveal text={title} />
          </h1>
          {titleJa && (
            <Reveal delay={0.18} y={12}>
              <p lang="ja" className="mt-2 font-jp text-xl text-sakura-600">
                {titleJa}
              </p>
            </Reveal>
          )}
          {lead && (
            <Reveal delay={0.24}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-500">
                {lead}
              </p>
            </Reveal>
          )}
        </div>
        {aside && (
          <Reveal delay={0.3} className="shrink-0">
            {aside}
          </Reveal>
        )}
      </div>
      <Reveal delay={0.3} y={0}>
        <div className="rule-petal mt-9 h-1 w-full rounded-full opacity-70" />
      </Reveal>
    </header>
  );
}

export function Card({
  children,
  className = "",
  style,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "article" | "li";
}) {
  return (
    <As
      className={`glass rounded-blob p-6 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-7 ${className}`}
      style={style}
    >
      {children}
    </As>
  );
}

export function Chip({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <li
      className={`rounded-full border border-sakura-200/80 bg-white/70 px-3 py-1.5 text-[0.8rem] font-semibold text-ink-700 transition-colors duration-200 hover:border-sakura-400 hover:bg-sakura-100 hover:text-sakura-800 ${className}`}
    >
      {children}
    </li>
  );
}

/** Non-list variant of Chip, for tags inside a paragraph flow. */
export function Tag({
  children,
  tone = "sakura",
}: {
  children: ReactNode;
  tone?: "sakura" | "lilac" | "dandelion" | "ink";
}) {
  const tones = {
    sakura: "bg-sakura-100 text-sakura-700 border-sakura-200/80",
    lilac: "bg-lilac-200/50 text-lilac-500 border-lilac-300/70",
    dandelion: "bg-dandelion-100 text-[#9a6b14] border-dandelion-300/80",
    ink: "bg-ink-900/5 text-ink-700 border-ink-300/40",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  emoji,
  children,
  note,
  id,
}: {
  emoji?: string;
  children: ReactNode;
  note?: string;
  id?: string;
}) {
  return (
    <div className="mb-6">
      <h2
        id={id}
        className="flex items-center gap-2.5 font-display text-[clamp(1.5rem,3.2vw,2.1rem)] font-extrabold text-sakura-800"
      >
        {emoji && (
          <span aria-hidden className="text-[0.85em]">
            {emoji}
          </span>
        )}
        {children}
      </h2>
      {note && (
        <p className="mt-2 max-w-2xl text-sm text-ink-500 italic">{note}</p>
      )}
    </div>
  );
}

/** A big number with a label under it. Used across Home and About. */
export function StatTile({
  value,
  label,
  note,
  className = "",
}: {
  value: ReactNode;
  label: string;
  note?: string;
  className?: string;
}) {
  return (
    <div
      className={`glass rounded-[1.5rem] px-5 py-6 text-center ${className}`}
    >
      <p className="text-gradient font-display text-[clamp(2rem,5vw,3rem)] leading-none font-extrabold">
        {value}
      </p>
      <p className="mt-2.5 font-display text-sm font-bold text-ink-700">
        {label}
      </p>
      {note && <p className="mt-1 text-xs text-ink-300">{note}</p>}
    </div>
  );
}

/** A decorative horizontal rule with a petal at its centre. */
export function PetalRule({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`relative flex items-center justify-center py-2 ${className}`}
    >
      <div className="rule-petal h-px w-full rounded-full opacity-60" />
      <span className="absolute grid size-7 place-items-center rounded-full border border-sakura-200 bg-cream text-sakura-400">
        ✿
      </span>
    </div>
  );
}

/** Small floating sparkles. Decorative, CSS-only, cheap. */
export function Sparkles({
  count = 8,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {Array.from({ length: count }, (_, i) => {
        // Deterministic scatter — a random one would differ between the
        // server render and hydration.
        const x = ((i * 37) % 100) + (i % 3);
        const y = ((i * 61) % 100) + (i % 5);
        const size = 6 + ((i * 13) % 9);
        return (
          <span
            key={i}
            className="sparkle absolute text-sakura-400"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              fontSize: size,
              animationDelay: `${(i * 0.43) % 3.2}s`,
            }}
          >
            ✦
          </span>
        );
      })}
    </span>
  );
}
