import type { Metadata } from "next";

import { Chip, PageHeader, PageShell, Petals, SectionTitle } from "@/components/ui";
import { stack } from "@/lib/content";

export const metadata: Metadata = {
  title: "Stack",
  description:
    "The whole toolbox — clouds, languages, orchestration, IaC, observability, security, networking, load testing and data.",
};

export default function StackPage() {
  return (
    <>
      <Petals />
      <PageShell>
        <PageHeader
          kicker="the toolbox"
          title="Everything I reach for"
          lead="Grouped roughly by what breaks at 3AM. Nothing here is on the list because it looked good — it's on the list because I've had to debug it."
        />

        <nav aria-label="Stack sections" className="mt-10">
          <ul className="flex flex-wrap gap-2">
            {stack.map((group) => (
              <li key={group.id}>
                <a
                  href={`#${group.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-sakura-200/80 bg-white/70 px-3.5 py-2 text-sm font-semibold text-ink-700 transition-colors hover:border-sakura-400 hover:bg-sakura-100 hover:text-sakura-800"
                >
                  <span aria-hidden>{group.emoji}</span>
                  {group.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-16 space-y-14">
          {stack.map((group) => (
            <section key={group.id} id={group.id} className="scroll-mt-28">
              <SectionTitle emoji={group.emoji} note={group.note}>
                {group.title}
              </SectionTitle>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </PageShell>
    </>
  );
}
