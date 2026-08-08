/**
 * Every word on the site lives here, lifted from Ren's profile README so the
 * two never drift apart.
 */

export const profile = {
  name: "Shirasaka Ren",
  nameJa: "白坂れん",
  pronouns: "she/her",
  role: "DevOps · Security · Cloud · Servers",
  tagline: "laid-back until the pager goes off",
  blurb:
    "I keep the lights on — clusters, pipelines, and the boring-on-purpose infrastructure underneath. Kawaii on the outside, root on the inside.",
  lineageJa: "白坂のITを受け継ぐ、まったり系です。",
  lineageEn: "inheriting the Shirasaka IT lineage — the laid-back type",
  employer: "富士通 Fujitsu",
  location: "Kawasaki, Kanagawa 🗾",
  timezone: "JST UTC+09:00",
  email: "ren@shirasaka.work",
  github: "https://github.com/shirasakaren",
  githubHandle: "@shirasakaren",
  website: "https://ren.shirasaka.work",
  greetingJa: "よろしくおねがいします〜",
} as const;

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
  { emoji: "📉", text: "p99 latency is a personal insult. We're working through it." },
  { emoji: "🛏️", text: "Remote from my room — my sanctuary." },
  {
    emoji: "🤖",
    text: "If I do it twice by hand, the third time is a script. That's a promise.",
  },
] as const;

export const lineageNote = {
  title: "The Shirasaka lineage 白坂家",
  body: "A family that keeps IT knowledge and passes it down. For generations we've quietly sent brilliant minds into the industry to push it forward. I'm the branch that keeps the lights on: DevOps, Security, Cloud, Servers.",
} as const;

export type StackGroup = {
  id: string;
  title: string;
  emoji: string;
  note: string;
  items: string[];
};

export const stack: StackGroup[] = [
  {
    id: "clouds",
    title: "My six clouds",
    emoji: "☁️",
    note: "One landing-zone pattern each, zero snowflakes.",
    items: [
      "AWS",
      "Google Cloud",
      "Azure",
      "Alibaba Cloud",
      "Oracle Cloud",
      "IBM Cloud",
      "Cloudflare",
      "DigitalOcean",
      "OpenStack",
    ],
  },
  {
    id: "languages",
    title: "Languages I speak",
    emoji: "💻",
    note: "Bash starts with `set -euo pipefail` on line one. Always.",
    items: [
      "Python",
      "Go",
      "Rust",
      "C",
      "C++",
      "C#",
      "Java",
      "TypeScript",
      "JavaScript",
      "Bash",
      "Lua",
      "PowerShell",
      "Ruby",
      "PHP",
      "Kotlin",
      "Scala",
      "Elixir",
      "Zig",
      "Perl",
      "Haskell",
      "R",
      "Dart",
      "Swift",
      "SQL",
      "Nix",
      "HCL",
      "Rego",
      "PromQL",
      "CUE",
      "asm",
    ],
  },
  {
    id: "orchestration",
    title: "Containers & orchestration",
    emoji: "⎈",
    note: "I dream in YAML and argue with the scheduler at 3AM.",
    items: [
      "Kubernetes",
      "Docker",
      "Podman",
      "containerd",
      "Helm",
      "Kustomize",
      "Argo CD",
      "Argo Rollouts",
      "Flux CD",
      "OpenShift",
      "Rancher",
      "Talos Linux",
      "Cluster API",
      "Karpenter",
      "KEDA",
      "Kyverno",
      "Knative",
      "Crossplane",
      "etcd",
      "k9s",
    ],
  },
  {
    id: "iac",
    title: "Infrastructure as code",
    emoji: "🏗️",
    note: "OpenTofu and Terraform — listing only one is ideology, listing both is seniority.",
    items: [
      "Terraform",
      "OpenTofu",
      "Terragrunt",
      "Pulumi",
      "Ansible",
      "Ansible AWX",
      "Packer",
      "Vagrant",
      "Nix / NixOS",
      "Chef",
      "Puppet",
      "Salt",
      "GitHub Actions",
      "GitLab CI",
      "Jenkins",
      "Tekton",
      "Dagger",
      "Backstage",
      "Atlantis",
      "Renovate",
    ],
  },
  {
    id: "observability",
    title: "Observability",
    emoji: "📊",
    note: "Prometheus 3.x — native histograms, UTF-8 labels, OTLP receiver. I write `histogram_quantile` from memory.",
    items: [
      "Prometheus",
      "Grafana",
      "OpenTelemetry",
      "Loki",
      "Tempo",
      "Mimir",
      "Pyroscope",
      "Alloy",
      "Thanos",
      "VictoriaMetrics",
      "Jaeger",
      "Elasticsearch",
      "OpenSearch",
      "Kibana",
      "Fluent Bit",
      "Datadog",
      "New Relic",
      "Sentry",
      "Zabbix",
      "ClickHouse",
      "InfluxDB",
      "Netdata",
    ],
  },
  {
    id: "security",
    title: "Security",
    emoji: "🛡️",
    note: "I attack my own infra before someone else volunteers. SELinux stays enforcing.",
    items: [
      "Kali",
      "Burp Suite",
      "Wireshark",
      "Metasploit",
      "Nmap",
      "BloodHound",
      "Trivy",
      "Falco",
      "Semgrep",
      "Snyk",
      "SonarQube",
      "Vault",
      "OpenBao",
      "SOPS + age",
      "Sigstore cosign",
      "SLSA 1.2",
      "OPA / Rego",
      "Keycloak",
      "Prowler",
      "kube-bench",
      "OWASP",
      "YubiKey",
    ],
  },
  {
    id: "networking",
    title: "Networking & mesh",
    emoji: "🕸️",
    note: "It's not DNS · there's no way it's DNS · it was DNS.",
    items: [
      "Cilium eBPF",
      "Hubble",
      "Gateway API",
      "Istio ambient",
      "Linkerd",
      "Envoy",
      "Traefik",
      "NGINX",
      "HAProxy",
      "Kong",
      "WireGuard",
      "Tailscale",
      "cert-manager",
      "nftables",
    ],
  },
  {
    id: "performance",
    title: "Load & performance",
    emoji: "🏎️",
    note: "Plain `wrk` lies to you — coordinated omission is real, use `wrk2`.",
    items: [
      "k6",
      "Locust",
      "Gatling",
      "JMeter",
      "Vegeta",
      "wrk2",
      "fio",
      "iperf3",
      "perf + FlameGraph",
      "pgbench",
    ],
  },
  {
    id: "data",
    title: "Data & streaming",
    emoji: "🗄️",
    note: "PostgreSQL is my one true database — I tune autovacuum recreationally.",
    items: [
      "PostgreSQL",
      "CloudNativePG",
      "MySQL",
      "MariaDB",
      "MongoDB",
      "Redis",
      "Valkey",
      "Cassandra",
      "DynamoDB",
      "DuckDB",
      "Kafka",
      "Redpanda",
      "RabbitMQ",
      "Pulsar",
      "NATS JetStream",
      "Debezium CDC",
      "MinIO",
      "Ceph",
    ],
  },
  {
    id: "machines",
    title: "My machines",
    emoji: "🐧",
    note: "Shell: zsh + starship + tmux + nvim. Theme: pink, obviously.",
    items: [
      "Arch Linux",
      "macOS + nix-darwin",
      "RHEL",
      "Debian",
      "Ubuntu",
      "Fedora",
      "Gentoo",
      "NixOS",
      "Kali",
      "Talos",
      "Proxmox",
      "QEMU/KVM",
      "Vim / Neovim",
      "tmux",
      "Git",
    ],
  },
];

export const neofetch = `ren@sanctuary ~ $ neofetch --kawaii
  ╭───────────────────╮   OS      Arch Linux  (btw)
  │   ∧,,,∧           │   Daily   macOS + nix-darwin
  │  ( ̳• ·̫ • ̳)  ~♡    │   Server  RHEL · Debian · Talos
  │  /    \\>          |   Redteam Kali  (own VLAN, responsible adult)
  ╰───────────────────╯   Shell   zsh + starship + tmux + nvim
  Uptime  99.99%          Theme   pink, obviously 🌸
  Windows ✗ nemesis       Mood    ✧*｡٩(ˊᗜˋ*)و✧*｡`;

export const certs = [
  {
    group: "Cloud Native",
    emoji: "⎈",
    items: [
      "CKA",
      "CKS",
      "CKAD",
      "KCNA",
      "KCSA",
      "CGOA",
      "CAPA",
      "PCA",
      "ICA",
      "CCA",
      "OTCA",
      "CBA",
    ],
  },
  {
    group: "Cloud",
    emoji: "☁️",
    items: [
      "AWS SAP",
      "AWS DOP",
      "AWS SCS",
      "GCP PCA",
      "GCP DevOps",
      "AZ-104",
      "AZ-400",
      "AZ-500",
      "Terraform Assoc.",
      "Vault Assoc.",
    ],
  },
  {
    group: "Linux",
    emoji: "🐧",
    items: ["RHCSA", "RHCE", "LFCS", "LFCE"],
  },
  {
    group: "Security",
    emoji: "🛡️",
    items: [
      "OSCP",
      "OSEP",
      "CISSP",
      "CCSP",
      "GCIH",
      "GCIA",
      "Security+",
    ],
  },
] as const;

export const certsNote =
  "A roadmap, not a brag list — held, renewing, or hunting next. Fun 2026 fact: under CNCF's CARE program, passing CKS now auto-extends my CKA.";

/**
 * TODO(ren): swap these for real case studies when you're ready. They're written
 * as capability areas straight out of the README rather than invented client
 * work, so nothing here overclaims — but named projects with numbers will land
 * harder.
 */
export type Project = {
  slug: string;
  title: string;
  titleJa?: string;
  summary: string;
  detail: string;
  tags: string[];
  emoji: string;
};

export const projects: Project[] = [
  {
    slug: "landing-zones",
    title: "Six clouds, one landing zone",
    summary:
      "A single opinionated account/project baseline replicated across AWS, GCP, Azure, Alibaba, Oracle and IBM.",
    detail:
      "Identity, network topology, logging, guardrails and tagging expressed once in OpenTofu modules and specialised per provider. New environments come up from a pull request, not a runbook.",
    tags: ["OpenTofu", "Terragrunt", "Atlantis", "OPA / Rego"],
    emoji: "☁️",
  },
  {
    slug: "gitops-platform",
    title: "GitOps platform on Talos",
    summary:
      "Immutable Kubernetes nodes, Cluster API for lifecycle, Argo CD as the only thing with write access.",
    detail:
      "Cilium for networking and policy, Kyverno for admission, Argo Rollouts for progressive delivery. Nothing gets into a cluster without a signed commit and a passing policy check.",
    tags: ["Talos", "Cluster API", "Argo CD", "Cilium", "Kyverno"],
    emoji: "⎈",
  },
  {
    slug: "supply-chain",
    title: "Signed supply chain",
    summary:
      "SLSA-aligned build provenance with cosign signatures verified at admission time.",
    detail:
      "Reproducible container builds, SBOM generation, Trivy gates in CI, and a cluster that refuses to run an image it can't trace back to a commit.",
    tags: ["Sigstore cosign", "SLSA 1.2", "Trivy", "GitHub Actions"],
    emoji: "🛡️",
  },
  {
    slug: "observability",
    title: "Observability that answers questions",
    summary:
      "Prometheus 3.x with native histograms, traces in Tempo, logs in Loki, all correlated by exemplar.",
    detail:
      "Native histograms mean real p99s instead of bucket guesswork. Every alert links to the dashboard, the trace, and the runbook — because at 3AM nobody wants to go hunting.",
    tags: ["Prometheus", "Grafana", "Tempo", "Loki", "OpenTelemetry"],
    emoji: "📊",
  },
  {
    slug: "load-testing",
    title: "Load tests that don't lie",
    summary:
      "k6 and wrk2 harnesses built around coordinated-omission-correct measurement.",
    detail:
      "Open-model load generation, latency recorded against intended send time, and flame graphs from the same run so a regression points at a function instead of a vibe.",
    tags: ["k6", "wrk2", "perf + FlameGraph", "Grafana"],
    emoji: "🏎️",
  },
  {
    slug: "postgres",
    title: "PostgreSQL that stays boring",
    summary:
      "CloudNativePG clusters with tuned autovacuum, tested restores, and CDC out to Kafka.",
    detail:
      "Backups are only real when they've been restored, so restores run on a schedule against a scratch namespace and fail the pipeline if they don't.",
    tags: ["PostgreSQL", "CloudNativePG", "Debezium", "Kafka"],
    emoji: "🗄️",
  },
];

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
