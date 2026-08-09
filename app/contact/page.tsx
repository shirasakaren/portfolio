import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { Magnetic, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { PageTransition } from "@/components/site/PageTransition";
import { Card, Kicker, PageHeader, PageShell, Sparkles } from "@/components/ui";
import { CopyButton } from "@/components/ui/CopyButton";
import { ReactionClip } from "@/components/visual/ReactionClip";
import { pgpPublicKey, profile } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${profile.name} — ${profile.email}. Discord, PGP, or the form — your call.`,
};

const DIRECT = [
  {
    label: "Email",
    emoji: "💌",
    value: profile.email,
    href: `mailto:${profile.email}`,
    mono: true,
    copy: true,
  },
  {
    label: "Discord",
    emoji: "💬",
    value: profile.discordHandle,
    href: profile.discord,
    mono: false,
    copy: true,
  },
  {
    label: "GitHub",
    emoji: "🐙",
    value: profile.githubHandle,
    href: profile.github,
    mono: false,
    copy: false,
  },
  {
    label: "Hours",
    emoji: "🕘",
    value: `${profile.timezone} · ${profile.location}`,
    href: null,
    mono: false,
    copy: false,
  },
] as const;

export default function ContactPage() {
  return (
    <PageTransition>
      <PageShell>
        <PageHeader
          kicker="come say hi"
          title="Let's talk infrastructure"
          titleJa="よろしくおねがいします〜"
          lead="The form goes to my inbox. Discord gets the fastest reply. Either way, you're not talking to a bot."
          aside={
            <ReactionClip
              name="hehe"
              eager
              size="w-36 sm:w-44"
              caption="hehe~ go on, copy it"
            />
          }
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {/* ── the form (primary) ──────────────────────────────── */}
          <Reveal>
            <Card className="relative overflow-hidden">
              <Sparkles count={7} className="opacity-35" />
              <div className="relative">
                <Kicker>the form</Kicker>
                <h2 className="text-gradient mt-1 font-display text-2xl font-extrabold">
                  Tell me what you need.
                </h2>
                <p className="mt-2 mb-9 text-sm text-ink-500">
                  Name, email, the situation — and a file if it helps. Goes
                  straight to my inbox. No CRM, no funnel, no autoresponder.
                </p>
                <ContactForm />
              </div>
            </Card>
          </Reveal>

          {/* ── sidebar — reach me directly ──────────────────────── */}
          <div className="space-y-5">
            <Reveal delay={0.08}>
              <Card>
                <Kicker>or reach me directly</Kicker>
                <Stagger as="ul" className="mt-5 space-y-4">
                  {DIRECT.map((item) => (
                    <StaggerItem as="li" key={item.label}>
                      <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-ink-300 uppercase">
                        <span aria-hidden>{item.emoji}</span>
                        {item.label}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {item.href ? (
                          <a
                            href={item.href}
                            {...(item.href.startsWith("http")
                              ? { target: "_blank", rel: "me noreferrer" }
                              : {})}
                            className={`font-medium text-sakura-700 underline decoration-sakura-300 underline-offset-4 transition-colors hover:text-sakura-600 ${
                              item.mono ? "font-mono" : ""
                            }`}
                          >
                            {item.value}
                          </a>
                        ) : (
                          <span className="text-ink-700">{item.value}</span>
                        )}
                        {item.copy && <CopyButton value={item.value} />}
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </Card>
            </Reveal>

            <Reveal delay={0.14}>
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-extrabold text-sakura-800">
                    🔐 PGP
                  </h2>
                  <CopyButton value={pgpPublicKey} label="Copy key" />
                </div>
                <p className="mt-2 text-sm text-ink-500">
                  Encrypt sensitive content with this public key before sending.
                </p>
                <details className="group mt-4">
                  <summary className="cursor-pointer font-display text-sm font-bold text-sakura-700 marker:content-none">
                    <span className="inline-block transition-transform group-open:rotate-90">
                      ▸
                    </span>{" "}
                    show public key
                  </summary>
                  <pre className="mt-3 max-h-72 overflow-auto rounded-2xl border border-sakura-200/80 bg-white/80 p-4 font-mono text-[0.62rem] leading-relaxed break-all whitespace-pre-wrap text-ink-500">
                    {pgpPublicKey}
                  </pre>
                </details>
              </Card>
            </Reveal>

            {/* ── the reaction card ─────────────────────────────── */}
            <Reveal delay={0.2}>
              <div className="rounded-blob relative overflow-hidden border border-sakura-200/70 bg-linear-to-br from-sakura-100/80 to-lilac-200/50 p-7 text-center">
                <Sparkles count={6} className="opacity-45" />
                <div className="relative flex flex-col items-center">
                  <ReactionClip
                    name="sparkleEyes"
                    size="w-28"
                    rounded="rounded-[1.3rem]"
                  />
                  <p className="mt-4 max-w-[18ch] text-sm font-semibold text-ink-700">
                    Discord is the fastest way to reach me — I&rsquo;m usually
                    online during JST working hours.
                  </p>
                  <Magnetic className="mt-5">
                    <a
                      href={profile.discord}
                      target="_blank"
                      rel="me noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#5865F2] px-6 py-3 font-display text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(88,101,242,0.7)] transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-5"
                        aria-hidden
                      >
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.332-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.332-.946 2.418-2.157 2.418z" />
                      </svg>
                      message on Discord
                    </a>
                  </Magnetic>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </PageShell>
    </PageTransition>
  );
}
