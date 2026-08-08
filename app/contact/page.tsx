import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { Card, PageHeader, PageShell, Petals } from "@/components/ui";
import { CopyButton } from "@/components/ui/CopyButton";
import { pgpPublicKey, profile } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${profile.name} — ${profile.email}. PGP key available for anything sensitive.`,
};

export default function ContactPage() {
  return (
    <>
      <Petals />
      <PageShell>
        <PageHeader
          kicker="come say hi"
          title="Let's talk infrastructure"
          titleJa="よろしくおねがいします〜"
          lead="Coffee, matcha, and a very tidy terraform plan accepted as payment. 🍵"
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <h2 className="font-display text-xl font-extrabold text-sakura-800">
              Send a message
            </h2>
            <p className="mt-2 mb-7 text-sm text-ink-500">
              Goes straight to my inbox. No newsletter, no CRM, no funnel.
            </p>
            <ContactForm />
          </Card>

          <div className="space-y-6">
            <Card>
              <h2 className="font-display text-lg font-extrabold text-sakura-800">
                Or the direct route
              </h2>
              <ul className="mt-4 space-y-4 text-sm">
                <li>
                  <p className="font-semibold text-ink-300">Email</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <a
                      href={`mailto:${profile.email}`}
                      className="font-mono font-medium text-sakura-700 underline decoration-sakura-300 underline-offset-4"
                    >
                      {profile.email}
                    </a>
                    <CopyButton value={profile.email} />
                  </div>
                </li>
                <li>
                  <p className="font-semibold text-ink-300">GitHub</p>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="me noreferrer"
                    className="mt-1 inline-block font-medium text-sakura-700 underline decoration-sakura-300 underline-offset-4"
                  >
                    {profile.githubHandle}
                  </a>
                </li>
                <li>
                  <p className="font-semibold text-ink-300">Working hours</p>
                  <p className="mt-1 text-ink-700">
                    {profile.timezone} · {profile.location}
                  </p>
                </li>
              </ul>
            </Card>

            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-extrabold text-sakura-800">
                  PGP
                </h2>
                <CopyButton value={pgpPublicKey} label="Copy key" />
              </div>
              <p className="mt-2 text-sm text-ink-500">
                For private or sensitive content, please encrypt with this
                public key.
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
          </div>
        </div>
      </PageShell>
    </>
  );
}
