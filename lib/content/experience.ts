/**
 * The career timeline.
 *
 * Straight off the CV — every date, title and duration is as-supplied. The
 * highlights are compressed from the role descriptions rather than invented, so
 * this file can be read side by side with the CV without a single mismatch.
 */

export type Role = {
  title: string;
  /** ISO year-month. */
  start: string;
  /** ISO year-month, or null for "still there". */
  end: string | null;
  /** As stated on the CV — kept literal rather than recomputed. */
  months: number;
  summary: string;
  highlights: string[];
  stack: string[];
};

export type Company = {
  id: string;
  name: string;
  /** Legal name where it differs from the one people use. */
  legalName?: string;
  location: string;
  /** Drives the accent colour and the icon on the timeline. */
  kind: "platform" | "devops" | "sre" | "datacenter";
  /** Total tenure when there is more than one role. */
  totalMonths?: number;
  roles: Role[];
};

export const experience: Company[] = [
  {
    id: "yorusa",
    name: "Yorusa Inc.",
    legalName: "PT Yorusa Teknologi Indonesia",
    location: "Jakarta, Indonesia",
    kind: "platform",
    roles: [
      {
        title: "Platform Engineer",
        start: "2026-06",
        end: null,
        months: 3,
        summary:
          "Building the internal platform — the paved road between a developer's laptop and production.",
        highlights: [
          "Golden paths for service scaffolding, deploys and rollbacks",
          "Self-service infrastructure behind a pull request",
        ],
        stack: ["Kubernetes", "Terraform", "GitHub Actions", "Go"],
      },
    ],
  },
  {
    id: "monarch",
    name: "Monarch Tech",
    legalName: "PT. Monarch Inti Teknologi",
    location: "Jakarta, Indonesia",
    kind: "devops",
    roles: [
      {
        title: "DevOps Engineer",
        start: "2026-04",
        end: null,
        months: 5,
        summary:
          "Scalable, high-availability infrastructure across four clouds — and the DDoS mitigation in front of it.",
        highlights: [
          "Multi-cloud footprint across AWS, GCP, Huawei Cloud and DigitalOcean",
          "Kubernetes orchestration and CI/CD automation end to end",
          "Infrastructure monitoring and DDoS mitigation lifting SLA performance",
        ],
        stack: [
          "AWS",
          "Google Cloud",
          "Huawei Cloud",
          "DigitalOcean",
          "Kubernetes",
          "Cloudflare",
        ],
      },
    ],
  },
  {
    id: "mgm",
    name: "MGM Laboratory",
    location: "Malang, Indonesia",
    kind: "datacenter",
    totalMonths: 10,
    roles: [
      {
        title: "Head of IT Infrastructure & Architecture",
        start: "2026-02",
        end: null,
        months: 7,
        summary:
          "IT strategy, enterprise architecture and hybrid multi-cloud operations for 100+ internal users.",
        highlights: [
          "Resilient infrastructure across on-prem DC, Google Cloud, AWS and Azure",
          "HashiCorp Consul for L2/L3 routing and service discovery",
          "25+ critical services under SLA/DR, with FinOps-driven cost control",
          "Server capacity, power and thermal planning; vendor and cross-functional ops",
        ],
        stack: [
          "Consul",
          "Google Cloud",
          "AWS",
          "Azure",
          "Proxmox VE",
          "FinOps",
        ],
      },
      {
        title: "Platform Engineer",
        start: "2025-11",
        end: "2026-02",
        months: 4,
        summary:
          "Built the hybrid cloud from bare concrete up — server room, HVAC, hypervisor, then the platform on top.",
        highlights: [
          "Engineered the on-prem server room, HVAC and Proxmox VE virtualisation",
          "Architected GCP infrastructure with GCE, GKE and Terraform",
          "Deployed 25+ internal OSS services for CI/CD, observability, IAM and data",
        ],
        stack: ["Proxmox VE", "GKE", "Terraform", "GitLab", "Kafka", "Keycloak"],
      },
    ],
  },
  {
    id: "arunika",
    name: "Arunika Data Center",
    location: "Jakarta, Indonesia",
    kind: "datacenter",
    roles: [
      {
        title: "Infrastructure Engineer",
        start: "2025-12",
        end: "2026-06",
        months: 7,
        summary:
          "End-to-end design and build of enterprise-scale data centre infrastructure — site acquisition through to server rack architecture.",
        highlights: [
          "Site acquisition, financial planning and MEP engineering",
          "Construction, network fabric, fire & life safety",
          "Physical and cyber security, server rack architecture",
          "Key role shaping Nusantara Smart Data Center in Indonesia's new capital (IKN)",
        ],
        stack: [
          "MEP",
          "Network fabric",
          "Fire & life safety",
          "Rack architecture",
        ],
      },
    ],
  },
  {
    id: "estella",
    name: "Estella Tech",
    location: "Malang, Indonesia",
    kind: "devops",
    totalMonths: 15,
    roles: [
      {
        title: "Senior DevOps Engineer",
        start: "2025-06",
        end: "2026-02",
        months: 9,
        summary:
          "A data centre from scratch: rack and stack, power, cooling, cabling, then the clusters on top of it.",
        highlights: [
          "Rack & stack, HVAC/humidity, redundant A+B power, UPS/PDU and structured cabling",
          "VLANs and L2/L3 routing; virtual clusters on Proxmox VE",
          "Access secured with Tailscale, WireGuard and Nginx; Biznet Gio integration",
          "Hosted an official Arch Linux mirror at high-volume uptime",
        ],
        stack: [
          "Proxmox VE",
          "Tailscale",
          "WireGuard",
          "NGINX",
          "Arch Linux",
          "Debian",
        ],
      },
      {
        title: "DevOps Engineer",
        start: "2024-12",
        end: "2025-06",
        months: 7,
        summary:
          "Hybrid and multi-cloud infrastructure with HA built in at the routing layer.",
        highlights: [
          "On-prem plus Google Cloud, AWS and Azure under one topology",
          "HA systems with HashiCorp Consul, Terraform and Ansible",
          "DNS, subnetting, load balancing and reverse proxies with Nginx",
          "Kubernetes on EKS/GKE, CI/CD via GitHub Actions and ArgoCD",
        ],
        stack: [
          "Consul",
          "Terraform",
          "Ansible",
          "EKS",
          "GKE",
          "ArgoCD",
          "Cloudflare",
        ],
      },
    ],
  },
  {
    id: "kaizin",
    name: "Kaizin Digital",
    legalName: "Kaizin Digital Creative",
    location: "Yogyakarta, Indonesia",
    kind: "sre",
    totalMonths: 15,
    roles: [
      {
        title: "Site Reliability Engineer",
        start: "2024-04",
        end: "2024-12",
        months: 9,
        summary:
          "CI/CD reliability and self-healing systems, measured with error budgets rather than vibes.",
        highlights: [
          "SLO/SLI and error budgets; blameless postmortems that actually cut MTTR",
          "HPA/VPA autoscaling on GKE for zero-downtime traffic spikes",
          "Canary deploys with automatic rollback driven by Prometheus metrics",
          "Toil automated away in Go and Bash",
        ],
        stack: ["GKE", "Prometheus", "Go", "Bash", "Argo Rollouts"],
      },
      {
        title: "Platform Engineer",
        start: "2023-10",
        end: "2024-04",
        months: 7,
        summary:
          "Scalable, self-healing cloud infrastructure for web platforms — IaC and container orchestration from day one.",
        highlights: [
          "HA hosting, deployment pipelines and backend optimisation",
          "Event-driven workflows and API integrations for zero-downtime operations",
          "Containerised environments on GKE, provisioned with Terraform",
          "Observability with OpenTelemetry, Prometheus, Jaeger and Grafana",
        ],
        stack: [
          "GKE",
          "Terraform",
          "OpenTelemetry",
          "Prometheus",
          "Jaeger",
          "Grafana",
        ],
      },
    ],
  },
  {
    id: "sseven",
    name: "Sseven Inc.",
    legalName: "Sseven Indonesia",
    location: "Batang, Indonesia",
    kind: "platform",
    roles: [
      {
        title: "Platform Engineer",
        start: "2022-10",
        end: "2023-07",
        months: 10,
        summary:
          "Where it started — the first platform, the first pipeline, the first 3AM page.",
        highlights: [
          "Deployment automation and environment standardisation",
          "Operational tooling that replaced spreadsheets with scripts",
        ],
        stack: ["Docker", "Linux", "Bash", "CI/CD"],
      },
    ],
  },
];

export const education = [
  {
    school: "University of Brawijaya",
    schoolJa: "ブラウィジャヤ大学",
    degree: "Bachelor, Computer Engineering",
    start: "2024",
    end: "2028",
    note: "Still enrolled — coursework by day, clusters by night.",
  },
] as const;

/** Total distinct months on the timeline, for the stat counters. */
export const careerMonths = experience.reduce(
  (total, company) =>
    total +
    (company.totalMonths ??
      company.roles.reduce((sum, role) => sum + role.months, 0)),
  0,
);
