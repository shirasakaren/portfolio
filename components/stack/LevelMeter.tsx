import { levelLabel, type Level } from "@/lib/content";

/**
 * How well she knows it, readable in a quarter of a second.
 *
 * Three rising bars: filled ones are solid, empty ones are hollow outlines and
 * shorter — so the reading survives greyscale, a colourblind viewer and a
 * printed CV. The label rides along as text for anyone who can't see it at all.
 */

const HEIGHTS = ["h-[6px]", "h-[9px]", "h-[13px]"] as const;

export function LevelMeter({
  level,
  className = "",
}: {
  level: Level;
  className?: string;
}) {
  return (
    <span
      className={`flex items-end gap-[3px] ${className}`}
      title={levelLabel[level]}
      aria-hidden="true"
    >
      {[1, 2, 3].map((step) => {
        const on = step <= level;
        return (
          <span
            key={step}
            className={`${HEIGHTS[step - 1]} w-[4px] rounded-full transition-colors duration-300 ${
              on
                ? "bg-linear-to-t from-sakura-600 to-sakura-400"
                : "border border-ink-300/45 bg-transparent"
            }`}
          />
        );
      })}
    </span>
  );
}

/** What the three bars mean, in her words. Sits above the wall, once. */
export function LevelLegend({ className = "" }: { className?: string }) {
  const rows: { level: Level; gloss: string }[] = [
    { level: 3, gloss: "in my hands most weeks" },
    { level: 2, gloss: "shipped it, ran it, been paged for it" },
    { level: 1, gloss: "useful on day one, not day zero" },
  ];

  return (
    <dl
      className={`flex flex-wrap items-center gap-x-6 gap-y-2.5 ${className}`}
    >
      {rows.map(({ level, gloss }) => (
        <div key={level} className="flex items-center gap-2.5">
          <dt className="flex items-center gap-2.5 font-display text-xs font-bold text-ink-900">
            <LevelMeter level={level} />
            {levelLabel[level]}
          </dt>
          <dd className="text-xs text-ink-500 italic">{gloss}</dd>
        </div>
      ))}
    </dl>
  );
}
