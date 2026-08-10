import Link from "next/link";

import { Hero } from "@/components/hero/Hero";
import {
  FeaturedWork,
  LogoWall,
  PersonalTeaser,
} from "@/components/home/HomeSections";
import { WalkVideo } from "@/components/home/WalkVideo";
import { Capabilities } from "@/components/home/Capabilities";
import { Magnetic, Reveal, SplitReveal } from "@/components/motion";
import { PageTransition } from "@/components/site/PageTransition";
import { Kicker, PetalRule, Sparkles } from "@/components/ui";
import { FightVideo } from "@/components/home/FightVideo";
import { NumbersBento } from "@/components/home/NumbersBento";
import { profile, skillCount } from "@/lib/content";

export default function Home() {
  return (
    <PageTransition>
      <Hero />

      {/* The whole page below the hero sits on the shader field, so it only
          needs to establish its own edge — not its own background. The wash at
          the top softens the seam where the video stops: the hero snap parks
          exactly on that line, and a hard edge there reads as a rendering
          glitch rather than the end of a slide. */}
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-cream/85 to-transparent"
        />
        {/* ── the turn ─────────────────────────────────────────────── */}

        <section
          aria-labelledby="intro"
          className="mx-auto w-full max-w-[1180px] px-6 pt-24 sm:px-10 sm:pt-32"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
            <div>
              <Reveal y={14}>
                <Kicker>so, who is keeping the lights on</Kicker>
              </Reveal>
              <h2
                id="intro"
                className="text-gradient mt-4 font-display text-[clamp(2rem,5.2vw,3.5rem)] leading-[1.05] font-extrabold tracking-[-0.02em]"
              >
                <SplitReveal text="Infrastructure that stays boring, on purpose. >⩊<" />
              </h2>
              <Reveal delay={0.2}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500">
                  The best compliment my work ever gets is silence — no
                  incidents, no surprises, no 3AM pages. HR will always 
                  complain when I do nothing cus no accident, and will
                  also complain when there&rsquo;s an accident.
                </p>            
              </Reveal>
              <Reveal delay={0.28}>
                <p className="mt-4 max-w-xl text-ink-500">
                  <span className="font-semibold text-sakura-700">
                    {profile.headline}
                  </span>
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.15} className="justify-self-center lg:justify-self-end lg:self-stretch">
              <FightVideo />
            </Reveal>
          </div>
        </section>

        {/* ── the wall of logos ────────────────────────────────────── */}

        <section aria-label="Technologies" className="mt-16 sm:mt-20">
          <LogoWall />
          <div className="mx-auto mt-6 w-full max-w-[1180px] px-6 text-center sm:px-10">
            <Link
              href="/stack"
              className="inline-flex items-center gap-2 font-display text-sm font-bold text-sakura-700 underline decoration-sakura-300 decoration-2 underline-offset-4 transition-colors hover:text-sakura-600"
            >
              all {skillCount} of them, sorted properly <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        {/* ── numbers ──────────────────────────────────────────────── */}

        <section
          aria-label="By the numbers"
          className="mx-auto mt-20 w-full max-w-[1180px] px-6 sm:px-10"
        >
          <Reveal>
            <Kicker>by the numbers</Kicker>
            <h2 className="mt-3 max-w-2xl font-display text-[clamp(1.7rem,4vw,2.6rem)] leading-tight font-extrabold text-sakura-800">
              The CV, compressed into six stats.
            </h2>
          </Reveal>
          <div className="mt-10">
            <NumbersBento />
          </div>
        </section>

        {/* ── what I do ────────────────────────────────────────────── */}

        <section
          aria-labelledby="what-i-do"
          className="mx-auto mt-24 w-full max-w-[1180px] px-6 sm:px-10"
        >
          <Reveal>
            <div className="relative">
              <WalkVideo />
              {/* Title bridging the video and the content below — half on
                  the video, half on the page, like a connector. */}
              <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <h2
                  id="what-i-do"
                  className="whitespace-nowrap rounded-full border border-white/60 bg-white/85 px-6 py-3 font-display text-lg font-extrabold text-sakura-800 shadow-[0_4px_28px_rgba(0,0,0,0.07)] backdrop-blur-sm sm:px-8 sm:py-3.5 sm:text-2xl"
                >
                  Things I can help
                </h2>
              </div>
            </div>
          </Reveal>

          {/* Extra top padding to clear the overlaid title badge */}
          <div className="mt-14 sm:mt-16">
            <Capabilities />
          </div>
        </section>

        {/* ── featured work ────────────────────────────────────────── */}

        <section
          aria-labelledby="featured"
          className="mx-auto mt-24 w-full max-w-[1180px] px-6 sm:px-10"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Reveal>
              <Kicker>selected builds</Kicker>
              <h2
                id="featured"
                className="mt-3 font-display text-[clamp(1.7rem,4vw,2.6rem)] leading-tight font-extrabold text-sakura-800"
              >
                Three I am proudest of.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-sakura-300 bg-white/70 px-5 py-2.5 font-display text-sm font-bold text-sakura-700 transition-colors hover:bg-sakura-100"
              >
                the whole quest log <span aria-hidden>→</span>
              </Link>
            </Reveal>
          </div>
          <div className="mt-10">
            <FeaturedWork />
          </div>
        </section>

        <div className="mx-auto w-full max-w-[1180px] px-6 sm:px-10">
          <PetalRule className="mt-24" />
        </div>

        {/* ── the person ───────────────────────────────────────────── */}

        <section
          aria-label="Off the clock"
          className="mx-auto mt-16 w-full max-w-[1180px] px-6 sm:px-10"
        >
          <PersonalTeaser />
        </section>

        {/* ── cta ──────────────────────────────────────────────────── */}

        <section className="mx-auto mt-24 w-full max-w-[1180px] px-6 pb-8 sm:px-10">
          <Reveal>
            <div className="rounded-blob relative overflow-hidden border border-sakura-200/70 bg-linear-to-br from-sakura-100/80 via-white/60 to-lilac-200/50 px-6 py-16 text-center sm:px-12">
              <Sparkles count={14} className="opacity-60" />
              <div className="relative">
                <h2 className="text-gradient font-display text-[clamp(1.8rem,4.6vw,3rem)] leading-tight font-extrabold">
                  Got something that needs keeping alive?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-ink-500">
                  Let's connect and grow together!
                </p>
                <Magnetic className="mt-9">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-sakura-600 to-lilac-400 px-8 py-4 font-display text-lg font-bold text-white shadow-[0_14px_36px_-12px_rgba(214,51,108,0.7)]"
                  >
                    say hi <span aria-hidden>♡</span>
                  </Link>
                </Magnetic>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </PageTransition>
  );
}
