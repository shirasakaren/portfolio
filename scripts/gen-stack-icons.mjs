/**
 * Bakes the brand marks referenced by `lib/content/stack.ts` into
 * `lib/stack-icons.ts`.
 *
 *   node scripts/gen-stack-icons.mjs
 *
 * Two sources, because Simple Icons has dropped several major vendor marks
 * (AWS, Azure, Oracle, IBM, OpenAI…) over trademark policy:
 *
 *   1. `simple-icons` — a single 24×24 path, already monochrome.
 *   2. `@iconify-json/logos` / `@iconify-json/devicon`, installed with
 *      --no-save purely for this script. Their bodies are full colour, so we
 *      keep only the `d` attributes and drop the fills; the site tints every
 *      mark itself, which is what keeps a wall of 140 logos from turning into
 *      confetti on a pink page.
 *
 * A slug that resolves to nothing is not an error — the Stack page falls back
 * to a monogram tile, which is why `crossplane`, `k9s` and friends are simply
 * absent below.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(resolve(ROOT, p), "utf8"));

/** Simple Icons slugs that don't exist there, mapped to an Iconify icon. */
const FALLBACKS = {
  amazonwebservices: ["logos", "aws", "#FF9900"],
  amazondynamodb: ["logos", "aws-dynamodb", "#4053D6"],
  microsoftazure: ["logos", "microsoft-azure", "#0089D6"],
  oracle: ["logos", "oracle", "#F80000"],
  ibm: ["logos", "ibm", "#052FAD"],
  openai: ["logos", "openai-icon", "#412991"],
  sonarqube: ["logos", "sonarqube", "#4E9BCD"],
  zabbix: ["logos", "zabbix", "#D40000"],
  csharp: ["logos", "c-sharp", "#512BD4"],
  powershell: ["devicon", "powershell", "#5391FE"],
};

const siData = read("node_modules/simple-icons/data/simple-icons.json");
const siList = Array.isArray(siData) ? siData : siData.icons;
const bySlug = new Map(siList.map((i) => [i.slug, i]));

/**
 * The metadata JSON carries the title and the brand hex but not the geometry;
 * that lives in the per-slug SVG next to it.
 */
function simpleIconPath(slug) {
  const p = resolve(ROOT, `node_modules/simple-icons/icons/${slug}.svg`);
  if (!existsSync(p)) return null;
  return /\sd="([^"]+)"/.exec(readFileSync(p, "utf8"))?.[1] ?? null;
}

const iconify = {};
for (const set of ["logos", "devicon"]) {
  const p = `node_modules/@iconify-json/${set}/icons.json`;
  if (existsSync(resolve(ROOT, p))) iconify[set] = read(p);
}

const source = readFileSync(resolve(ROOT, "lib/content/stack.ts"), "utf8");
const slugs = [
  ...new Set([...source.matchAll(/icon:\s*"([a-z0-9]+)"/g)].map((m) => m[1])),
].sort();

/**
 * A path that traces the whole viewBox is the artwork's background plate. It is
 * invisible in the original because something colourful sits on top of it;
 * flattened to one colour it would render as a solid block, so it goes.
 */
function isBackdrop(d, w, h) {
  const n = "\\s*-?[\\d.]+\\s*";
  return new RegExp(`^M${n}${n}[hH]${n}[vV]${n}[hH]?${n}?[zZ]$`).test(d.trim())
    ? d.includes(String(w)) || d.includes(String(h))
    : false;
}

/** Pull every `d` (plus its fill-rule, if any) out of a raw SVG body. */
function flatten(body, w, h) {
  return [...body.matchAll(/<path\b([^>]*)\/?>/g)]
    .map((m) => {
      const attrs = m[1];
      const d = /\sd="([^"]+)"/.exec(attrs)?.[1];
      if (!d || isBackdrop(d, w, h)) return null;
      const rule = /fill-rule="(evenodd|nonzero)"/.exec(attrs)?.[1];
      return rule === "evenodd" ? { d, evenOdd: true } : { d };
    })
    .filter(Boolean);
}

const entries = [];
const skipped = [];

for (const slug of slugs) {
  const si = bySlug.get(slug);
  const siPath = si && simpleIconPath(slug);
  if (si && siPath) {
    entries.push([
      slug,
      { title: si.title, hex: `#${si.hex}`, box: "0 0 24 24", paths: [{ d: siPath }] },
    ]);
    continue;
  }

  const fb = FALLBACKS[slug];
  const set = fb && iconify[fb[0]];
  const icon = set?.icons?.[fb[1]];
  if (!icon) {
    skipped.push(slug);
    continue;
  }
  const w = icon.width ?? set.width ?? 24;
  const h = icon.height ?? set.height ?? 24;
  const paths = flatten(icon.body, w, h);
  if (!paths.length) {
    skipped.push(slug);
    continue;
  }
  entries.push([
    slug,
    { title: fb[1], hex: fb[2], box: `0 0 ${w} ${h}`, paths },
  ]);
}

const fallbackNote = skipped.length
  ? ` — currently: ${skipped.join(", ")}`
  : "";

const body = entries
  .map(
    ([slug, v]) =>
      `  ${JSON.stringify(slug)}: {\n` +
      `    title: ${JSON.stringify(v.title)},\n` +
      `    hex: ${JSON.stringify(v.hex)},\n` +
      `    box: ${JSON.stringify(v.box)},\n` +
      `    paths: [${v.paths
        .map((p) => `{ d: ${JSON.stringify(p.d)}${p.evenOdd ? ", evenOdd: true" : ""} }`)
        .join(", ")}],\n` +
      `  },`,
  )
  .join("\n");

writeFileSync(
  resolve(ROOT, "lib/stack-icons.ts"),
  `/**
 * Brand marks for the Stack page, baked in at build time.
 *
 * GENERATED — do not edit. Run \`node scripts/gen-stack-icons.mjs\` after adding
 * an \`icon:\` slug to \`lib/content/stack.ts\`.
 *
 * ${entries.length} marks shipped out of the 3,400+ in \`simple-icons\`, flattened to
 * bare geometry so the page can tint them. Slugs with no mark available fall
 * back to a monogram tile${fallbackNote}.
 */

export type BrandIcon = {
  title: string;
  /** The brand's own colour. Used on hover, never at rest. */
  hex: string;
  box: string;
  paths: { d: string; evenOdd?: boolean }[];
};

export const brandIcons: Record<string, BrandIcon> = {
${body}
};

export function brandIcon(slug: string | undefined): BrandIcon | undefined {
  return slug ? brandIcons[slug] : undefined;
}
`,
);

console.log(
  `lib/stack-icons.ts — ${entries.length} marks` +
    (skipped.length ? `, ${skipped.length} falling back: ${skipped.join(", ")}` : ""),
);
