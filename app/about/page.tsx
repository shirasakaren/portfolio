import type { Metadata } from "next";

import { Card, PageHeader, PageShell, Petals } from "@/components/ui";
import { PageTransition } from "@/components/site/PageTransition";
import {
  aboutPoints,
  certs,
  certsNote,
  lineageNote,
  neofetch,
  profile,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: `${profile.name} — ${profile.tagline}. ${profile.location}, ${profile.timezone}.`,
};

export default function AboutPage() {
  return (
    <PageTransition>
      <Petals />
      <PageShell>
        <PageHeader
          kicker="about me"
          title="yaho~ I'm Ren"
          titleJa="白坂れん"
          lead={`${profile.tagline} — ${profile.blurb}`}
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <ul className="space-y-4">
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

          <div className="space-y-6">
            <Card>
              <h2 className="font-display text-lg font-extrabold text-sakura-800">
                The short version
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["Role", profile.role],
                  ["Company", profile.employer],
                  ["Based", profile.location],
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

            <Card className="bg-linear-to-br from-white/85 to-sakura-100/70">
              <h2 className="font-display text-lg font-extrabold text-sakura-800">
                {lineageNote.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                {lineageNote.body}
              </p>
            </Card>
          </div>
        </div>

        <section className="mt-16" aria-labelledby="machines">
          <h2
            id="machines"
            className="font-display text-2xl font-extrabold text-sakura-800"
          >
            🐧 my machines
          </h2>
          <pre className="rounded-blob mt-5 overflow-x-auto border border-sakura-200/80 bg-white/80 p-6 font-mono text-[0.78rem] leading-relaxed text-ink-700 shadow-[0_10px_30px_-16px_rgba(214,51,108,0.35)] sm:text-sm">
            {neofetch}
          </pre>
        </section>

        <section className="mt-16" aria-labelledby="certs">
          <h2
            id="certs"
            className="font-display text-2xl font-extrabold text-sakura-800"
          >
            🎯 certs
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-ink-500 italic">
            {certsNote}
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {certs.map((group) => (
              <Card key={group.group} className="p-5">
                <h3 className="flex items-center gap-2 font-display font-extrabold text-sakura-700">
                  <span aria-hidden>{group.emoji}</span>
                  {group.group}
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm text-ink-500">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>
      </PageShell>
    </PageTransition>
  );
}
