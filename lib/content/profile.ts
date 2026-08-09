/**
 * Who Ren is, in the few facts that repeat everywhere.
 *
 * Sourced from her profile README plus the CV. Anything that appears on more
 * than one page lives here so the site can never contradict itself.
 */

export const profile = {
  name: "Shirasaka Ren",
  nameJa: "白坂れん",
  pronouns: "she/her",
  role: "DevOps · Security · Cloud · Servers",
  /** The one-line version, from the CV headline. */
  headline:
    "Platform · DevSecOps · SRE — physical L1/L2 through to L5/L7, across six clouds",
  tagline: "laid-back until the pager goes off",
  blurb:
    "I keep the lights on — clusters, pipelines, and the boring-on-purpose infrastructure underneath. Kawaii on the outside, root on the inside.",
  lineageJa: "白坂のITを受け継ぐ、まったり系です。",
  lineageEn: "inheriting the Shirasaka IT lineage — the laid-back type",
  location: "Kawasaki, Kanagawa 🗾",
  workingStyle: "Remote from my room — my sanctuary.",
  timezone: "JST UTC+09:00",
  email: "ren@shirasaka.work",
  github: "https://github.com/shirasakaren",
  githubHandle: "@shirasakaren",
  website: "https://ren.shirasaka.work",
  greetingJa: "よろしくおねがいします〜",
  /** Where the career clock starts — used to derive "N years" on the fly. */
  careerStart: "2022-10-01",
} as const;

export const lineageNote = {
  title: "The Shirasaka lineage",
  titleJa: "白坂家",
  body: "A family that keeps IT knowledge and passes it down. For generations we've quietly sent brilliant minds into the industry to push it forward. I'm the branch that keeps the lights on: DevOps, Security, Cloud, Servers.",
} as const;

/**
 * Years since `careerStart`, so the number never goes stale.
 *
 * Rounded rather than floored: eleven months into a year, "3" is further from
 * the truth than "4", and the timeline right below it shows every date anyway.
 */
export function yearsOfExperience(now: Date = new Date()): number {
  const start = new Date(profile.careerStart);
  const years = (now.getTime() - start.getTime()) / (365.2425 * 864e5);
  return Math.max(1, Math.round(years));
}

/** The README's about-me bullets, verbatim in spirit. */
export const aboutPoints = [
  { emoji: "🌸", text: "My terminal is pink. So is my entire room." },
  {
    emoji: "⚡",
    text: 'I fix prod at 3AM in fuzzy socks and call it "incident command."',
  },
  {
    emoji: "🐧",
    text: "Windows? Don't know her. I dual-boot Arch and more Arch.",
  },
  {
    emoji: "💬",
    text: "Fluent in YAML, native in Japanese, lethal in PR review.",
  },
  {
    emoji: "📉",
    text: "p99 latency is a personal insult. We're working through it.",
  },
  { emoji: "🛏️", text: "Remote from my room — my sanctuary." },
  {
    emoji: "🤖",
    text: "If I do it twice by hand, the third time is a script. That's a promise.",
  },
] as const;

/** The four things every page eventually points back at. */
export const pillars = [
  {
    id: "cloud",
    emoji: "☁️",
    title: "Cloud foundations",
    short: "Six clouds, no snowflakes",
    body: "Landing zones, identity, network topology and guardrails — expressed once in code, specialised per provider.",
  },
  {
    id: "platform",
    emoji: "⎈",
    title: "Platform & delivery",
    short: "GitOps all the way down",
    body: "Kubernetes people actually enjoy shipping to: progressive delivery, policy at admission, immutable nodes underneath.",
  },
  {
    id: "security",
    emoji: "🛡️",
    title: "Security engineering",
    short: "I attack my own infra first",
    body: "Signed supply chains, secrets that never touch a repo, runtime detection that pages a human and a playbook at once.",
  },
  {
    id: "reliability",
    emoji: "📊",
    title: "Reliability & observability",
    short: "Alerts that arrive with the answer",
    body: "Native histograms, honest load tests, correlated traces and logs. Every alert ships with its dashboard and runbook.",
  },
] as const;

export const neofetch = `ren@sanctuary ~ $ neofetch --kawaii
  ╭───────────────────╮   OS      Arch Linux  (btw)
  │   ∧,,,∧           │   Daily   macOS + nix-darwin
  │  ( ̳• ·̫ • ̳)  ~♡    │   Server  RHEL · Debian · Talos
  │  /    \\>          |   Redteam Kali  (own VLAN, responsible adult)
  ╰───────────────────╯   Shell   zsh + starship + tmux + nvim
  Uptime  99.99%          Theme   pink, obviously 🌸
  Windows ✗ nemesis       Mood    ✧*｡٩(ˊᗜˋ*)و✧*｡`;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/stack", label: "Stack" },
  { href: "/contact", label: "Contact" },
] as const;

export const pgpPublicKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQENBGp3VOoBCAC8plQQRli3DeKuExoF3CjkJZQ8yxCNeCS9QACiTnntcXgLcn6S
TxYJLiEtiMFCa2UMEnhE7ZEBvyD8rfIJFyQXQ8g9akGL53Lipoo9wSpEqUOTD8l7
ABdJ/1I/U1UAY9zzyPm8abJZv/OMDcNYBZ4lgnNQWJhyAG32u9/pq3fWCM2o5So/
KDGqYbhYOqa6z73qHbfOZQBVFOhFkKULTqrXeCxiiu7jNcw33pCFiD7qYjsuU3+h
9Nrq0/qEqVAgQLVjYIfgNxg0Ckr0soxW1YCqeheCbs6ZZAhR8Y0JiHgSx3OOcw9I
jFe6ST2/TRZRyrVvUequU5N9CZYZ7qefP+fnABEBAAG0MlNoaXJhc2FrYSBSZW4g
KEdlbmVyYWwgVXNhZ2UpIDxyZW5Ac2hpcmFzYWthLndvcms+iQFtBBMBCABXFiEE
1qJ76QAK4nYusyGQSWLy+5pT2tkFAmp3VOobFIAAAAAABAAObWFudTIsMi41KzEu
MTIsMCwzAhsDBQsJCAcCAiICBhUKCQgLAgQWAgMBAh4HAheAAAoJEEli8vuaU9rZ
wEQH/2eFQbDva+e0NCXaO+aa46RoyphGqMWHRqJ0WXKhl/FFy4WDj7eXFliQ2y2Y
xKTYGC6OZTlV2fLyTnHatgtTANgUzNqXCvo51lPLIMDhHb9qwN8cep0OuzU3a00u
K97mUuOrrU4YimnyGdZsbJNgbApHAAFK9aCE/0p6lk9FzVGJHyMgO7r+jNLpzF9p
U5MyHRNyo4XMF/+fLK1v0inLPVHcs27s8S5GMA3hm2eG+sNCq8syi77kjTJRzoSF
EoRj4hckf4Rv1UBSzwOzFwPvRjs7s/X00ciA1aGjRPh39xFwQw9PbYFICTuzvxjN
ZV2ZjvTQScH2d8pFnXWeNk5VxSK5AQ0EandU6gEIALy5/iJ2FKBg06jpH6LPK9um
23Qm/svmW27CCtyJ828YfTOJMTlx5UEj1y+I2O1NuhVNpO6MlLptNKr7oEtRX4YC
ffXvvD6B/PwYHIKJS9BFWP/vkt1cTe35EW7B0kHdJWLS6Wgu+Ocd02suyPu4XPDS
sQ1kDTHX/t69PEw03o39USp36KeW7OXjt/ij7l+pBSLxVX/eb4Pb4/qcnH4u0b5w
Wmko9S9w4CLIpDJtmMYBm/dfIk8HbCpP6K3BOf/ARbu/ZnnfvWpNsKQqWJ4aR/OF
T6QpFXJ7a/k9/QUKXxQPvmKzKtSyckMgwMScf0pFNx0C0DHXfHOvAB4ziESpFIUA
EQEAAYkBUgQYAQgAPBYhBNaie+kACuJ2LrMhkEli8vuaU9rZBQJqd1TqGxSAAAAA
AAQADm1hbnUyLDIuNSsxLjEyLDAsMwIbDAAKCRBJYvL7mlPa2So4B/sEKdbhYKYZ
IDQ+1dhcQNAaeaMO21YgvIupM4Nzk1zAAptD1I6SyRfCRd/P6jdUOgP1cErQouHc
ZZNk72iH2m8nubMlwabIBevkg9fdkYYH+VPIt3BtJPm+alXonqrMHJwzgAQj1oMa
sQe5fdLGBgZz+AHPSzFPsjajcp02pvT1/fKARznBr4kgQyLIu6ri1f5QQoX2+xOt
Yxd3ss+kvtVcjCnpoWlT/DpH008qBeNOyTe4nyzRJGP2Zu0BgL4uaByc/CwnZB54
MgdrgCQ+EUF3KDBrqgYxmXFGro5L4mW5Y7692GgCnVlLpyx1dZO2ZaLJYjqR5yO9
VS+1WO2ScMC7
=9Vgv
-----END PGP PUBLIC KEY BLOCK-----`;
