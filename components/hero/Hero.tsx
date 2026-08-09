"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useBoot } from "@/components/boot/BootProvider";
import { HelloLottie } from "@/components/hero/HelloLottie";
import { HeroVideo } from "@/components/hero/HeroVideo";
import { ShaderText } from "@/components/hero/ShaderText";
import { profile } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/motion";

/**
 * The hero sequence, in order:
 *   video already rolling → "hello" writes itself → wipes away → the name
 *   materialises out of the same wind that carried the dandelions off →
 *   the Japanese name → what she does → a way to say hi.
 */
export function Hero() {
  const { stage, isLive, heroIntroPending, markIntroDone } = useBoot();
  const reduced = usePrefersReducedMotion();

  // Coming back to `/` from another page skips straight to the settled state;
  // the intro is a first-arrival moment, not something to sit through again.
  // On a return visit the shader has already done its job; a short fade reads
  // as "you're back" rather than re-staging the whole arrival.
  const plainName = reduced || !heroIntroPending;

  const [nameActive, setNameActive] = useState(!heroIntroPending);
  const [tailActive, setTailActive] = useState(!heroIntroPending);

  // The last thing to animate is the tail block fading up; once that is under
  // way the intro is effectively over and scrolling can be handed back.
  useEffect(() => {
    if (tailActive) markIntroDone();
  }, [tailActive, markIntroDone]);

  const videoPlaying = stage !== "loading";

  return (
    <section
      id="hero"
      className="relative flex h-svh w-full items-center overflow-hidden"
    >
      <HeroVideo play={videoPlaying} />

      <div className="mx-auto flex w-full max-w-[1600px] justify-center px-6 sm:px-10 md:justify-end">
        <div className="relative flex w-full max-w-[34rem] -translate-y-[4vh] flex-col items-center text-center md:mr-[3vw] md:items-end md:text-right lg:mr-[5vw] lg:max-w-[40rem]">
          {/* Plays in the middle of the text block, then wipes away before
              anything below the name fades in — so it never collides. */}
          {heroIntroPending && (
            <HelloLottie
              play={isLive}
              onWipeStart={() => setNameActive(true)}
              onDone={() => setTailActive(true)}
              className="pointer-events-none absolute top-1/2 left-1/2 aspect-[927/471] w-[14rem] -translate-x-1/2 -translate-y-1/2 sm:w-[17rem] lg:w-[20rem]"
            />
          )}

          <h1 className="flex flex-col items-center gap-1 md:items-end">
            <ShaderText
              text={profile.name}
              active={nameActive}
              plain={plainName}
              durationMs={1650}
              className="text-gradient font-display text-[clamp(2.7rem,7.4vw,5.6rem)] leading-[1.02] font-extrabold tracking-[-0.025em]"
              haloClassName="hero-halo"
            />
            <ShaderText
              text={profile.nameJa}
              active={nameActive}
              plain={plainName}
              delayMs={620}
              durationMs={1100}
              lang="ja"
              className="text-gradient font-jp text-[clamp(1.15rem,2.6vw,1.9rem)] font-medium tracking-[0.18em]"
              haloClassName="hero-halo-sm"
            />
          </h1>

          <div
            className="mt-7 flex flex-col items-center gap-5 md:items-end"
            style={{
              opacity: tailActive ? 1 : 0,
              transform: tailActive ? "translateY(0)" : "translateY(16px)",
              transition:
                "opacity 900ms var(--ease-petal), transform 900ms var(--ease-petal)",
            }}
          >
            <p className="hero-halo-sm font-display text-[clamp(1rem,1.7vw,1.35rem)] font-bold tracking-wide text-sakura-800">
              {profile.role}
            </p>
            <p className="hero-halo-sm max-w-[26rem] text-[clamp(0.9rem,1.3vw,1.05rem)] leading-relaxed font-semibold text-ink-900">
              {profile.blurb}
            </p>

            <div className="mt-1 flex flex-wrap items-center justify-center gap-3 md:justify-end">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-sakura-600 to-sakura-500 px-7 py-3.5 font-display text-base font-bold text-white shadow-[0_10px_30px_-8px_rgba(214,51,108,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_-10px_rgba(214,51,108,0.75)] active:translate-y-0"
              >
                contact me
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                  ♡
                </span>
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-sakura-300/70 bg-white/70 px-6 py-3.5 font-display text-base font-bold text-sakura-800 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90"
              >
                my work
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ScrollCue show={tailActive} />
    </section>
  );
}

function ScrollCue({ show }: { show: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-7 flex justify-center"
      style={{
        opacity: show ? 1 : 0,
        transition: "opacity 1s var(--ease-petal) 400ms",
      }}
    >
      <div className="animate-bob flex flex-col items-center gap-1.5">
        <span className="hero-halo-sm font-display text-xs font-bold tracking-[0.3em] text-sakura-800 uppercase">
          scroll
        </span>
        <span className="text-lg text-sakura-700 drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]">
          ↓
        </span>
      </div>
    </div>
  );
}
