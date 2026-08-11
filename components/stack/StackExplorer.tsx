"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ReactionClip } from "@/components/visual/ReactionClip";
import {
  rolePresets,
  skillCount,
  stack,
  type Skill,
  type StackGroup,
} from "@/lib/content";

import { LevelLegend } from "./LevelMeter";
import { LogoWall } from "./LogoWall";
import { SkillTile } from "./SkillTile";
import "./stack.css";

/**
 * The recruiter's half of the site.
 *
 * The brief was blunt: a recruiter has to be able to answer "does she know X?"
 * faster here than by scrolling a CV. So the whole page is one live filter over
 * 219 skills, matching the tool's own name *and* the words a job ad would use
 * for it — type "EKS" and AWS lights up, with a chip explaining why.
 *
 * Filtering dims rather than removes — a match's neighbours stay visible for
 * context, they just stop being the thing the reader has to scroll past. A
 * match itself moves to the front of its category, and any category holding a
 * match moves ahead of the ones that don't, so the answer to "does she know X?"
 * is always waiting at the top of the page instead of buried wherever that
 * skill happens to live in the curated order. Nothing reorders while the query
 * is empty — the default browsing order is untouched.
 */

type Match = { hit: boolean; alias?: string };

const NO_MATCH: Match = { hit: false };
const IS_MATCH: Match = { hit: true };

/** Split a query into independent terms — commas let a preset load a whole list. */
function terms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[,\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

const ESCAPE = /[.*+?^${}()|[\]\\]/g;

/**
 * Terms match at a word boundary, never mid-word.
 *
 * A plain `includes` looks fine until the DevOps preset loads the term "Go" and
 * lights up "golden images", "MongoDB" and "Django" — which on a page a
 * recruiter is using to check a claim is not a cosmetic bug, it is a false
 * claim. So:
 *
 *   • a preset term must match a whole token: "Go" hits Go, never Golden.
 *   • typed text matches a token *prefix*, because someone typing "kube"
 *     is mid-word by definition and expects Kubernetes.
 */
function matcher(term: string, whole: boolean): RegExp {
  const t = term.replace(ESCAPE, "\\$&");
  const start = "(?:^|[^a-z0-9])";
  return new RegExp(whole ? `${start}${t}(?:[^a-z0-9]|$)` : `${start}${t}`);
}

function matchSkill(
  skill: Skill,
  group: StackGroup,
  patterns: RegExp[],
): Match {
  if (!patterns.length) return NO_MATCH;

  const name = skill.name.toLowerCase();
  for (const re of patterns) {
    if (re.test(name)) return IS_MATCH;
  }
  for (const re of patterns) {
    const alias = skill.aka?.find((a) => re.test(a.toLowerCase()));
    if (alias) return { hit: true, alias };
  }
  // Last resort: the category itself. Searching "security" should light up the
  // security section rather than returning four tools that happen to be named
  // after it.
  const title = group.title.toLowerCase();
  for (const re of patterns) {
    if (re.test(title)) return IS_MATCH;
  }
  return NO_MATCH;
}

/** Grouped plain text — the shape that survives a paste into an ATS. */
function skillsAsText(): string {
  return stack
    .map(
      (group) =>
        `${group.title}\n${group.items.map((s) => `  - ${s.name}`).join("\n")}`,
    )
    .join("\n\n");
}

export function StackExplorer() {
  const [query, setQuery] = useState("");
  const [preset, setPreset] = useState<string | null>(null);
  const [active, setActive] = useState<string>(stack[0]!.id);
  const inputRef = useRef<HTMLInputElement>(null);

  const queryTerms = useMemo(() => terms(query), [query]);
  const filtering = queryTerms.length > 0;

  // A preset loads exact tool names, so it matches whole tokens; anything typed
  // by hand is treated as a prefix.
  const patterns = useMemo(
    () => queryTerms.map((t) => matcher(t, preset !== null)),
    [queryTerms, preset],
  );

  /**
   * One pass over the whole dataset per keystroke. 219 string comparisons is
   * nothing — it is re-rendering 219 components that would cost, and `SkillTile`
   * is memoised so only the tiles whose match state actually flipped re-render.
   */
  const results = useMemo(() => {
    const byGroup = new Map<string, Map<string, Match>>();
    const hitsByGroup = new Map<string, number>();
    let total = 0;
    for (const group of stack) {
      const inner = new Map<string, Match>();
      let hits = 0;
      for (const skill of group.items) {
        const m = matchSkill(skill, group, patterns);
        inner.set(skill.name, m);
        if (m.hit) {
          hits++;
          total++;
        }
      }
      byGroup.set(group.id, inner);
      hitsByGroup.set(group.id, hits);
    }
    return { byGroup, hitsByGroup, total };
  }, [patterns]);

  /**
   * Categories holding a match float to the top, ranked by how many matches
   * they hold; categories with none sink to the bottom in their original
   * order. Stable sort keeps that bottom group untouched relative to itself,
   * so browsing after clearing the search snaps straight back to normal.
   */
  const orderedGroups = useMemo(() => {
    if (!filtering) return stack;
    return [...stack].sort(
      (a, b) =>
        (results.hitsByGroup.get(b.id) ?? 0) -
        (results.hitsByGroup.get(a.id) ?? 0),
    );
  }, [filtering, results]);

  const applyPreset = useCallback(
    (id: string) => {
      if (preset === id) {
        setPreset(null);
        setQuery("");
        return;
      }
      const role = rolePresets.find((r) => r.id === id);
      if (!role) return;
      setPreset(id);
      setQuery(role.terms.join(", "));
    },
    [preset],
  );

  const onType = (value: string) => {
    setQuery(value);
    setPreset(null);
  };

  const clear = () => {
    setQuery("");
    setPreset(null);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* ── the wall of logos ─────────────────────────────────────── */}
      <LogoWall />

      {/* ── the console ───────────────────────────────────────────── */}
      <section
        aria-label="Search the stack"
        className="rounded-blob sticky top-[4.6rem] z-30 mt-10 border border-sakura-200/70 bg-cream/80 p-4 backdrop-blur-xl sm:p-5"
      >
        <div className="flex flex-col gap-4">
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-lg text-sakura-400"
            >
              ⌕
            </span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => onType(e.target.value)}
              placeholder="kubernetes, terraform, EKS, incident response…"
              aria-label="Filter skills"
              className="w-full rounded-full border border-sakura-200 bg-white/85 py-3.5 pr-28 pl-11 font-medium text-ink-900 shadow-[inset_0_1px_3px_rgba(214,51,108,0.06)] placeholder:text-ink-300 focus:border-sakura-400 focus:outline-none"
            />
            <span className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
              {filtering && (
                <button
                  type="button"
                  onClick={clear}
                  className="rounded-full bg-sakura-100 px-3 py-1.5 font-display text-xs font-bold text-sakura-700 transition-colors hover:bg-sakura-200"
                >
                  clear
                </button>
              )}
              <span
                aria-live="polite"
                className="rounded-full bg-sakura-600 px-3 py-1.5 font-mono text-xs font-bold text-white tabular-nums"
              >
                {filtering ? results.total : skillCount}
              </span>
            </span>
          </div>

          {/* Presets and legend share the second row: the search field needs
              the full width for its placeholder, which is doing the work of
              explaining that aliases are searchable at all. */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-[0.68rem] font-bold tracking-[0.22em] text-ink-300 uppercase">
                hiring for
              </span>
              {rolePresets.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => applyPreset(role.id)}
                  aria-pressed={preset === role.id}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-display text-xs font-bold transition-all duration-300 ${
                    preset === role.id
                      ? "-translate-y-0.5 border-transparent bg-linear-to-r from-sakura-600 to-lilac-400 text-white shadow-[0_8px_20px_-8px_rgba(214,51,108,0.8)]"
                      : "border-sakura-200 bg-white/70 text-ink-700 hover:border-sakura-400 hover:text-sakura-700"
                  }`}
                >
                  <span aria-hidden>{role.emoji}</span>
                  {role.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <LevelLegend />
              <CopyAll />
            </div>
          </div>
        </div>
      </section>

      {/* ── category nav ──────────────────────────────────────────── */}
      <nav aria-label="Categories" className="mt-8">
        <ul className="flex flex-wrap gap-1.5">
          {orderedGroups.map((group) => {
            const hits = filtering
              ? group.items.filter(
                  (s) => results.byGroup.get(group.id)?.get(s.name)?.hit,
                ).length
              : 0;
            return (
              <li key={group.id}>
                <a
                  href={`#${group.id}`}
                  aria-current={active === group.id ? "true" : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                    active === group.id
                      ? "border-sakura-400 bg-sakura-100 text-sakura-800"
                      : "border-sakura-200/70 bg-white/60 text-ink-500 hover:border-sakura-300 hover:text-sakura-700"
                  } ${filtering && hits === 0 ? "opacity-40" : ""}`}
                >
                  <span aria-hidden>{group.emoji}</span>
                  {group.title}
                  {filtering && (
                    <span className="font-mono text-[0.65rem] font-bold text-sakura-600 tabular-nums">
                      {hits}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── nothing found ─────────────────────────────────────────── */}
      {filtering && results.total === 0 && (
        <div className="rounded-blob mt-10 flex flex-col items-center gap-4 border border-sakura-200/70 bg-cream/70 px-6 py-14 text-center">
          <span aria-hidden className="stack-wilt text-5xl">
            🥀
          </span>
          <p className="font-display text-xl font-extrabold text-sakura-800">
            Nothing for &ldquo;{query}&rdquo;.
          </p>
          <p className="max-w-sm text-sm text-ink-500">
            Which either means I have not touched it, or you have found the one
            alias I forgot to write down. Ask me — I am honest about both.
          </p>
          <ReactionClip
            name="shy"
            size="w-28"
            rounded="rounded-[1.3rem]"
            className="mt-2"
          />
        </div>
      )}

      {/* ── the matrix ────────────────────────────────────────────── */}
      <div className="mt-10 space-y-14">
        {orderedGroups.map((group) => (
          <StackSection
            key={group.id}
            group={group}
            matches={results.byGroup.get(group.id)}
            filtering={filtering}
            onActive={setActive}
          />
        ))}
      </div>
    </>
  );
}

/**
 * One category.
 *
 * The observer here does double duty: it flips `data-shown` so the tiles deal
 * themselves in on a pure-CSS delay, and it reports which section is on screen
 * for the nav above. Twelve observers for 219 tiles.
 */
function StackSection({
  group,
  matches,
  filtering,
  onActive,
}: {
  group: StackGroup;
  matches?: Map<string, Match>;
  filtering: boolean;
  onActive: (id: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  /**
   * Two observers, because the two jobs want opposite margins.
   *
   * Revealing has to happen *early* — a section that only deals its tiles in
   * once its middle crosses the viewport leaves a heading over empty space for
   * anyone scrolling quickly, which on a page whose entire job is "find the
   * skill fast" is the worst possible failure. So the reveal fires 400px ahead
   * of the section arriving, and the timer is a backstop in case the observer
   * never fires at all: an empty wall is not a state this page may end up in.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          reveal.disconnect();
        }
      },
      { rootMargin: "400px 0px 400px 0px", threshold: 0 },
    );
    reveal.observe(el);

    const backstop = setTimeout(() => setShown(true), 2500);

    return () => {
      reveal.disconnect();
      clearTimeout(backstop);
    };
  }, []);

  /** The nav highlight wants the opposite: only whatever is actually centred. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spy = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onActive(group.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: 0 },
    );
    spy.observe(el);
    return () => spy.disconnect();
  }, [group.id, onActive]);

  const hits = filtering
    ? group.items.filter((s) => matches?.get(s.name)?.hit).length
    : group.items.length;

  /**
   * A match leads its category instead of waiting in place for the reader to
   * scroll to it. `sort` is stable, so within "matched" and "unmatched" each
   * keeps the curated order — only the matched/unmatched boundary moves.
   */
  const orderedItems = useMemo(() => {
    if (!filtering) return group.items;
    return [...group.items].sort((a, b) => {
      const ah = matches?.get(a.name)?.hit ? 0 : 1;
      const bh = matches?.get(b.name)?.hit ? 0 : 1;
      return ah - bh;
    });
  }, [group.items, matches, filtering]);

  return (
    <section
      ref={ref}
      id={group.id}
      data-shown={shown ? "true" : undefined}
      className="stack-section scroll-mt-[13rem]"
      aria-labelledby={`${group.id}-title`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2
          id={`${group.id}-title`}
          className="flex items-center gap-2.5 font-display text-2xl font-extrabold text-sakura-800"
        >
          <span aria-hidden>{group.emoji}</span>
          {group.title}
        </h2>
        <p className="font-mono text-xs text-ink-300 tabular-nums">
          {filtering ? `${hits} / ${group.items.length}` : group.items.length}
        </p>
      </div>
      <p className="mt-1.5 max-w-2xl text-sm text-ink-500 italic">
        {group.note}
      </p>

      <ul className="stack-grid mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {orderedItems.map((skill, i) => {
          const m = matches?.get(skill.name);
          return (
            <SkillTile
              key={skill.name}
              skill={skill}
              index={i}
              dim={filtering && !m?.hit}
              hit={Boolean(filtering && m?.hit)}
              alias={filtering ? m?.alias : undefined}
            />
          );
        })}
      </ul>
    </section>
  );
}

/** Copies the whole grouped list, and throws petals when it works. */
function CopyAll() {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const [burst, setBurst] = useState(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(skillsAsText());
      setState("done");
      setBurst((n) => n + 1);
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2200);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="relative inline-flex shrink-0 items-center gap-2 rounded-full border border-sakura-300 bg-white/75 px-4 py-2.5 font-display text-xs font-bold text-sakura-700 transition-colors hover:bg-sakura-100"
    >
      <span aria-hidden>{state === "done" ? "✓" : "⧉"}</span>
      {state === "done"
        ? "copied"
        : state === "failed"
          ? "copy failed"
          : "copy all skills"}

      {state === "done" && (
        <span aria-hidden className="pointer-events-none absolute inset-0">
          {Array.from({ length: 7 }, (_, i) => (
            <span
              key={`${burst}-${i}`}
              className="stack-petal absolute top-1/2 left-1/2 text-sakura-400"
              style={
                {
                  "--bx": `${(i - 3) * 16}px`,
                  "--by": `${-26 - (i % 3) * 10}px`,
                  animationDelay: `${i * 40}ms`,
                } as React.CSSProperties
              }
            >
              ✿
            </span>
          ))}
        </span>
      )}
    </button>
  );
}
