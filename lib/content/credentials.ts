/**
 * Certifications, awards, languages — the parts of a CV a recruiter scans for.
 *
 * Deliberately split into "held" and "roadmap". Ren's README lists a large
 * target set; presenting those as if they were already in hand would be a lie,
 * and presenting them not at all would hide the direction she's heading in.
 */

export type Certification = {
  name: string;
  issuer?: string;
  emoji: string;
};

/** Certificates actually held today. */
export const certificationsHeld: Certification[] = [
  { name: "Good Automated Manufacturing Practice", issuer: "GAMP", emoji: "🏭" },
  {
    name: "Professional HVAC Systems: Design, Application & Efficiency",
    emoji: "❄️",
  },
  { name: "Physical Infrastructure Management", emoji: "🏗️" },
  { name: "Fire Safety Awareness", emoji: "🧯" },
  { name: "ClickUp Novice", issuer: "ClickUp", emoji: "✅" },
];

export type CertTrack = {
  group: string;
  emoji: string;
  blurb: string;
  items: string[];
};

/** Held, renewing, or hunting next — a roadmap, not a brag list. */
export const certRoadmap: CertTrack[] = [
  {
    group: "Cloud Native",
    emoji: "⎈",
    blurb: "The cluster ones. CKS is the gate I care about most.",
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
    blurb: "One professional-tier per provider, so no cloud is a stranger.",
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
    blurb: "Because everything else is a wrapper around this.",
    items: ["RHCSA", "RHCE", "LFCS", "LFCE"],
  },
  {
    group: "Security",
    emoji: "🛡️",
    blurb: "Offensive first — you can't defend a box you've never broken.",
    items: ["OSCP", "OSEP", "CISSP", "CCSP", "GCIH", "GCIA", "Security+"],
  },
];

export const certsNote =
  "Fun 2026 fact: under CNCF's CARE programme, passing CKS now auto-extends my CKA. 🎁";

export type Award = {
  title: string;
  place: string;
  emoji: string;
  /** 1 = highest, used to size the card. */
  rank: 1 | 2 | 3;
};

export const awards: Award[] = [
  {
    place: "Gold Medal",
    title: "National Mathematics & Science Olympiad",
    emoji: "🥇",
    rank: 1,
  },
  {
    place: "3rd Place",
    title: "National Informatics Olympiad",
    emoji: "🥉",
    rank: 1,
  },
  {
    place: "Finalist",
    title: "Suprarational Mathematics Competition",
    emoji: "🎖️",
    rank: 2,
  },
  {
    place: "Appreciation",
    title: "Data Scientist Competition",
    emoji: "📊",
    rank: 2,
  },
  {
    place: "Awardee",
    title: "Kospin Jasa Outstanding Student Award",
    emoji: "🌟",
    rank: 3,
  },
];

export type Language = {
  name: string;
  nameNative: string;
  level: string;
  /** 0–1, drives the meter fill. */
  fluency: number;
  flag: string;
};

export const languages: Language[] = [
  {
    name: "Japanese",
    nameNative: "日本語",
    level: "Native",
    fluency: 1,
    flag: "🇯🇵",
  },
  {
    name: "Indonesian",
    nameNative: "Bahasa Indonesia",
    level: "Native / bilingual",
    fluency: 1,
    flag: "🇮🇩",
  },
  {
    name: "Javanese",
    nameNative: "ꦧꦱꦗꦮ",
    level: "Native / bilingual",
    fluency: 0.95,
    flag: "🪷",
  },
  {
    name: "English",
    nameNative: "English",
    level: "Full professional",
    fluency: 0.85,
    flag: "🌐",
  },
  {
    name: "YAML",
    nameNative: "yaml",
    level: "Fluent, regrettably",
    fluency: 1,
    flag: "📄",
  },
];

/** The three the CV surfaces first — the unusual ones, not the obvious ones. */
export const topSkills = [
  { name: "Data Center Architecture", emoji: "🏢" },
  { name: "Site Development", emoji: "📐" },
  { name: "Construction Management", emoji: "🏗️" },
];

/**
 * Community work drawn from things that are genuinely on the record.
 *
 * TODO(ren): if you have formal organisation memberships or volunteering to
 * add, drop them in here — same shape, and the About page picks them up
 * automatically.
 */
export const community = [
  {
    title: "Official Arch Linux mirror",
    role: "Operator",
    body: "Ran a public Arch mirror on Estella's own iron, at high-volume uptime. Free bandwidth for strangers, which is the whole point.",
    emoji: "🪞",
  },
  {
    title: "Open source",
    role: "Maintainer",
    body: "Tenki Weather ships MIT-licensed, source and all — including the multithreading batch pipeline people keep asking about.",
    emoji: "📦",
  },
  {
    title: "Lab infrastructure, donated",
    role: "Head of Infrastructure",
    body: "25+ internal OSS services stood up for a university research lab so students get real CI/CD, IAM and observability instead of screenshots.",
    emoji: "🎓",
  },
];
