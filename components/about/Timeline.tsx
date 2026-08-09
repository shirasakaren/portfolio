"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

import { Reveal } from "@/components/motion";
import { experience, type Company, type Role } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/motion";

/**
 * The career, as a rail you scroll down.
 *
 * The rail's fill is driven by the container's own scroll progress rather than
 * by each card reporting in, so there is exactly one scroll subscription for
 * the whole timeline no matter how many roles it holds. Everything else — the
 * dots, the cards — is a plain `whileInView`, which the browser schedules off
 * the main thread.
 */

const KIND_SIGIL: Record<Company["kind"], string> = {
  platform: "🧱",
  devops: "♾️",
  sre: "📟",
  datacenter: "🏢",
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function label(iso: string): string {
  const [y, m] = iso.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

function span(role: Role): string {
  const end = role.end ? label(role.end) : "Present";
  const years = Math.floor(role.months / 12);
  const months = role.months % 12;
  const duration = [
    years ? `${years} yr${years > 1 ? "s" : ""}` : "",
    months ? `${months} mo` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `${label(role.start)} — ${end} · ${duration}`;
}

export function Timeline() {
  const railRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: railRef,
    // Start filling once the rail's top reaches three-quarters down the
    // viewport, finish when its bottom passes the halfway line — so the fill
    // sits just ahead of whatever you are actually reading.
    offset: ["start 0.75", "end 0.55"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });
  const scaleY = useTransform(fill, (v) => (reduced ? 1 : v));

  return (
    <div ref={railRef} className="relative">
      {/* The rail. Sits at the left edge on mobile, indented on desktop. */}
      <div
        aria-hidden
        className="absolute top-2 bottom-2 left-[15px] w-[3px] rounded-full bg-sakura-200/70 sm:left-[19px]"
      >
        <motion.div
          className="h-full w-full origin-top rounded-full bg-linear-to-b from-sakura-500 via-sakura-600 to-lilac-400"
          style={{ scaleY }}
        />
      </div>

      <ol className="space-y-12 sm:space-y-16">
        {experience.map((company, i) => (
          <li key={company.id} className="relative pl-12 sm:pl-16">
            {/* Node */}
            <Reveal y={0} amount={0.4} className="absolute top-0 left-0">
              <span
                aria-hidden
                className={`relative grid size-8 place-items-center rounded-full border-2 border-sakura-300 bg-cream text-sm shadow-[0_6px_18px_-8px_rgba(214,51,108,0.7)] sm:size-10 sm:text-base ${
                  company.roles.some((r) => r.end === null)
                    ? "ring-4 ring-sakura-300/40"
                    : ""
                }`}
              >
                {KIND_SIGIL[company.kind]}
                {company.roles.some((r) => r.end === null) && (
                  <span className="animate-pulse-soft absolute -inset-1 rounded-full border border-sakura-400/70" />
                )}
              </span>
            </Reveal>

            <Reveal delay={0.05} y={26}>
              <div className="glass rounded-blob overflow-hidden">
                <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-sakura-200/60 bg-linear-to-r from-sakura-100/70 to-transparent px-5 py-4 sm:px-7">
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-extrabold text-sakura-800 sm:text-2xl">
                      {company.name}
                    </h3>
                    {company.legalName && (
                      <p className="text-xs text-ink-300">
                        {company.legalName}
                      </p>
                    )}
                  </div>
                  <p className="font-display text-xs font-bold tracking-wide text-ink-500">
                    {company.location}
                  </p>
                </header>

                <div className="divide-y divide-sakura-200/50">
                  {company.roles.map((role) => (
                    <article key={role.title} className="px-5 py-5 sm:px-7 sm:py-6">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h4 className="font-display text-base font-extrabold text-ink-900 sm:text-lg">
                          {role.title}
                        </h4>
                        <p className="font-mono text-[0.7rem] tracking-tight text-sakura-600">
                          {span(role)}
                        </p>
                      </div>

                      <p className="mt-2.5 leading-relaxed text-ink-700">
                        {role.summary}
                      </p>

                      <ul className="mt-4 space-y-1.5">
                        {role.highlights.map((h) => (
                          <li
                            key={h}
                            className="flex gap-2.5 text-sm leading-relaxed text-ink-500"
                          >
                            <span
                              aria-hidden
                              className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-sakura-400"
                            />
                            {h}
                          </li>
                        ))}
                      </ul>

                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {role.stack.map((s) => (
                          <li
                            key={s}
                            className="rounded-full bg-white/70 px-2.5 py-1 text-[0.68rem] font-semibold text-ink-500 ring-1 ring-sakura-200/70 ring-inset"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Tenure badge for the multi-role stints. */}
            {company.totalMonths && (
              <Reveal delay={0.12} y={8}>
                <p className="mt-2 pl-1 font-display text-xs font-bold text-ink-300">
                  {Math.floor(company.totalMonths / 12)
                    ? `${Math.floor(company.totalMonths / 12)} yr `
                    : ""}
                  {company.totalMonths % 12 ? `${company.totalMonths % 12} mo ` : ""}
                  in total, across {company.roles.length} roles
                </p>
              </Reveal>
            )}

            {i === experience.length - 1 && (
              <p className="mt-6 pl-1 font-jp text-sm text-sakura-500">
                ここから始まりました 〜 <span className="font-sans">it started here</span>
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
