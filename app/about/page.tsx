import type { Metadata } from "next";
import Link from "next/link";

import {
  FavouritesGrid,
  LanguageMeters,
  MachineList,
  NeofetchTerminal,
  OpinionTicker,
  TraitDeck,
} from "@/components/about/Personal";
import { Timeline } from "@/components/about/Timeline";
import { Counter, Magnetic, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { PageTransition } from "@/components/site/PageTransition";
import {
  Card,
  Kicker,
  PageHeader,
  PageShell,
  PetalRule,
  SectionTitle,
  Sparkles,
  StatTile,
} from "@/components/ui";
import { ReactionClip } from "@/components/visual/ReactionClip";
import {
  aboutPoints,
  awards,
  careerMonths,
  certRoadmap,
  certificationsHeld,
  certsNote,
  community,
  education,
  experience,
  lineageNote,
  profile,
  projects,
  skillCount,
  stack,
  topSkills,
  yearsOfExperience,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: `${profile.name} — ${profile.tagline}. ${profile.headline}. Experience, certifications, awards, and the okonomiyaki.`,
};

const roleCount = experience.reduce((n, c) => n + c.roles.length, 0);
const cloudCount = stack.find((g) => g.id === "clouds")?.items.length ?? 0;

export default function AboutPage() {
  return (
    <PageTransition>
      <PageShell>
        <PageHeader
          kicker="your dearest friend"
          title="yaho~ I'm Ren"
          titleJa="白坂れん・しらさか れん"
          lead={`${profile.tagline}. I keep other people's infrastructure alive for a living, and I would very much like to tell you about it — but first, the okonomiyaki.`}
          aside={
            <ReactionClip
              name="wave"
              eager
              size="w-40 sm:w-52"
              caption="yaho~ ٩(◕‿◕｡)۶"
            />
          }
        />

        {/* ── the short version ─────────────────────────────────────── */}

        <section aria-labelledby="short-version" className="mt-16">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <Reveal>
              <Card className="relative overflow-hidden">
                <Sparkles count={6} className="opacity-40" />
                <h2
                  id="short-version"
                  className="font-display text-xl font-extrabold text-sakura-800"
                >
                  Seven things, before we go any further
                </h2>
                <ul className="relative mt-5 space-y-3.5">
                  {aboutPoints.map((point) => (
                    <li key={point.text} className="flex gap-3.5">
                      <span aria-hidden className="mt-0.5 text-xl">
                        {point.emoji}
                      </span>
                      <span className="leading-relaxed text-ink-700">
                        {point.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>

            <div className="space-y-6">
              <Reveal delay={0.08}>
                <Card>
                  <Kicker>the facts</Kicker>
                  <dl className="mt-4 space-y-3 text-sm">
                    {[
                      ["Role", profile.role],
                      ["Based", profile.location],
                      ["Working", "Remote"],
                      ["Timezone", profile.timezone],
                      ["Pronouns", profile.pronouns],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4">
                        <dt className="font-semibold text-ink-300">{label}</dt>
                        <dd className="text-right font-medium text-ink-700">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              </Reveal>

              <Reveal delay={0.14}>
                <Card className="bg-linear-to-br from-white/85 to-sakura-100/70">
                  <Kicker>what people hire me for</Kicker>
                  <ul className="mt-4 space-y-2">
                    {topSkills.map((s) => (
                      <li
                        key={s.name}
                        className="flex items-center gap-2.5 font-display font-bold text-sakura-800"
                      >
                        <span aria-hidden>{s.emoji}</span>
                        {s.name}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs leading-relaxed text-ink-500 italic">
                    Most platform engineers have never touched the layer
                    underneath the hypervisor. I have racked it, powered it and
                    cooled it.
                  </p>
                </Card>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── numbers ───────────────────────────────────────────────── */}

        <section aria-label="By the numbers" className="mt-14">
          <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
            {[
              { value: yearsOfExperience(), label: "years in", suffix: "+" },
              { value: experience.length, label: "companies" },
              { value: roleCount, label: "roles held" },
              { value: cloudCount, label: "clouds" },
              { value: projects.length, label: "builds shipped" },
              { value: skillCount, label: "things in the toolbox" },
            ].map((s) => (
              <StaggerItem key={s.label}>
                <StatTile
                  value={<Counter to={s.value} suffix={s.suffix ?? ""} />}
                  label={s.label}
                />
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mt-3 text-center text-xs text-ink-300">
            {careerMonths} months of it, if you would rather count that way.
          </p>
        </section>

        {/* ── lineage ───────────────────────────────────────────────── */}

        <Reveal className="mt-16">
          <section className="rounded-blob relative overflow-hidden border border-sakura-200/70 bg-linear-to-br from-white/80 via-sakura-100/70 to-lilac-200/50 p-8 backdrop-blur-sm sm:p-12">
            <Sparkles count={10} className="opacity-50" />
            <div className="relative">
              <h2 className="font-display text-2xl font-extrabold text-sakura-800 sm:text-3xl">
                {lineageNote.title}{" "}
                <span lang="ja" className="font-jp text-xl text-sakura-600">
                  {lineageNote.titleJa}
                </span>
              </h2>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-700">
                {lineageNote.body}
              </p>
              <p lang="ja" className="mt-6 font-jp text-lg text-sakura-700">
                {profile.lineageJa}
              </p>
              <p className="text-sm text-ink-300 italic">
                {profile.lineageEn}
              </p>
            </div>
          </section>
        </Reveal>

        {/* ── the work ──────────────────────────────────────────────── */}

        <section aria-labelledby="career" className="mt-24">
          <Reveal>
            <SectionTitle
              id="career"
              emoji="🗓️"
              note="Reverse chronological, because that is how everyone reads these. Every date is off the CV."
            >
              Where I have been
            </SectionTitle>
          </Reveal>
          <div className="mt-10">
            <Timeline />
          </div>
        </section>

        <PetalRule className="mt-20" />

        {/* ── credentials ───────────────────────────────────────────── */}

        <section aria-labelledby="credentials" className="mt-16">
          <Reveal>
            <SectionTitle id="credentials" emoji="🎯" note={certsNote}>
              Certifications
            </SectionTitle>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="glass rounded-blob p-6 sm:p-7">
              <Kicker>held today</Kicker>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {certificationsHeld.map((c) => (
                  <li
                    key={c.name}
                    className="flex items-start gap-3 rounded-2xl bg-white/60 px-3.5 py-3 ring-1 ring-sakura-200/60 ring-inset"
                  >
                    <span aria-hidden className="text-lg">
                      {c.emoji}
                    </span>
                    <span>
                      <span className="block text-sm leading-snug font-semibold text-ink-900">
                        {c.name}
                      </span>
                      {c.issuer && (
                        <span className="text-xs text-ink-300">{c.issuer}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-8 mb-4">
            <Kicker>held, renewing, or hunting next</Kicker>
          </Reveal>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {certRoadmap.map((track) => (
              <StaggerItem key={track.group}>
                <Card className="h-full p-5">
                  <h3 className="flex items-center gap-2 font-display font-extrabold text-sakura-700">
                    <span aria-hidden>{track.emoji}</span>
                    {track.group}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-300 italic">
                    {track.blurb}
                  </p>
                  <ul className="mt-3.5 flex flex-wrap gap-1.5">
                    {track.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-lg bg-sakura-100/80 px-2 py-1 font-mono text-[0.68rem] font-semibold text-sakura-700"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* ── awards + education ────────────────────────────────────── */}

        <section className="mt-20 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <Reveal>
              <SectionTitle emoji="🏆" note="Mostly from before the pager. Old habits.">
                Honours & awards
              </SectionTitle>
            </Reveal>
            <Stagger as="ul" className="grid gap-3 sm:grid-cols-2">
              {awards.map((award) => (
                <StaggerItem as="li" key={award.title}>
                  <div
                    className={`group relative flex h-full items-start gap-3.5 overflow-hidden rounded-[1.4rem] p-4 ring-1 ring-inset transition-transform duration-500 hover:-translate-y-1 ${
                      award.rank === 1
                        ? "bg-linear-to-br from-dandelion-100 via-white/70 to-sakura-100/60 ring-dandelion-300/80"
                        : "glass ring-sakura-200/70"
                    }`}
                  >
                    {award.rank === 1 && (
                      <span
                        aria-hidden
                        className="holo-foil pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                      />
                    )}
                    <span aria-hidden className="text-2xl">
                      {award.emoji}
                    </span>
                    <span className="relative">
                      <span className="block font-display text-sm font-extrabold text-sakura-700">
                        {award.place}
                      </span>
                      <span className="block text-sm leading-snug text-ink-700">
                        {award.title}
                      </span>
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <div>
            <Reveal>
              <SectionTitle emoji="🎓">Education</SectionTitle>
            </Reveal>
            <Reveal delay={0.06}>
              {education.map((e) => (
                <Card key={e.school}>
                  <p className="font-display text-lg font-extrabold text-sakura-800">
                    {e.school}
                  </p>
                  <p lang="ja" className="font-jp text-sm text-sakura-600">
                    {e.schoolJa}
                  </p>
                  <p className="mt-3 font-semibold text-ink-700">{e.degree}</p>
                  <p className="mt-1 font-mono text-xs text-sakura-600">
                    {e.start} — {e.end}
                  </p>
                  <p className="mt-3 text-sm text-ink-500 italic">{e.note}</p>
                </Card>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ── community ─────────────────────────────────────────────── */}

        <section aria-labelledby="community" className="mt-20">
          <Reveal>
            <SectionTitle
              id="community"
              emoji="🤝"
              note="Things I keep running that nobody pays me for."
            >
              Out in the open
            </SectionTitle>
          </Reveal>
          <Stagger as="ul" className="grid gap-4 md:grid-cols-3">
            {community.map((c) => (
              <StaggerItem as="li" key={c.title}>
                <Card className="h-full">
                  <span aria-hidden className="text-2xl">
                    {c.emoji}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-extrabold text-sakura-800">
                    {c.title}
                  </h3>
                  <p className="mt-0.5 font-display text-xs font-bold tracking-[0.2em] text-sakura-500 uppercase">
                    {c.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">
                    {c.body}
                  </p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <PetalRule className="mt-20" />

        {/* ── off the clock ─────────────────────────────────────────── */}

        <section aria-labelledby="off-the-clock" className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <SectionTitle
                id="off-the-clock"
                emoji="🍵"
                note="The part of the CV nobody asks for and everybody actually reads."
              >
                Off the clock
              </SectionTitle>
            </Reveal>
            <Reveal delay={0.1}>
              <ReactionClip
                name="sparkleEyes"
                size="w-28 sm:w-32"
                rounded="rounded-[1.3rem]"
              />
            </Reveal>
          </div>

          <div className="mt-4">
            <FavouritesGrid />
          </div>
        </section>

        <section aria-labelledby="traits" className="mt-16">
          <Reveal>
            <SectionTitle
              id="traits"
              emoji="🫣"
              note="Full disclosure, in case we end up on the same on-call rota."
            >
              Known issues
            </SectionTitle>
          </Reveal>
          <TraitDeck />
        </section>

        <section aria-labelledby="opinions" className="mt-16">
          <Reveal>
            <SectionTitle
              id="opinions"
              emoji="⚔️"
              note="I will defend every one of these, cheerfully, for longer than you want."
            >
              Hills I will die on
            </SectionTitle>
          </Reveal>
          <div className="-mx-6 sm:-mx-10">
            <OpinionTicker />
          </div>
        </section>

        {/* ── languages + machines ──────────────────────────────────── */}

        <section aria-labelledby="languages" className="mt-20">
          <Reveal>
            <SectionTitle id="languages" emoji="🗣️">
              Languages I speak
            </SectionTitle>
          </Reveal>
          <LanguageMeters />
        </section>

        <section aria-labelledby="machines" className="mt-16">
          <Reveal>
            <SectionTitle
              id="machines"
              emoji="🐧"
              note="Yes, the terminal is pink. No, I will not be taking questions."
            >
              My machines
            </SectionTitle>
          </Reveal>
          {/* `min-w-0` is load-bearing: a grid item defaults to
              `min-width: auto`, so the terminal's longest ASCII line would
              otherwise widen the whole document on a phone. */}
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal className="min-w-0">
              <NeofetchTerminal />
            </Reveal>
            <Reveal delay={0.08} className="min-w-0">
              <Card className="h-full">
                <MachineList />
              </Card>
            </Reveal>
          </div>
        </section>

        {/* ── cta ───────────────────────────────────────────────────── */}

        <Reveal className="mt-24">
          <section className="rounded-blob relative overflow-hidden border border-sakura-200/70 bg-linear-to-br from-sakura-100/80 via-white/60 to-lilac-200/50 px-6 py-14 text-center sm:px-12">
            <Sparkles count={12} className="opacity-60" />
            <div className="relative flex flex-col items-center">
              <ReactionClip
                name="heartSkip"
                size="w-32 sm:w-36"
                rounded="rounded-[1.4rem]"
              />
              <h2 className="text-gradient mt-6 font-display text-[clamp(1.7rem,4vw,2.6rem)] font-extrabold">
                Okay, your turn.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-ink-500">
                Tell me what you are running, what keeps breaking, and whether
                you have strong feelings about okonomiyaki.
              </p>
              <Magnetic className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-sakura-600 to-lilac-400 px-8 py-4 font-display text-lg font-bold text-white shadow-[0_14px_36px_-12px_rgba(214,51,108,0.7)]"
                >
                  say hi <span aria-hidden>♡</span>
                </Link>
              </Magnetic>
            </div>
          </section>
        </Reveal>
      </PageShell>
    </PageTransition>
  );
}
