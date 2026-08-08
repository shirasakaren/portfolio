import type { ReactNode } from "react";

export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={`relative mx-auto w-full max-w-[1180px] px-6 pt-32 pb-6 sm:px-10 sm:pt-40 ${className}`}
    >
      {children}
    </main>
  );
}

export function PageHeader({
  kicker,
  title,
  titleJa,
  lead,
}: {
  kicker: string;
  title: string;
  titleJa?: string;
  lead?: string;
}) {
  return (
    <header className="animate-rise-in relative">
      <p className="font-display text-xs font-bold tracking-[0.34em] text-sakura-500 uppercase">
        {kicker}
      </p>
      <h1 className="text-gradient mt-3 font-display text-[clamp(2.4rem,6vw,4rem)] leading-[1.05] font-extrabold tracking-[-0.02em]">
        {title}
      </h1>
      {titleJa && (
        <p lang="ja" className="mt-2 font-jp text-xl text-sakura-600">
          {titleJa}
        </p>
      )}
      {lead && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-500">
          {lead}
        </p>
      )}
      <div className="rule-petal mt-9 h-1 w-full rounded-full opacity-70" />
    </header>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`card-soft rounded-blob p-6 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-7 ${className}`}
    >
      {children}
    </div>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-full border border-sakura-200/80 bg-white/70 px-3 py-1.5 text-[0.8rem] font-semibold text-ink-700 transition-colors duration-200 hover:border-sakura-400 hover:bg-sakura-100 hover:text-sakura-800">
      {children}
    </li>
  );
}

export function SectionTitle({
  emoji,
  children,
  note,
}: {
  emoji?: string;
  children: ReactNode;
  note?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="flex items-center gap-2.5 font-display text-2xl font-extrabold text-sakura-800">
        {emoji && (
          <span aria-hidden className="text-xl">
            {emoji}
          </span>
        )}
        {children}
      </h2>
      {note && <p className="mt-2 text-sm text-ink-500 italic">{note}</p>}
    </div>
  );
}

/** Soft out-of-focus petals drifting behind the content. Purely decorative. */
export function Petals() {
  const blobs = [
    { left: "6%", top: "12%", size: 220, delay: "0s", hue: "var(--color-sakura-200)" },
    { left: "82%", top: "22%", size: 300, delay: "-2.4s", hue: "var(--color-lilac-200)" },
    { left: "18%", top: "64%", size: 260, delay: "-4.1s", hue: "var(--color-dandelion-200)" },
    { left: "70%", top: "76%", size: 200, delay: "-1.2s", hue: "var(--color-sakura-100)" },
  ];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {blobs.map((b, i) => (
        <span
          key={i}
          className="animate-float absolute rounded-full blur-3xl"
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            background: b.hue,
            opacity: 0.5,
            animationDelay: b.delay,
          }}
        />
      ))}
    </div>
  );
}
