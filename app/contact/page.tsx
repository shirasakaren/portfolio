import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { PageTransition } from "@/components/site/PageTransition";
import { Card, Kicker, PageHeader, PageShell, Sparkles } from "@/components/ui";
import { CopyButton } from "@/components/ui/CopyButton";
import { ReactionClip } from "@/components/visual/ReactionClip";
import { pgpPublicKey, profile } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${profile.name} — ${profile.email}. PGP key available for anything sensitive.`,
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
          lead="Coffee, matcha, and a very tidy terraform plan accepted as payment. 🍵"
          aside={
            <ReactionClip
              name="hehe"
              eager
              size="w-36 sm:w-44"
              caption="hehe~ go on, copy it"
            />
          }
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <Card className="relative overflow-hidden">
              <Sparkles count={7} className="opacity-35" />
              <div className="relative">
                <h2 className="font-display text-xl font-extrabold text-sakura-800">
                  Send a message
                </h2>
                <p className="mt-2 mb-7 text-sm text-ink-500">
                  Goes straight to my inbox through a Cloudflare Function — the
                  only server-side code on this entire site. No newsletter, no
                  CRM, no funnel.
                </p>
                <ContactForm />
              </div>
            </Card>
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={0.08}>
              <Card>
                <Kicker>or the direct route</Kicker>
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
                  For anything private or sensitive, encrypt it with this public
                  key first.
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

            <Reveal delay={0.2}>
              <div className="rounded-blob relative overflow-hidden border border-sakura-200/70 bg-linear-to-br from-sakura-100/70 to-lilac-200/40 p-6 text-center">
                <ReactionClip
                  name="sparkleEyes"
                  size="mx-auto w-28"
                  rounded="rounded-[1.3rem]"
                />
                <p className="mt-4 text-sm text-ink-700 italic">
                  &ldquo;You actually mailed me?!&rdquo;
                </p>
                <p lang="ja" className="mt-1 font-jp text-xs text-sakura-600">
                  ٩(◕‿◕｡)۶
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </PageShell>
    </PageTransition>
  );
}
