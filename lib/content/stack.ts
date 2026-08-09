/**
 * The toolbox, organised the way a recruiter reads a job spec.
 *
 * `icon` is a Simple Icons slug; `lib/stack-icons.ts` is generated from these
 * values so only the logos actually referenced end up in the bundle. `aka`
 * exists purely for the search box — the words a job ad uses that aren't the
 * tool's own name.
 *
 * level: 3 = daily driver · 2 = solid production experience · 1 = working knowledge
 */

export type Level = 1 | 2 | 3;

export type Skill = {
  name: string;
  icon?: string;
  level: Level;
  aka?: string[];
  note?: string;
};

export type StackGroup = {
  id: string;
  title: string;
  emoji: string;
  /** The one-liner under the heading, in her voice. */
  note: string;
  items: Skill[];
};

export const stack: StackGroup[] = [
  {
    id: "clouds",
    title: "Clouds",
    emoji: "☁️",
    note: "One landing-zone pattern each, zero snowflakes.",
    items: [
      { name: "AWS", icon: "amazonwebservices", level: 3, aka: ["Amazon Web Services", "EC2", "EKS", "S3"] },
      { name: "Google Cloud", icon: "googlecloud", level: 3, aka: ["GCP", "GCE", "GKE", "BigQuery"] },
      { name: "Azure", icon: "microsoftazure", level: 3, aka: ["Microsoft Azure", "AKS"] },
      { name: "Cloudflare", icon: "cloudflare", level: 3, aka: ["Workers", "R2", "Pages", "WAF"] },
      { name: "Huawei Cloud", icon: "huawei", level: 2 },
      { name: "Alibaba Cloud", icon: "alibabacloud", level: 2, aka: ["Aliyun"] },
      { name: "Oracle Cloud", icon: "oracle", level: 2, aka: ["OCI"] },
      { name: "IBM Cloud", icon: "ibm", level: 1 },
      { name: "DigitalOcean", icon: "digitalocean", level: 2 },
      { name: "OpenStack", icon: "openstack", level: 2, aka: ["private cloud"] },
    ],
  },
  {
    id: "orchestration",
    title: "Containers & orchestration",
    emoji: "⎈",
    note: "I dream in YAML and argue with the scheduler at 3AM.",
    items: [
      { name: "Kubernetes", icon: "kubernetes", level: 3, aka: ["k8s", "EKS", "GKE", "AKS"] },
      { name: "Docker", icon: "docker", level: 3, aka: ["containers", "OCI"] },
      { name: "Helm", icon: "helm", level: 3, aka: ["charts"] },
      { name: "Argo CD", icon: "argo", level: 3, aka: ["GitOps", "ArgoCD"] },
      { name: "Argo Rollouts", icon: "argo", level: 2, aka: ["canary", "blue-green", "progressive delivery"] },
      { name: "Flux CD", icon: "flux", level: 2, aka: ["GitOps"] },
      { name: "Kustomize", icon: "kubernetes", level: 3 },
      { name: "Podman", icon: "podman", level: 2 },
      { name: "containerd", icon: "containerd", level: 2, aka: ["CRI"] },
      { name: "OpenShift", icon: "redhatopenshift", level: 2, aka: ["OKD"] },
      { name: "Rancher", icon: "rancher", level: 2 },
      { name: "Talos Linux", level: 2, aka: ["immutable nodes"] },
      { name: "Cluster API", icon: "kubernetes", level: 2, aka: ["CAPI"] },
      { name: "Karpenter", icon: "kubernetes", level: 2, aka: ["node autoscaling"] },
      { name: "KEDA", icon: "kubernetes", level: 2, aka: ["event-driven autoscaling"] },
      { name: "Kyverno", icon: "kubernetes", level: 2, aka: ["admission policy"] },
      { name: "Knative", icon: "knative", level: 1, aka: ["serverless"] },
      { name: "Crossplane", icon: "crossplane", level: 2 },
      { name: "Anthos Service Mesh", icon: "googlecloud", level: 2 },
      { name: "etcd", icon: "etcd", level: 2 },
      { name: "k9s", icon: "k9s", level: 3 },
    ],
  },
  {
    id: "iac",
    title: "Infrastructure as code & CI/CD",
    emoji: "🏗️",
    note: "OpenTofu and Terraform — listing one is ideology, listing both is seniority.",
    items: [
      { name: "Terraform", icon: "terraform", level: 3, aka: ["IaC", "HCL"] },
      { name: "OpenTofu", icon: "opentofu", level: 3, aka: ["IaC"] },
      { name: "Terragrunt", icon: "terraform", level: 2 },
      { name: "Pulumi", icon: "pulumi", level: 2, aka: ["IaC"] },
      { name: "Ansible", icon: "ansible", level: 3, aka: ["configuration management"] },
      { name: "Ansible AWX", icon: "ansible", level: 2 },
      { name: "HashiCorp Consul", icon: "consul", level: 3, aka: ["service discovery", "service mesh"] },
      { name: "Packer", icon: "packer", level: 2, aka: ["golden images", "AMI"] },
      { name: "Vagrant", icon: "vagrant", level: 1 },
      { name: "Nix / NixOS", icon: "nixos", level: 2, aka: ["nix-darwin", "reproducible builds"] },
      { name: "Chef", icon: "chef", level: 1 },
      { name: "Puppet", icon: "puppet", level: 1 },
      { name: "Salt", icon: "saltproject", level: 1 },
      { name: "GitHub Actions", icon: "githubactions", level: 3, aka: ["CI", "CD", "pipelines"] },
      { name: "GitLab CI", icon: "gitlab", level: 3, aka: ["CI", "CD", "pipelines"] },
      { name: "Jenkins", icon: "jenkins", level: 2, aka: ["CI"] },
      { name: "Tekton", icon: "tekton", level: 1 },
      { name: "Dagger", icon: "dagger", level: 1 },
      { name: "Cloud Build", icon: "googlecloud", level: 2 },
      { name: "Backstage", icon: "backstage", level: 1, aka: ["developer portal", "IDP"] },
      { name: "Atlantis", icon: "terraform", level: 2 },
      { name: "Renovate", icon: "renovate", level: 2, aka: ["dependency updates"] },
    ],
  },
  {
    id: "observability",
    title: "Observability & SRE",
    emoji: "📊",
    note: "Prometheus 3.x — native histograms, UTF-8 labels, OTLP receiver. I write histogram_quantile from memory.",
    items: [
      { name: "Prometheus", icon: "prometheus", level: 3, aka: ["PromQL", "metrics", "alerting"] },
      { name: "Grafana", icon: "grafana", level: 3, aka: ["dashboards"] },
      { name: "OpenTelemetry", icon: "opentelemetry", level: 3, aka: ["OTel", "tracing", "OTLP"] },
      { name: "Loki", icon: "grafana", level: 3, aka: ["logs"] },
      { name: "Tempo", icon: "grafana", level: 2, aka: ["traces"] },
      { name: "Mimir", icon: "grafana", level: 2, aka: ["long-term metrics"] },
      { name: "Pyroscope", icon: "grafana", level: 1, aka: ["continuous profiling"] },
      { name: "Alloy", icon: "grafana", level: 2, aka: ["collector"] },
      { name: "Thanos", icon: "thanos", level: 2 },
      { name: "VictoriaMetrics", icon: "victoriametrics", level: 2 },
      { name: "Jaeger", icon: "jaeger", level: 2, aka: ["distributed tracing"] },
      { name: "Elasticsearch", icon: "elasticsearch", level: 2, aka: ["ELK", "search"] },
      { name: "OpenSearch", icon: "opensearch", level: 2 },
      { name: "Kibana", icon: "kibana", level: 2 },
      { name: "Fluent Bit", icon: "fluentbit", level: 2, aka: ["log shipping"] },
      { name: "Datadog", icon: "datadog", level: 2, aka: ["APM"] },
      { name: "New Relic", icon: "newrelic", level: 1, aka: ["APM"] },
      { name: "Sentry", icon: "sentry", level: 2, aka: ["error tracking"] },
      { name: "Zabbix", icon: "zabbix", level: 1 },
      { name: "ClickHouse", icon: "clickhouse", level: 2, aka: ["OLAP"] },
      { name: "InfluxDB", icon: "influxdb", level: 1, aka: ["time series"] },
      { name: "Netdata", icon: "netdata", level: 1 },
      { name: "SLO / SLI & error budgets", level: 3, aka: ["SRE", "reliability", "postmortem", "MTTR"] },
    ],
  },
  {
    id: "security",
    title: "Security",
    emoji: "🛡️",
    note: "I attack my own infra before someone else volunteers. SELinux stays enforcing.",
    items: [
      { name: "HashiCorp Vault", icon: "vault", level: 3, aka: ["secrets management"] },
      { name: "OpenBao", icon: "vault", level: 2, aka: ["secrets management"] },
      { name: "SOPS + age", level: 2, aka: ["secrets", "encryption"] },
      { name: "Trivy", icon: "trivy", level: 3, aka: ["vulnerability scanning", "SCA"] },
      { name: "Falco", icon: "falco", level: 2, aka: ["runtime security"] },
      { name: "Tetragon", icon: "cilium", level: 2, aka: ["eBPF", "runtime security"] },
      { name: "Semgrep", level: 2, aka: ["SAST", "static analysis"] },
      { name: "Snyk", icon: "snyk", level: 2, aka: ["SCA", "dependency scanning"] },
      { name: "SonarQube", icon: "sonarqube", level: 2, aka: ["code quality", "SAST"] },
      { name: "Sigstore cosign", level: 2, aka: ["image signing", "supply chain"] },
      { name: "SLSA", level: 2, aka: ["supply chain", "provenance", "SBOM"] },
      { name: "OPA / Rego", icon: "openpolicyagent", level: 2, aka: ["policy as code"] },
      { name: "Keycloak", icon: "keycloak", level: 3, aka: ["IAM", "SSO", "OIDC", "SAML"] },
      { name: "Kali Linux", icon: "kalilinux", level: 2, aka: ["pentest", "red team"] },
      { name: "Burp Suite", icon: "burpsuite", level: 2, aka: ["web pentest"] },
      { name: "Metasploit", icon: "metasploit", level: 2 },
      { name: "Nmap", level: 2, aka: ["port scanning", "recon"] },
      { name: "Wireshark", icon: "wireshark", level: 2, aka: ["packet capture"] },
      { name: "BloodHound", level: 1, aka: ["Active Directory"] },
      { name: "Prowler", level: 2, aka: ["cloud posture", "CSPM"] },
      { name: "kube-bench", icon: "kubernetes", level: 2, aka: ["CIS benchmark"] },
      { name: "OWASP", icon: "owasp", level: 2, aka: ["Top 10", "appsec"] },
      { name: "YubiKey", icon: "yubico", level: 3, aka: ["MFA", "hardware key"] },
      { name: "SIEM & SOAR", level: 2, aka: ["Splunk", "incident response", "playbooks"] },
      { name: "CIS · ISO 27001 · SOC 2", level: 2, aka: ["compliance", "audit", "controls"] },
    ],
  },
  {
    id: "networking",
    title: "Networking & mesh",
    emoji: "🕸️",
    note: "It's not DNS · there's no way it's DNS · it was DNS.",
    items: [
      { name: "Cilium eBPF", icon: "cilium", level: 3, aka: ["CNI", "eBPF", "network policy"] },
      { name: "Hubble", icon: "cilium", level: 2, aka: ["network observability"] },
      { name: "Gateway API", icon: "kubernetes", level: 2, aka: ["ingress"] },
      { name: "Istio", icon: "istio", level: 2, aka: ["service mesh", "ambient", "mTLS"] },
      { name: "Linkerd", icon: "linkerd", level: 1, aka: ["service mesh"] },
      { name: "Envoy", icon: "envoyproxy", level: 2, aka: ["proxy", "L7"] },
      { name: "NGINX", icon: "nginx", level: 3, aka: ["reverse proxy", "ingress", "load balancer"] },
      { name: "Traefik", icon: "traefikproxy", level: 2, aka: ["ingress"] },
      { name: "HAProxy", level: 2, aka: ["load balancer"] },
      { name: "Kong", icon: "kong", level: 1, aka: ["API gateway"] },
      { name: "WireGuard", icon: "wireguard", level: 3, aka: ["VPN"] },
      { name: "Tailscale", icon: "tailscale", level: 3, aka: ["VPN", "zero trust", "mesh"] },
      { name: "cert-manager", icon: "letsencrypt", level: 3, aka: ["TLS", "certificates", "ACME"] },
      { name: "nftables", icon: "linux", level: 2, aka: ["firewall", "iptables"] },
      { name: "VLAN & L2/L3 routing", level: 3, aka: ["switching", "subnetting", "BGP", "OSPF"] },
      { name: "DNS", level: 3, aka: ["BIND", "resolver", "zones"] },
    ],
  },
  {
    id: "data",
    title: "Data & streaming",
    emoji: "🗄️",
    note: "PostgreSQL is my one true database — I tune autovacuum recreationally.",
    items: [
      { name: "PostgreSQL", icon: "postgresql", level: 3, aka: ["Postgres", "SQL", "RDBMS"] },
      { name: "CloudNativePG", icon: "postgresql", level: 2, aka: ["Postgres operator"] },
      { name: "MySQL", icon: "mysql", level: 2, aka: ["SQL"] },
      { name: "MariaDB", icon: "mariadb", level: 2 },
      { name: "MongoDB", icon: "mongodb", level: 2, aka: ["NoSQL", "document store"] },
      { name: "Redis", icon: "redis", level: 3, aka: ["cache", "queue"] },
      { name: "Valkey", icon: "valkey", level: 2, aka: ["cache"] },
      { name: "Cassandra", icon: "apachecassandra", level: 1 },
      { name: "DynamoDB", icon: "amazondynamodb", level: 2, aka: ["NoSQL"] },
      { name: "DuckDB", icon: "duckdb", level: 1, aka: ["analytics"] },
      { name: "Apache Kafka", icon: "apachekafka", level: 2, aka: ["streaming", "event bus"] },
      { name: "Redpanda", level: 1, aka: ["Kafka API", "streaming"] },
      { name: "RabbitMQ", icon: "rabbitmq", level: 2, aka: ["message queue", "AMQP"] },
      { name: "Apache Pulsar", icon: "apachepulsar", level: 1, aka: ["streaming"] },
      { name: "NATS JetStream", icon: "natsdotio", level: 2, aka: ["messaging"] },
      { name: "Debezium", level: 1, aka: ["CDC", "change data capture"] },
      { name: "BullMQ", icon: "redis", level: 2, aka: ["job queue", "workers"] },
      { name: "Meilisearch", icon: "meilisearch", level: 2, aka: ["search"] },
      { name: "MinIO", icon: "minio", level: 3, aka: ["S3", "object storage"] },
      { name: "Ceph", icon: "ceph", level: 1, aka: ["storage"] },
      { name: "BigQuery", icon: "googlebigquery", level: 2, aka: ["data warehouse", "analytics"] },
    ],
  },
  {
    id: "performance",
    title: "Load & performance",
    emoji: "🏎️",
    note: "Plain wrk lies to you — coordinated omission is real, use wrk2.",
    items: [
      { name: "k6", icon: "k6", level: 3, aka: ["load testing", "performance testing"] },
      { name: "Locust", level: 2, aka: ["load testing"] },
      { name: "Gatling", level: 1, aka: ["load testing"] },
      { name: "JMeter", icon: "apachejmeter", level: 2, aka: ["load testing"] },
      { name: "Vegeta", level: 2, aka: ["HTTP load"] },
      { name: "wrk2", level: 3, aka: ["latency", "coordinated omission"] },
      { name: "fio", level: 2, aka: ["disk benchmark", "IOPS"] },
      { name: "iperf3", level: 2, aka: ["network throughput"] },
      { name: "perf + FlameGraph", icon: "linux", level: 2, aka: ["profiling", "CPU"] },
      { name: "pgbench", icon: "postgresql", level: 2, aka: ["database benchmark"] },
    ],
  },
  {
    id: "languages",
    title: "Languages",
    emoji: "💻",
    note: "Bash starts with set -euo pipefail on line one. Always.",
    items: [
      { name: "Python", icon: "python", level: 3, aka: ["boto3", "automation", "scripting"] },
      { name: "Go", icon: "go", level: 3, aka: ["Golang", "operators", "controllers"] },
      { name: "Bash", icon: "gnubash", level: 3, aka: ["shell", "scripting"] },
      { name: "TypeScript", icon: "typescript", level: 3, aka: ["Node.js", "CDK", "Pulumi"] },
      { name: "JavaScript", icon: "javascript", level: 3, aka: ["Node.js"] },
      { name: "Rust", icon: "rust", level: 2, aka: ["eBPF userspace", "systems"] },
      { name: "C", icon: "c", level: 2, aka: ["eBPF", "systems", "kernel"] },
      { name: "C++", icon: "cplusplus", level: 2, aka: ["systems"] },
      { name: "C#", icon: "csharp", level: 2, aka: [".NET", "Unity"] },
      { name: "Java", icon: "openjdk", level: 2, aka: ["JVM tuning", "heap analysis"] },
      { name: "HCL", icon: "terraform", level: 3, aka: ["Terraform"] },
      { name: "PromQL", icon: "prometheus", level: 3, aka: ["Prometheus queries"] },
      { name: "Rego", icon: "openpolicyagent", level: 2, aka: ["OPA", "policy"] },
      { name: "SQL", icon: "postgresql", level: 3 },
      { name: "Lua", icon: "lua", level: 2, aka: ["Neovim", "NGINX"] },
      { name: "PowerShell", icon: "powershell", level: 2, aka: ["Windows automation"] },
      { name: "Ruby", icon: "ruby", level: 1 },
      { name: "PHP", icon: "php", level: 1 },
      { name: "Kotlin", icon: "kotlin", level: 1 },
      { name: "Scala", icon: "scala", level: 1 },
      { name: "Elixir", icon: "elixir", level: 1 },
      { name: "Zig", icon: "zig", level: 1 },
      { name: "Perl", icon: "perl", level: 1 },
      { name: "Haskell", icon: "haskell", level: 1 },
      { name: "R", icon: "r", level: 1 },
      { name: "Dart", icon: "dart", level: 1 },
      { name: "Swift", icon: "swift", level: 1 },
      { name: "Nix", icon: "nixos", level: 2 },
      { name: "CUE", level: 1, aka: ["configuration"] },
      { name: "Assembly", level: 1, aka: ["asm", "reverse engineering"] },
    ],
  },
  {
    id: "product",
    title: "Apps I actually shipped",
    emoji: "⚛️",
    note: "Infrastructure is nicer when you've had to run the thing on top of it.",
    items: [
      { name: "Next.js", icon: "nextdotjs", level: 3, aka: ["React", "App Router", "SSR"] },
      { name: "React", icon: "react", level: 3 },
      { name: "NestJS", icon: "nestjs", level: 2, aka: ["Node.js backend"] },
      { name: "Prisma", icon: "prisma", level: 2, aka: ["ORM"] },
      { name: "Tailwind CSS", icon: "tailwindcss", level: 3 },
      { name: "Socket.IO", icon: "socketdotio", level: 2, aka: ["WebSocket", "realtime"] },
      { name: "LiveKit", level: 2, aka: ["WebRTC", "SFU", "voice", "video"] },
      { name: "Yjs", level: 2, aka: ["CRDT", "collaborative editing"] },
      { name: "GraphQL", icon: "graphql", level: 2 },
      { name: "Unity", icon: "unity", level: 2, aka: ["WebGL", "game engine"] },
      { name: "Unreal Engine", icon: "unrealengine", level: 1 },
      { name: "WebGL / GLSL", icon: "webgl", level: 2, aka: ["shaders", "graphics"] },
      { name: "OpenAI API", icon: "openai", level: 2, aka: ["LLM", "AI integration"] },
    ],
  },
  {
    id: "machines",
    title: "Operating systems",
    emoji: "🐧",
    note: "Shell: zsh + starship + tmux + nvim. Theme: pink, obviously.",
    items: [
      { name: "Arch Linux", icon: "archlinux", level: 3, aka: ["btw"] },
      { name: "Debian", icon: "debian", level: 3 },
      { name: "Ubuntu", icon: "ubuntu", level: 3 },
      { name: "RHEL", icon: "redhat", level: 3, aka: ["Red Hat Enterprise Linux", "Rocky", "Alma"] },
      { name: "Fedora", icon: "fedora", level: 2 },
      { name: "Gentoo", icon: "gentoo", level: 1 },
      { name: "NixOS", icon: "nixos", level: 2 },
      { name: "Talos Linux", level: 2, aka: ["immutable Kubernetes OS"] },
      { name: "macOS", icon: "apple", level: 3, aka: ["nix-darwin"] },
      { name: "Windows Server", level: 2, aka: ["Active Directory"], note: "under protest" },
      { name: "Proxmox VE", icon: "proxmox", level: 3, aka: ["virtualisation", "hypervisor"] },
      { name: "QEMU / KVM", icon: "qemu", level: 2, aka: ["virtualisation"] },
      { name: "Neovim", icon: "neovim", level: 3, aka: ["vim"] },
      { name: "tmux", icon: "tmux", level: 3 },
      { name: "Git", icon: "git", level: 3 },
      { name: "SELinux", icon: "linux", level: 2, aka: ["hardening", "MAC"] },
    ],
  },
  {
    id: "physical",
    title: "Physical & data centre",
    emoji: "🏢",
    note: "The layer most platform engineers have never touched. I have racked it.",
    items: [
      { name: "Data centre architecture", level: 3, aka: ["DC design", "data center", "colocation"] },
      { name: "Rack & stack", level: 3, aka: ["cabling", "server install"] },
      { name: "A+B redundant power", level: 3, aka: ["UPS", "PDU", "power distribution"] },
      { name: "HVAC & thermal", level: 3, aka: ["cooling", "humidity", "CRAC"] },
      { name: "MEP engineering", level: 2, aka: ["mechanical electrical plumbing"] },
      { name: "Structured cabling", level: 3, aka: ["fibre", "copper", "patching"] },
      { name: "Fire & life safety", level: 2, aka: ["suppression", "detection"] },
      { name: "Physical security", level: 2, aka: ["access control", "CCTV"] },
      { name: "Site development", level: 2, aka: ["site acquisition", "greenfield"] },
      { name: "Construction management", level: 2, aka: ["build-out", "contractors"] },
      { name: "Capacity planning", level: 3, aka: ["power budget", "growth"] },
      { name: "FinOps", level: 3, aka: ["cloud cost", "billing", "chargeback", "showback"] },
    ],
  },
];

/**
 * Quick filters for the search box. Each preset selects the groups and the
 * extra keywords that a given job title tends to ask about.
 */
export type RolePreset = {
  id: string;
  label: string;
  emoji: string;
  /** Terms matched against name + aka, same as typing them in the box. */
  terms: string[];
};

export const rolePresets: RolePreset[] = [
  {
    id: "devops",
    label: "DevOps Engineer",
    emoji: "♾️",
    terms: [
      "Kubernetes", "Docker", "Terraform", "Ansible", "GitHub Actions",
      "GitLab CI", "Jenkins", "Helm", "Argo CD", "AWS", "Google Cloud",
      "Azure", "Bash", "Python", "Go", "NGINX", "Prometheus", "Grafana",
    ],
  },
  {
    id: "sre",
    label: "SRE",
    emoji: "📟",
    terms: [
      "SLO / SLI & error budgets", "Prometheus", "Grafana", "OpenTelemetry",
      "Loki", "Tempo", "Jaeger", "k6", "wrk2", "perf + FlameGraph",
      "Kubernetes", "Argo Rollouts", "PromQL", "Go", "Python",
    ],
  },
  {
    id: "platform",
    label: "Platform Engineer",
    emoji: "🧱",
    terms: [
      "Kubernetes", "Crossplane", "Backstage", "Argo CD", "Flux CD", "Helm",
      "Kustomize", "Terraform", "OpenTofu", "Cluster API", "Talos Linux",
      "Karpenter", "KEDA", "Kyverno", "Go", "TypeScript",
    ],
  },
  {
    id: "cloud",
    label: "Cloud Architect",
    emoji: "☁️",
    terms: [
      "AWS", "Google Cloud", "Azure", "Cloudflare", "Alibaba Cloud",
      "Oracle Cloud", "IBM Cloud", "Huawei Cloud", "DigitalOcean",
      "OpenStack", "Terraform", "HashiCorp Consul", "FinOps",
      "Capacity planning",
    ],
  },
  {
    id: "security",
    label: "Security Engineer",
    emoji: "🛡️",
    terms: [
      "HashiCorp Vault", "Trivy", "Falco", "Tetragon", "OPA / Rego",
      "Sigstore cosign", "SLSA", "Keycloak", "Kali Linux", "Burp Suite",
      "Semgrep", "SIEM & SOAR", "CIS · ISO 27001 · SOC 2", "Prowler",
      "kube-bench", "OWASP",
    ],
  },
  {
    id: "datacenter",
    label: "Data Centre",
    emoji: "🏢",
    terms: [
      "Data centre architecture", "Rack & stack", "A+B redundant power",
      "HVAC & thermal", "MEP engineering", "Structured cabling",
      "Fire & life safety", "Physical security", "Site development",
      "Construction management", "Proxmox VE", "VLAN & L2/L3 routing",
    ],
  },
];

export const skillCount = stack.reduce((n, g) => n + g.items.length, 0);

export const levelLabel: Record<Level, string> = {
  3: "Daily driver",
  2: "Production experience",
  1: "Working knowledge",
};
