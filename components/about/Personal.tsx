"use client";

import { motion } from "motion/react";
import { useState } from "react";

import { Marquee, Reveal, Stagger, StaggerItem, TiltCard } from "@/components/motion";
import { ReactionClip } from "@/components/visual/ReactionClip";
import {
  favourites,
  languages,
  machines,
  neofetch,
  opinions,
  traits,
  type Favourite,
} from "@/lib/content";

/**
 * The half of the About page that has nothing to do with uptime.
 *
 * These sections are what turn a CV into a person, so they get the loudest
 * visual treatment on the site: tilting cards, a ticker of opinions, and Ren
 * herself reacting next to each of her own worst habits.
 */

const TONES: Record<
  Favourite["tone"],
  { wash: string; ring: string; text: string; glow: string }
> = {
  sakura: {
    wash: "from-sakura-100/90 via-white/60 to-sakura-200/50",
    ring: "ring-sakura-200/80",
    text: "text-sakura-700",
    glow: "rgba(255,143,199,0.55)",
  },
  lilac: {
    wash: "from-lilac-200/70 via-white/60 to-sakura-100/60",
    ring: "ring-lilac-300/70",
    text: "text-lilac-500",
    glow: "rgba(199,125,255,0.5)",
  },
  dandelion: {
    wash: "from-dandelion-100 via-white/70 to-sakura-100/50",
    ring: "ring-dandelion-300/80",
    text: "text-[#9a6b14]",
    glow: "rgba(247,194,92,0.55)",
  },
  matcha: {
    wash: "from-[#e8f3e0] via-white/70 to-sakura-100/50",
    ring: "ring-[#bcd9ab]/80",
    text: "text-[#4f7238]",
    glow: "rgba(150,196,120,0.5)",
  },
};

export function FavouritesGrid() {
  return (
    <Stagger
      as="ul"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      amount={0.1}
    >
      {favourites.map((fav) => {
        const tone = TONES[fav.tone];
        return (
          <StaggerItem as="li" key={fav.id} className="group">
            <TiltCard
              strength={7}
              glare={tone.glow}
              className={`h-full rounded-[1.6rem] bg-linear-to-br ${tone.wash} p-5 ring-1 ${tone.ring} ring-inset shadow-[0_14px_40px_-24px_rgba(214,51,108,0.55)] transition-shadow duration-500 group-hover:shadow-[0_22px_50px_-24px_rgba(214,51,108,0.7)]`}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  aria-hidden
                  className="text-4xl transition-transform duration-500 group-hover:scale-115 group-hover:-rotate-6"
                >
                  {fav.emoji}
                </span>
                <span
                  className={`font-display text-[0.6rem] font-bold tracking-[0.24em] uppercase ${tone.text}`}
                >
                  {fav.category}
                </span>
              </div>

              <h3 className="mt-4 font-display text-xl leading-tight font-extrabold text-ink-900">
                {fav.label}
              </h3>
              {fav.labelJa && (
                <p lang="ja" className={`font-jp text-sm ${tone.text}`}>
                  {fav.labelJa}
                </p>
              )}

              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                {fav.line}
              </p>

              {fav.runnersUp && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {fav.runnersUp.map((r) => (
                    <li
                      key={r}
                      className="rounded-full bg-white/75 px-2.5 py-1 text-[0.66rem] font-semibold text-ink-500"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </TiltCard>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

export function TraitDeck() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {traits.map((trait, i) => {
        const active = open === trait.id;
        return (
          <Reveal key={trait.id} delay={i * 0.06} className="h-full">
            <li className="h-full list-none">
              <button
                type="button"
                onClick={() => setOpen(active ? null : trait.id)}
                onPointerEnter={() => setOpen(trait.id)}
                aria-expanded={active}
                className="glass rounded-blob group flex h-full w-full items-center gap-4 p-4 text-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 sm:p-5"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span aria-hidden className="text-2xl">
                      {trait.emoji}
                    </span>
                    <span className="font-display text-lg font-extrabold text-sakura-800">
                      {trait.label}
                    </span>
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-ink-500">
                    {trait.line}
                  </span>
                </span>

                <motion.span
                  className="shrink-0"
                  animate={{ scale: active ? 1.06 : 1, rotate: active ? -3 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <ReactionClip
                    name={trait.reaction}
                    size="w-24 sm:w-28"
                    rounded="rounded-[1.2rem]"
                  />
                </motion.span>
              </button>
            </li>
          </Reveal>
        );
      })}
    </ul>
  );
}

export function OpinionTicker() {
  return (
    <Marquee speed={46} className="py-2">
      {opinions.map((o) => (
        <span
          key={o.claim}
          className="glass flex shrink-0 items-center gap-3 rounded-full py-2.5 pr-5 pl-3"
        >
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-full bg-sakura-100 text-base"
          >
            {o.emoji}
          </span>
          <span className="font-display text-sm font-extrabold whitespace-nowrap text-ink-900">
            {o.claim}
          </span>
          <span className="rounded-full bg-sakura-600 px-2.5 py-0.5 font-display text-xs font-bold whitespace-nowrap text-white">
            {o.verdict}
          </span>
          <span className="text-xs whitespace-nowrap text-ink-300 italic">
            {o.line}
          </span>
        </span>
      ))}
    </Marquee>
  );
}

export function LanguageMeters() {
  return (
    <Stagger as="ul" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {languages.map((lang) => (
        <StaggerItem as="li" key={lang.name}>
          <div className="glass rounded-[1.3rem] p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display font-extrabold text-ink-900">
                <span aria-hidden className="mr-1.5">
                  {lang.flag}
                </span>
                {lang.name}
              </p>
              <p lang={lang.name === "Japanese" ? "ja" : undefined} className="font-jp text-sm text-sakura-600">
                {lang.nameNative}
              </p>
            </div>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-sakura-100"
              role="img"
              aria-label={`${lang.name}: ${lang.level}`}
            >
              <motion.div
                className="h-full rounded-full bg-linear-to-r from-sakura-500 to-lilac-400"
                initial={{ width: 0 }}
                whileInView={{ width: `${lang.fluency * 100}%` }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="mt-2 text-xs font-semibold text-ink-300">
              {lang.level}
            </p>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/**
 * The neofetch block, dressed as a real terminal.
 *
 * Revealed line by line rather than character by character: a typewriter over
 * ASCII art reflows the box drawing on every frame, which looks broken. This
 * keeps the art intact and still reads as "something is happening".
 */
export function NeofetchTerminal() {
  const lines = neofetch.split("\n");

  return (
    <div className="rounded-blob overflow-hidden border border-sakura-200/80 bg-[#2b1b24] shadow-[0_26px_60px_-30px_rgba(74,44,58,0.9)]">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2.5">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <p className="ml-2 font-mono text-[0.7rem] text-sakura-200/70">
          ren@sanctuary — zsh
        </p>
      </div>

      <motion.pre
        className="overflow-x-auto px-5 py-5 font-mono text-[0.72rem] leading-[1.55] text-sakura-100 sm:px-7 sm:text-[0.82rem]"
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ shown: { transition: { staggerChildren: 0.07 } } }}
      >
        {lines.map((line, i) => (
          <motion.span
            key={i}
            className="block whitespace-pre"
            variants={{
              hidden: { opacity: 0, x: -8 },
              shown: { opacity: 1, x: 0, transition: { duration: 0.32 } },
            }}
          >
            {line || " "}
          </motion.span>
        ))}
        <motion.span
          className="mt-1 inline-block h-4 w-2 bg-sakura-400 align-middle"
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1.05, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
        />
      </motion.pre>
    </div>
  );
}

export function MachineList() {
  return (
    <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
      {machines.map((m) => (
        <div
          key={m.label}
          className="flex items-baseline gap-3 border-b border-sakura-200/50 pb-2.5"
        >
          <dt className="flex w-24 shrink-0 items-center gap-1.5 font-display text-xs font-bold tracking-[0.16em] text-sakura-500 uppercase">
            <span aria-hidden>{m.emoji}</span>
            {m.label}
          </dt>
          <dd className="min-w-0 font-medium text-ink-700">
            {m.value}
            {m.note && (
              <span className="ml-1.5 text-xs text-ink-300 italic">
                ({m.note})
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
