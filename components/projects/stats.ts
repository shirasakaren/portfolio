import { projects, type Project } from "@/lib/content";

/**
 * The header strip's numbers, every one of them counted out of
 * `lib/content/projects.ts` at build time.
 *
 * Nothing here is typed in by hand. If a project is added, renamed or given
 * another node, the strip moves on its own — which is the only way a stat strip
 * on a portfolio stays true for longer than a month.
 */

/** Every four-digit year mentioned in a project's `year` string. */
function yearsIn(project: Project): number[] {
  return [...project.year.matchAll(/\d{4}/g)].map((m) => Number(m[0]));
}

/** The first integer inside a fact's value, e.g. "48C / 96T" → 48. */
function factNumber(project: Project, labelPattern: RegExp): number {
  const fact = project.facts.find((f) => labelPattern.test(f.label));
  const digits = fact?.value.match(/\d+/);
  return digits ? Number(digits[0]) : 0;
}

function factNote(project: Project, labelPattern: RegExp): string | undefined {
  return project.facts.find((f) => labelPattern.test(f.label))?.note;
}

const allYears = projects.flatMap(yearsIn);
const firstYear = Math.min(...allYears);
const lastYear = Math.max(...allYears);

/** Facts stating a count of clusters or regions, wherever they appear. */
const clusterTotal = projects.reduce(
  (sum, p) => sum + factNumber(p, /cluster/i),
  0,
);
const regionTotal = projects.reduce(
  (sum, p) => sum + factNumber(p, /region/i),
  0,
);

const clusterNote = projects
  .map((p) => factNote(p, /cluster/i))
  .find(Boolean);
const regionNote = projects.map((p) => factNote(p, /region/i)).find(Boolean);

export const productCountOf = (list: Project[] = projects) =>
  list.filter((p) => p.kind === "product").length;
export const infraCountOf = (list: Project[] = projects) =>
  list.filter((p) => p.kind === "infrastructure").length;

/** Distinct tools across every stack list — the union, not the sum. */
const toolset = new Set(projects.flatMap((p) => p.stack));

/** Rack entries. "Asa · Hiru · Yoru" is one line and three machines, so this
 *  is the number of named entries, which under-counts rather than inflates. */
const nodeCount = projects.reduce((sum, p) => sum + (p.nodes?.length ?? 0), 0);

export type QuestStat = {
  id: string;
  value: number;
  label: string;
  note: string;
  emoji: string;
};

export const questStats: QuestStat[] = [
  {
    id: "builds",
    value: projects.length,
    label: "builds",
    note: `${productCountOf()} product · ${infraCountOf()} infra`,
    emoji: "🗂️",
  },
  {
    id: "years",
    value: lastYear - firstYear + 1,
    label: "years",
    note: `${firstYear} — ${lastYear}`,
    emoji: "⏳",
  },
  {
    id: "clusters",
    value: clusterTotal,
    label: "clusters",
    note: clusterNote ?? "Kubernetes, counted",
    emoji: "⎈",
  },
  {
    id: "regions",
    value: regionTotal,
    label: "regions",
    note: regionNote ?? "live edges",
    emoji: "🌏",
  },
  {
    id: "nodes",
    value: nodeCount,
    label: "named nodes",
    note: "machines I can still spell",
    emoji: "🖥️",
  },
  {
    id: "tools",
    value: toolset.size,
    label: "tools",
    note: "distinct across every stack",
    emoji: "🧰",
  },
];
