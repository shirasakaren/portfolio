/**
 * The half of Ren that has nothing to do with uptime.
 *
 * The About page is meant to make a stranger feel like they've met her, so this
 * file is treated with the same care as the CV data — favourites, opinions, and
 * the small animated reactions that punctuate them.
 */

/**
 * Every reaction clip in `public/ren/`. Each name resolves to four files:
 * `<file>.mp4`, `<file>.webm`, `<file>.webp` (animated) and
 * `<file>-poster.webp` (still).
 */
export const reactions = {
  wave: { file: "wave", alt: "Ren waving hello" },
  happyBounce: { file: "happy-bounce", alt: "Ren bouncing side to side" },
  cheekPuff: { file: "cheek-puff", alt: "Ren puffing her cheeks" },
  cheekPuffMove: {
    file: "cheek-puff-move",
    alt: "Ren puffing her cheeks and swaying",
  },
  sparkleEyes: { file: "sparkle-eyes", alt: "Ren with sparkling eyes" },
  shock: { file: "shock", alt: "Ren, completely shocked" },
  smug: { file: "smug", alt: "Ren smirking" },
  tsundere: { file: "tsundere", alt: "Ren looking away, unimpressed" },
  tsunderePause: { file: "tsundere-pause", alt: "Ren pausing, then relenting" },
  heartSkip: { file: "heart-skip", alt: "Ren's heart skipping a beat" },
  headShake: { file: "head-shake", alt: "Ren shaking her head" },
  shy: { file: "shy", alt: "Ren, shy" },
  hehe: { file: "hehe", alt: "Ren giggling" },
  delighted: { file: "delighted", alt: "Ren, delighted" },
  looking: { file: "looking", alt: "Ren looking right at you" },
} as const;

export type ReactionName = keyof typeof reactions;

export type Favourite = {
  id: string;
  /** Short label — the thing itself. */
  label: string;
  labelJa?: string;
  /** What kind of favourite this is. */
  category: string;
  emoji: string;
  /** One line, in her voice. Keep it under ~110 characters. */
  line: string;
  /** Optional second thing in the same category. */
  runnersUp?: string[];
  /** Accent for the card. */
  tone: "sakura" | "lilac" | "dandelion" | "matcha";
};

export const favourites: Favourite[] = [
  {
    id: "okonomiyaki",
    label: "Okonomiyaki",
    labelJa: "お好み焼き",
    category: "the dish",
    emoji: "🥞",
    line: "Whatever you like, grilled. A dish that lets you be picky on purpose — finally, a system designed for me.",
    tone: "dandelion",
  },
  {
    id: "matcha",
    label: "Matcha",
    labelJa: "抹茶",
    category: "the drink",
    emoji: "🍵",
    line: "Whisked, not stirred. Powers roughly 80% of all incident response I have ever performed.",
    tone: "matcha",
  },
  {
    id: "sora",
    label: "Sora",
    labelJa: "そら",
    category: "the cat",
    emoji: "🐈",
    line: "My cat. Walks across the keyboard mid-deploy. Has never once been blamed in a postmortem.",
    tone: "sakura",
  },
  {
    id: "loki",
    label: "Loki",
    category: "the character",
    emoji: "🗡️",
    line: "Marvel, and it was never close. Chaotic, over-engineered, weirdly competent. I see myself in the logs.",
    runnersUp: ["Marvel, always"],
    tone: "lilac",
  },
  {
    id: "anime",
    label: "One Piece",
    category: "the anime",
    emoji: "🏴‍☠️",
    line: "One Piece for the long haul, Hunter x Hunter for the arcs that rewire you, Bleach for the drip.",
    runnersUp: ["Hunter x Hunter", "Bleach"],
    tone: "sakura",
  },
  {
    id: "music",
    label: "YOASOBI",
    category: "on repeat",
    emoji: "🎧",
    line: "YOASOBI and Sayuri when I'm building. My Chemical Romance and Queen when it's already on fire.",
    runnersUp: ["Sayuri", "My Chemical Romance", "Queen"],
    tone: "lilac",
  },
  {
    id: "diving",
    label: "Scuba diving",
    category: "the escape",
    emoji: "🤿",
    line: "Forty minutes where absolutely nobody can page me. The only true maintenance window.",
    tone: "matcha",
  },
  {
    id: "archery",
    label: "Archery",
    category: "the discipline",
    emoji: "🏹",
    line: "Same skill as a good postmortem, really: aim carefully, release cleanly, then go look at where it landed.",
    tone: "dandelion",
  },
];

export type Trait = {
  id: string;
  label: string;
  emoji: string;
  line: string;
  /** Which reaction clip to show when this trait is opened. */
  reaction: ReactionName;
};

export const traits: Trait[] = [
  {
    id: "picky",
    label: "Picky eater",
    emoji: "🍽️",
    line: "I will read the whole menu and order the same thing. Determinism matters.",
    reaction: "cheekPuff",
  },
  {
    id: "travel",
    label: "Travels far too much",
    emoji: "✈️",
    line: "My budget is a burn-rate chart and I have never once optimised it. FinOps at work, chaos at home.",
    reaction: "shock",
  },
  {
    id: "bored",
    label: "Always bored at home",
    emoji: "🛋️",
    line: "Which is exactly how a homelab happens to a person.",
    reaction: "tsundere",
  },
  {
    id: "spiders",
    label: "Hates spiders",
    emoji: "🕷️",
    line: "I will SSH into a machine on fire at 3AM. I will not enter that room. Do not send screenshots.",
    reaction: "headShake",
  },
];

/** Opinions she'll defend, in the README's voice. */
export const opinions = [
  {
    claim: "Windows Server",
    verdict: "いやだ (nope)",
    line: "Don't know her.",
    emoji: "🚫",
  },
  {
    claim: "SELinux",
    verdict: "enforcing",
    line: "Permissive is a rumour.",
    emoji: "🔒",
  },
  {
    claim: "OpenTofu vs Terraform",
    verdict: "both",
    line: "Listing one is ideology. Listing both is seniority.",
    emoji: "⚖️",
  },
  {
    claim: "It's DNS",
    verdict: "always",
    line: "There's no way it's DNS. It was DNS.",
    emoji: "🌐",
  },
  {
    claim: "wrk",
    verdict: "lies to you",
    line: "Coordinated omission is real. Use wrk2.",
    emoji: "📉",
  },
  {
    claim: "PostgreSQL",
    verdict: "my one true database",
    line: "I tune autovacuum recreationally.",
    emoji: "🐘",
  },
];

/** The daily-driver rig, for the machines section. */
export const machines = [
  { label: "OS", value: "Arch Linux", note: "(btw)", emoji: "🐧" },
  { label: "Daily", value: "macOS + nix-darwin", emoji: "💻" },
  { label: "Server", value: "RHEL · Debian · Talos", emoji: "🖥️" },
  {
    label: "Redteam",
    value: "Kali",
    note: "own VLAN, responsible adult",
    emoji: "😈",
  },
  { label: "Shell", value: "zsh + starship + tmux + nvim", emoji: "⌨️" },
  { label: "Theme", value: "pink, obviously", emoji: "🌸" },
];
