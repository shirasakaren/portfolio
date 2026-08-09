import type { Metadata } from "next";

import { PageTransition } from "@/components/site/PageTransition";
import { StackExplorer } from "@/components/stack/StackExplorer";
import { PageShell, PageHeader } from "@/components/ui";
import { ReactionClip } from "@/components/visual/ReactionClip";
import { skillCount, stack } from "@/lib/content";

export const metadata: Metadata = {
  title: "Stack",
  description: `${skillCount} tools across ${stack.length} categories — clouds, Kubernetes, IaC, observability, security, networking, data, load testing, languages, and the physical data-centre layer underneath all of it.`,
};

export default function StackPage() {
  return (
    <PageTransition>
      <PageShell wide>
        <PageHeader
          kicker="the toolbox"
          title="Everything I reach for"
          lead="Grouped by what breaks at 3AM. Search it, or pick the job you are hiring for and let the page do the matching — it knows the aliases, so “EKS” finds AWS and “incident response” finds the SRE half."
          // The total lives on the logo wall right below; a second counter up
          // here just says the same number twice.
          aside={
            <ReactionClip
              name="sparkleEyes"
              eager
              size="w-32 sm:w-40"
              caption="ask me about any of them"
            />
          }
        />

        <StackExplorer />
      </PageShell>
    </PageTransition>
  );
}
