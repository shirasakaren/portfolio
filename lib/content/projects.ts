/**
 * The work, written up as a quest log.
 *
 * Two shapes live here. Products have screenshots and a URL you can visit;
 * infrastructure has an architecture diagram and a rack of named machines. The
 * Projects page renders both from this one list so the filters, the counters
 * and the detail routes never drift out of sync.
 *
 * Everything is drawn from the real repositories, READMEs and Excalidraw
 * diagrams — the node names, the specs and the service lists are as-built.
 */

/**
 * Several source repositories are published under Ren's legal name. Flip this
 * to true to surface those links; left off by default so the site keeps to the
 * one identity it presents everywhere else.
 */
export const SHOW_LEGAL_NAME_LINKS = false;

export type ProjectKind = "product" | "infrastructure";

/** Sizes the card and the glow. Purely a presentation grade. */
export type Tier = "legendary" | "epic" | "rare";

export type Shot = {
  /** Path under /public. */
  src: string;
  /** Smaller variant for the grid. */
  thumb?: string;
  alt: string;
  caption: string;
  /** width / height. */
  aspect: number;
};

export type Clip = {
  mp4: string;
  webm?: string;
  poster: string;
  alt: string;
  caption: string;
  aspect: number;
};

export type Diagram = {
  /** Preferred vector source, when one is small enough to ship. */
  svg?: string;
  /** Raster fallback / zoom target. */
  raster: string;
  preview?: string;
  alt: string;
  aspect: number;
  /**
   * Set when the source diagram carries a "not for public distribution"
   * notice. The page renders a sealed card instead of the image.
   */
  sealed?: boolean;
  sealedReason?: string;
};

export type StatBar = {
  label: string;
  /** 0–100. Where the effort went, not a score. */
  value: number;
};

export type ProjectLink = {
  label: string;
  href: string;
  kind: "live" | "repo" | "docs";
  /** Published under the legal name — gated by SHOW_LEGAL_NAME_LINKS. */
  legalName?: boolean;
};

export type Project = {
  slug: string;
  title: string;
  titleJa?: string;
  /** Six words or fewer. Sits under the title on the card. */
  kicker: string;
  kind: ProjectKind;
  tier: Tier;
  emoji: string;
  /** Years the work spans, as displayed. */
  year: string;
  role: string;
  org: string;
  status: "live" | "internal" | "shipped";
  /** One sentence for the card. */
  summary: string;
  /** Two or three short paragraphs for the detail view. */
  story: string[];
  /** The headline numbers. Rendered as a stat block. */
  facts: { label: string; value: string; note?: string }[];
  /** RPG-ish bars: where the engineering effort actually went. */
  focus: StatBar[];
  stack: string[];
  links: ProjectLink[];
  shots?: Shot[];
  clips?: Clip[];
  diagram?: Diagram;
  /** Named machines, for the infrastructure builds. */
  nodes?: { name: string; role: string; spec?: string }[];
};

const ATLAS_SHOT = (
  file: string,
  caption: string,
  alt: string,
  aspect = 1600 / 870,
): Shot => ({
  src: `/projects/atlas/${file}.webp`,
  thumb: `/projects/atlas/${file}-thumb.webp`,
  alt,
  caption,
  aspect,
});

export const projects: Project[] = [
  {
    slug: "atlas",
    title: "MGM Atlas",
    kicker: "Four SaaS tools, one self-hosted app",
    kind: "product",
    tier: "legendary",
    emoji: "🧭",
    year: "2025 — 2026",
    role: "Head of IT Infrastructure & Architecture",
    org: "MGM Laboratory",
    status: "live",
    summary:
      "The lab's project HQ: portfolio, chat, PMO and voice in one place, so nobody pays for Jira and Slack anymore.",
    story: [
      "A research lab was losing its team between four subscriptions. Atlas replaces all of them with one self-hosted app — Netflix-style project discovery, Slack-style chat, a ClickUp-style PMO with kanban, Gantt, notes and collaborative whiteboards, and Discord-style voice rooms with screen share.",
      "I owned the architecture and the infrastructure underneath: a NestJS API with 15 feature modules, 41 controllers and 48 Prisma models, three Socket.IO namespaces, a Yjs sidecar for live collaborative documents, LiveKit as the WebRTC SFU with egress recording, and Keycloak in front of all of it.",
      "It runs on the lab's own hardware, behind its own reverse proxy, with presigned S3 uploads and VAPID push straight to the browser. No vendor holds the data.",
    ],
    facts: [
      { label: "Feature modules", value: "15" },
      { label: "REST controllers", value: "41" },
      { label: "Prisma models", value: "48" },
      { label: "Internal users", value: "100+" },
    ],
    focus: [
      { label: "Scale", value: 78 },
      { label: "Realtime", value: 92 },
      { label: "Security", value: 80 },
      { label: "Craft", value: 88 },
    ],
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "NestJS",
      "Prisma",
      "PostgreSQL",
      "Socket.IO",
      "LiveKit",
      "Keycloak",
      "Yjs",
      "Redis",
      "S3",
      "Docker",
    ],
    links: [
      { label: "atlas.labmgm.org", href: "https://atlas.labmgm.org", kind: "live" },
    ],
    shots: [
      ATLAS_SHOT(
        "dashboard-main-view",
        "Discovery dashboard — what the lab is building right now",
        "Atlas discovery dashboard with a featured project hero",
        1600 / 867,
      ),
      ATLAS_SHOT(
        "detailed-project-page-header-main",
        "Project detail — media hero, tabs, team and phases",
        "Atlas project detail page",
      ),
      ATLAS_SHOT(
        "general-workspace-chat-channel",
        "Workspace chat, with the voice lobby attached",
        "Atlas #general chat channel",
      ),
      ATLAS_SHOT(
        "pmo-kanban",
        "Drag-and-drop kanban with custom statuses",
        "Atlas kanban board",
      ),
      ATLAS_SHOT(
        "pmo-timelines-gantt",
        "Gantt timelines, live-synced between teammates",
        "Atlas Gantt timeline",
      ),
      ATLAS_SHOT(
        "pmo-whiteboards",
        "Collaborative whiteboards, backed by Yjs",
        "Atlas whiteboard",
      ),
      ATLAS_SHOT(
        "voice-chat",
        "Voice, video and screen share on LiveKit",
        "Atlas voice channel",
        1598 / 867,
      ),
      ATLAS_SHOT(
        "pmo-files-storage",
        "Per-project file manager on presigned S3",
        "Atlas file storage",
      ),
    ],
  },

  {
    slug: "a-thousand-rallies",
    title: "A Thousand Rallies",
    kicker: "A game platform on three continents",
    kind: "infrastructure",
    tier: "legendary",
    emoji: "🎮",
    year: "2025",
    role: "Infrastructure architect",
    org: "Estella Studio",
    status: "shipped",
    summary:
      "Multi-region delivery for a Unity title — on-prem Kubernetes first, AWS EKS as the fallback, three exit nodes across ID, DE and US.",
    story: [
      "A game needs to feel local everywhere. Rallies runs behind Cloudflare with three regional load-balancer/exit nodes — Sora in Jakarta, Shion in Frankfurt, Suisei in Ohio — fronting the web game, the marketing site and the back-end services.",
      "The compute is deliberately hybrid: two on-prem Kubernetes clusters (Acheron and Mirai, the latter 48C/96T) carry normal load, and two AWS EKS clusters (Kawa and Mori) stand by to take over if the on-prem side fails. Assets live in Cloudflare R2.",
      "The Unity side is wired in as a first-class citizen — Unity DevOps, VCS, Accelerator, Analytics and Cloud Diagnostics — so artists, designers and playtesters all land in the same pipeline as the engineers. Tetragon watches runtime; Terraform and GitHub Actions own everything else.",
    ],
    facts: [
      { label: "Regions", value: "3", note: "ID · DE · US" },
      { label: "K8s clusters", value: "4", note: "2 on-prem, 2 EKS" },
      { label: "Biggest node", value: "48C / 96T", note: "Mirai" },
      { label: "Asset store", value: "Cloudflare R2" },
    ],
    focus: [
      { label: "Scale", value: 90 },
      { label: "Resilience", value: 95 },
      { label: "Security", value: 72 },
      { label: "Automation", value: 84 },
    ],
    stack: [
      "Kubernetes",
      "AWS EKS",
      "Cloudflare",
      "Cloudflare R2",
      "Terraform",
      "GitHub Actions",
      "Tetragon",
      "Unity",
      "Docker",
      "Prometheus",
    ],
    links: [],
    diagram: {
      raster: "/projects/diagrams/a-thousand-rallies.webp",
      preview: "/projects/diagrams/a-thousand-rallies-preview.webp",
      alt: "A Thousand Rallies infrastructure diagram — multi-region load balancing, on-prem and EKS Kubernetes clusters, Unity DevOps pipeline",
      aspect: 4986.667 / 1763.333,
    },
    nodes: [
      { name: "Mirai", role: "On-prem Kubernetes", spec: "48C / 96T · 64 GiB" },
      { name: "Acheron", role: "On-prem Kubernetes", spec: "2C / 4T · 12 GiB" },
      { name: "Kawa", role: "AWS EKS", spec: "a1.metal" },
      { name: "Mori", role: "AWS EKS", spec: "a1.metal" },
      { name: "Sora", role: "Load balancer · exit node", spec: "Jakarta, ID" },
      { name: "Shion", role: "Load balancer · exit node", spec: "Frankfurt, DE" },
      { name: "Suisei", role: "Load balancer · exit node", spec: "Ohio, US" },
      { name: "Yume", role: "Cloud utility", spec: "2 vCPU · 1 GiB" },
      { name: "Asa · Hiru · Yoru", role: "Cloud utility", spec: "2 vCPU · 1 GiB each" },
    ],
  },

  {
    slug: "kaizin-platform",
    title: "Kaizin Platform",
    kicker: "GKE, but it defends itself",
    kind: "infrastructure",
    tier: "legendary",
    emoji: "🛡️",
    year: "2023 — 2024",
    role: "Site Reliability Engineer",
    org: "Kaizin Digital",
    status: "internal",
    summary:
      "A GKE platform wired end to end: observability, runtime security with automatic response, FinOps governance and an AI on-call that phones a human.",
    story: [
      "The brief was reliability, but reliability without security is theatre. This platform runs on GKE with Anthos Service Mesh, Config Sync and Policy Controller — everything reaches the cluster through Cloud Build, Cloud Deploy and Terraform pull requests, nothing by hand.",
      "Telemetry funnels through an OpenTelemetry collector into Prometheus, Jaeger, Elastic and Grafana. Tetragon watches syscalls at runtime and feeds a SIEM, which drives SOAR playbooks that can push a WAF block rule, revoke tokens, rotate Vault secrets, quarantine a namespace, cordon nodes or trigger a CI/CD rollback — before anyone has opened a laptop.",
      "Alongside it: FinOps with billing exported to BigQuery and quarterly reviews, CIS Kubernetes controls mapped to ISO 27001 and SOC 2, and an AI agent that reaches a human on Discord or by phone with text-to-speech when a playbook needs a decision.",
    ],
    facts: [
      { label: "Control plane", value: "GKE + Anthos" },
      { label: "MTTR", value: "↓", note: "blameless postmortems, error budgets" },
      { label: "Autoscaling", value: "HPA + VPA" },
      { label: "Compliance", value: "CIS → ISO 27001 / SOC 2" },
    ],
    focus: [
      { label: "Reliability", value: 95 },
      { label: "Security", value: 96 },
      { label: "Automation", value: 90 },
      { label: "FinOps", value: 78 },
    ],
    stack: [
      "GKE",
      "Anthos Service Mesh",
      "Config Sync",
      "Terraform",
      "Cloud Build",
      "OpenTelemetry",
      "Prometheus",
      "Jaeger",
      "Grafana",
      "Elasticsearch",
      "Tetragon",
      "Vault",
      "Cloudflare",
      "BigQuery",
    ],
    links: [],
    diagram: {
      raster: "/projects/diagrams/kaizin.webp",
      preview: "/projects/diagrams/kaizin-preview.webp",
      alt: "Kaizin platform architecture diagram",
      aspect: 6420 / 4526.667,
      sealed: true,
      sealedReason:
        "The source diagram carries a not-for-public-distribution notice. Happy to walk through it live.",
    },
  },

  {
    slug: "asset-library",
    title: "MGM Asset Library",
    kicker: "A private Unity Asset Store",
    kind: "product",
    tier: "epic",
    emoji: "📦",
    year: "2025 — 2026",
    role: "Architect & platform engineer",
    org: "MGM Laboratory",
    status: "live",
    summary:
      "An internal asset library for a research lab — with editor plugins that pull assets straight into Unity and Unreal.",
    story: [
      "Four repositories, one product: a NestJS API, a Next.js client, and native editor plugins for Unity and Unreal so an artist never leaves their tool to fetch an asset.",
      "The interesting half is the pipeline. Every upload runs through BullMQ workers — analyser, antivirus scan, glTF conversion, thumbnail generation, search indexing, notification fan-out and archive purge — across Postgres, MongoDB, Redis, S3 and Meilisearch, with a WebSocket gateway pushing progress back to the browser.",
      "Keycloak gates everything except the about page. Admin actions are audit-logged by interceptor, destructive ones need explicit confirmation, and the API ships as two images so workers scale separately from the request path.",
    ],
    facts: [
      { label: "Repositories", value: "4", note: "API · web · Unity · Unreal" },
      { label: "Worker queues", value: "8" },
      { label: "Datastores", value: "5", note: "PG · Mongo · Redis · S3 · Meili" },
      { label: "Locales", value: "EN · ID" },
    ],
    focus: [
      { label: "Pipeline", value: 92 },
      { label: "Security", value: 85 },
      { label: "Scale", value: 74 },
      { label: "Craft", value: 80 },
    ],
    stack: [
      "NestJS",
      "Next.js",
      "Prisma",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "BullMQ",
      "Meilisearch",
      "MinIO",
      "Keycloak",
      "Unity",
      "Unreal Engine",
      "Docker",
    ],
    links: [
      { label: "asset.labmgm.org", href: "https://asset.labmgm.org", kind: "live" },
    ],
  },

  {
    slug: "tenki",
    title: "Tenki Weather",
    titleJa: "天気",
    kicker: "An anime weather forecast that talks",
    kind: "product",
    tier: "epic",
    emoji: "🌤️",
    year: "2025",
    role: "Full-stack & infrastructure",
    org: "Personal",
    status: "live",
    summary:
      "A Unity WebGL chatbot with a lip-synced anime presenter, Indonesian text-to-speech, and a 48-worker batch pipeline for spreadsheets.",
    story: [
      "Ask Tenki-Chan about the weather in plain Indonesian. An LLM classifies the intent under a strict JSON-only schema, WeatherAPI resolves the location by name or coordinates, and ElevenLabs speaks the answer back while uLipSync drives the character's mouth.",
      "The part nobody expects is the batch mode: drop in a CSV or XLSX of place names and it fans out across a 48-worker pool with retry, backoff and jitter, then hands back a spreadsheet — all inside WebGL, with its own file-picker and download bridge.",
      "It ships as a single WebGL build behind a Terraform-managed Azure load balancer, with Prometheus and Grafana watching, GitHub Actions building the image, and a cache in front of the assets.",
    ],
    facts: [
      { label: "Engine", value: "Unity 6", note: "6000.2.3f1, WebGL only" },
      { label: "Batch workers", value: "48", note: "retry + backoff + jitter" },
      { label: "Licence", value: "MIT" },
      { label: "Status", value: "Production-ready" },
    ],
    focus: [
      { label: "Craft", value: 90 },
      { label: "Integration", value: 86 },
      { label: "Automation", value: 70 },
      { label: "Scale", value: 58 },
    ],
    stack: [
      "Unity",
      "C#",
      "WebGL",
      "OpenAI",
      "ElevenLabs",
      "Terraform",
      "Azure",
      "Docker",
      "Prometheus",
      "Grafana",
      "GitHub Actions",
    ],
    links: [
      { label: "tenki.live", href: "https://tenki.live", kind: "live" },
      {
        label: "Source",
        href: "https://github.com/muhammadIdhamMaarif/Tenki-Weather",
        kind: "repo",
        legalName: true,
      },
    ],
    shots: [
      {
        src: "/projects/tenki/hero.webp",
        thumb: "/projects/tenki/hero-thumb.webp",
        alt: "Tenki Weather home screen with the Tenki-Chan presenter",
        caption: "Tenki-Chan, rigged, lip-synced and waiting for a question",
        aspect: 2559 / 1420,
      },
      {
        src: "/projects/tenki/AlurChat.webp",
        thumb: "/projects/tenki/AlurChat-thumb.webp",
        alt: "Tenki Weather chat flow",
        caption: "Intent classification, then a forecast, then speech",
        aspect: 2559 / 1424,
      },
      {
        src: "/projects/tenki/UploadFile.webp",
        thumb: "/projects/tenki/UploadFile-thumb.webp",
        alt: "Tenki Weather batch upload screen",
        caption: "Batch mode — CSV or XLSX in, spreadsheet out",
        aspect: 2559 / 1407,
      },
      {
        src: "/projects/tenki/CaraPakai.webp",
        thumb: "/projects/tenki/CaraPakai-thumb.webp",
        alt: "Tenki Weather usage guide",
        caption: "The whole thing is one WebGL build",
        aspect: 2559 / 1416,
      },
    ],
    clips: [
      {
        mp4: "/projects/tenki/weatherresult.mp4",
        webm: "/projects/tenki/weatherresult.webm",
        poster: "/projects/tenki/weatherresult-poster.webp",
        alt: "Tenki Weather answering a forecast question",
        caption: "Asking for a forecast",
        aspect: 852 / 480,
      },
      {
        mp4: "/projects/tenki/uploadfile.mp4",
        webm: "/projects/tenki/uploadfile.webm",
        poster: "/projects/tenki/uploadfile-poster.webp",
        alt: "Tenki Weather batch upload in progress",
        caption: "Batch processing a spreadsheet",
        aspect: 852 / 480,
      },
    ],
    diagram: {
      svg: "/projects/diagrams/tenki.svg",
      raster: "/projects/diagrams/tenki.webp",
      preview: "/projects/diagrams/tenki-preview.webp",
      alt: "Tenki infrastructure diagram — Azure load balancing, VPC, Terraform, Prometheus and Grafana",
      aspect: 4066.667 / 2546.667,
    },
    nodes: [
      { name: "Midori", role: "Application node" },
      { name: "Aka", role: "Application node" },
      { name: "db-central", role: "Database" },
    ],
  },

  {
    slug: "estella-dc",
    title: "Estella Data Centre",
    kicker: "Concrete, cooling, then Kubernetes",
    kind: "infrastructure",
    tier: "epic",
    emoji: "🏢",
    year: "2024 — 2026",
    role: "Senior DevOps Engineer",
    org: "Estella Studio",
    status: "internal",
    summary:
      "Built from an empty room: A+B power, HVAC, structured cabling, VLANs, Proxmox clusters — and a public Arch Linux mirror on top.",
    story: [
      "This one started with a floor plan. Rack and stack, redundant A+B power with UPS and PDUs, HVAC and humidity control, structured cabling, then VLANs and L2/L3 routing before a single virtual machine existed.",
      "Above that: Proxmox VE clusters running Windows Server alongside Arch and Debian, an on-prem Kubernetes footprint, and remote access locked behind Tailscale and WireGuard with Nginx terminating in front. Cloudflare proxies the edge; Sora is the load balancer and exit node.",
      "Then the fun part — hosting an official Arch Linux mirror at high-volume uptime, with cron-driven backups landing in object storage and a secondary archive keeping seven rolling copies.",
    ],
    facts: [
      { label: "Power", value: "A + B", note: "UPS + PDU redundant feeds" },
      { label: "Hypervisor", value: "Proxmox VE" },
      { label: "Backups", value: "7 rolling", note: "cron → object storage" },
      { label: "Public service", value: "Arch mirror" },
    ],
    focus: [
      { label: "Physical", value: 96 },
      { label: "Networking", value: 88 },
      { label: "Reliability", value: 85 },
      { label: "Automation", value: 70 },
    ],
    stack: [
      "Proxmox VE",
      "Kubernetes",
      "Tailscale",
      "WireGuard",
      "NGINX",
      "Cloudflare",
      "Prometheus",
      "Grafana",
      "GitHub Actions",
      "Docker",
      "Arch Linux",
      "Debian",
    ],
    links: [],
    diagram: {
      svg: "/projects/diagrams/estella.svg",
      raster: "/projects/diagrams/estella.webp",
      preview: "/projects/diagrams/estella-preview.webp",
      alt: "Estella infrastructure diagram — on-premise and cloud, load balancing, backups and monitoring",
      aspect: 3913.333 / 2740,
    },
    nodes: [
      { name: "Sora", role: "Load balancer · exit node" },
      { name: "acheron-server", role: "On-prem compute" },
      { name: "natsu", role: "On-prem node" },
      { name: "mizu", role: "On-prem node" },
      { name: "fuyu", role: "On-prem node" },
      { name: "db-central", role: "Database" },
      { name: "Linux mirror", role: "Public Arch Linux mirror" },
    ],
  },

  {
    slug: "calendar",
    title: "MGM Calendar",
    kicker: "Recurrence, done properly",
    kind: "product",
    tier: "rare",
    emoji: "📅",
    year: "2025",
    role: "Full-stack",
    org: "MGM Laboratory",
    status: "live",
    summary:
      "A public event calendar and admin panel — Go and Postgres behind it, real iCal recurrence rules, Indonesian public holidays seeded on first boot.",
    story: [
      "A Go (chi) API on PostgreSQL with golang-migrate, S3 attachments and HS256 sessions, plus a Next.js front end with a TipTap editor that speaks images, audio, YouTube and file attachments.",
      "Recurrence is the part everyone gets wrong. Events carry iCal RRULE strings, expanded server-side up to two years out, with children regenerated whenever the parent rule changes. On first boot it fetches this year's and next year's Indonesian public holidays in the background.",
    ],
    facts: [
      { label: "API", value: "Go + chi" },
      { label: "Recurrence", value: "iCal RRULE", note: "expanded 2 years out" },
      { label: "Editor", value: "TipTap" },
      { label: "Seeded", value: "ID holidays" },
    ],
    focus: [
      { label: "Correctness", value: 88 },
      { label: "Craft", value: 74 },
      { label: "Scale", value: 45 },
      { label: "Automation", value: 60 },
    ],
    stack: [
      "Go",
      "PostgreSQL",
      "Next.js",
      "TypeScript",
      "TipTap",
      "AWS S3",
      "Docker",
    ],
    links: [],
  },

  {
    slug: "filca",
    title: "FILCA",
    kicker: "Three environments, one pipeline",
    kind: "infrastructure",
    tier: "rare",
    emoji: "🛒",
    year: "2025",
    role: "Infrastructure engineer",
    org: "Estella Studio",
    status: "internal",
    summary:
      "Production, shop and testing environments behind one load balancer, with builds pushed by GitHub Actions and alerts landing in Discord.",
    story: [
      "A compact three-environment topology — FILCA production, FILCA shop and a testing tier — all served through Sora, the load balancer and exit node, with authentication in front and db-central behind.",
      "Developers push, GitHub Actions builds the Docker image, acheron-server watches and rolls it forward. Sellers and end users hit the same edge; the team hears about it in Discord.",
    ],
    facts: [
      { label: "Environments", value: "3" },
      { label: "CI", value: "GitHub Actions" },
      { label: "Alerting", value: "Discord" },
      { label: "Edge", value: "Sora" },
    ],
    focus: [
      { label: "Delivery", value: 82 },
      { label: "Reliability", value: 70 },
      { label: "Security", value: 65 },
      { label: "Automation", value: 78 },
    ],
    stack: ["Docker", "GitHub Actions", "NGINX", "PostgreSQL", "Linux"],
    links: [],
    diagram: {
      svg: "/projects/diagrams/filca.svg",
      raster: "/projects/diagrams/filca.webp",
      preview: "/projects/diagrams/filca-preview.webp",
      alt: "FILCA infrastructure diagram — production, shop and testing environments behind a shared load balancer",
      aspect: 2255.556 / 2215.556,
    },
    nodes: [
      { name: "Sora", role: "Load balancer · exit node" },
      { name: "acheron-server", role: "Build & deploy host" },
      { name: "db-central", role: "Database" },
    ],
  },
];

export const projectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);

export const productCount = projects.filter(
  (p) => p.kind === "product",
).length;
export const infraCount = projects.filter(
  (p) => p.kind === "infrastructure",
).length;
