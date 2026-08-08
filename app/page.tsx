import Link from "next/link";

import { Hero } from "@/components/hero/Hero";
import { Card, Chip, SectionTitle } from "@/components/ui";
import { lineageNote, profile, stack } from "@/lib/content";

const doing = [
  {
    emoji: "☁️",
    title: "Cloud foundations",
    body: "Landing zones, identity, network topology and guardrails — expressed once in code and specialised per provider. Six clouds, no snowflakes.",
  },
  {
    emoji: "⎈",
    title: "Platform & delivery",
    body: "Kubernetes that people actually enjoy shipping to: GitOps, progressive delivery, policy at admission, and immutable nodes underneath.",
  },
  {
    emoji: "🛡️",
    title: "Security engineering",
    body: "Signed supply chains, secrets that never touch a repo, and infrastructure I attack myself before someone else volunteers.",
  },
  {
    emoji: "📊",
    title: "Reliability & observability",
    body: "Native histograms, honest load tests, correlated traces and logs. Alerts that arrive with the dashboard and the runbook attached.",
  },
];

export default function Home() {
  const clouds = stack.find((g) => g.id === "clouds");

  return (
    <>
      <Hero />

      <div className="relative bg-sakura-50">
        <div className="mx-auto w-full max-w-[1180px] px-6 py-24 sm:px-10 sm:py-32">
          <section aria-labelledby="what-i-do">
            <p className="font-display text-xs font-bold tracking-[0.34em] text-sakura-500 uppercase">
              what I do
            </p>
            <h2
              id="what-i-do"
              className="text-gradient mt-3 max-w-3xl font-display text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.1] font-extrabold tracking-[-0.02em]"
            >
              Infrastructure that stays boring, on purpose.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-500">
              The best compliment my work gets is silence — no incidents, no
              surprises, no 3AM pages. Getting there is the interesting part.
            </p>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {doing.map((item) => (
                <Card key={item.title} className="hover:-translate-y-1">
                  <span aria-hidden className="text-3xl">
                    {item.emoji}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-extrabold text-sakura-800">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 leading-relaxed text-ink-500">
                    {item.body}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          {clouds && (
            <section aria-labelledby="clouds" className="mt-24">
              <SectionTitle emoji={clouds.emoji} note={clouds.note}>
                <span id="clouds">{clouds.title}</span>
              </SectionTitle>
              <ul className="flex flex-wrap gap-2">
                {clouds.items.map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
              </ul>
              <Link
                href="/stack"
                className="mt-7 inline-flex items-center gap-2 font-display font-bold text-sakura-700 underline decoration-sakura-300 decoration-2 underline-offset-4 transition-colors hover:text-sakura-600"
              >
                see the whole toolbox →
              </Link>
            </section>
          )}

          <section className="rounded-blob mt-24 border border-sakura-200/70 bg-linear-to-br from-white/80 via-sakura-100/60 to-lilac-200/40 p-8 backdrop-blur-sm sm:p-12">
            <h2 className="font-display text-2xl font-extrabold text-sakura-800">
              {lineageNote.title}
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-700">
              {lineageNote.body}
            </p>
            <p lang="ja" className="mt-6 font-jp text-lg text-sakura-700">
              {profile.lineageJa}
            </p>
          </section>

          <section className="mt-24 text-center">
            <h2 className="text-gradient font-display text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold">
              Got something that needs keeping alive?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-500">
              Coffee, matcha, and a very tidy <code className="font-mono text-sakura-700">terraform plan</code> accepted as payment. 🍵
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-sakura-600 to-lilac-400 px-8 py-4 font-display text-lg font-bold text-white shadow-[0_14px_36px_-12px_rgba(214,51,108,0.7)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              say hi <span aria-hidden>♡</span>
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
