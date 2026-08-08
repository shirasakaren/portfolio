import Link from "next/link";

import { navLinks, profile } from "@/lib/content";

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-sakura-200/70 bg-sakura-100/50">
      <div className="rule-petal h-1.5 w-full" />
      <div className="mx-auto grid max-w-[1600px] gap-10 px-6 py-14 sm:px-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-gradient font-display text-3xl font-extrabold">
            {profile.name}
          </p>
          <p lang="ja" className="mt-1 font-jp text-lg text-sakura-700">
            {profile.nameJa}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
            {profile.lineageJa}
            <br />
            <span className="text-ink-300 italic">{profile.lineageEn}</span>
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-display text-sm font-bold tracking-[0.2em] text-sakura-700 uppercase">
            Pages
          </h2>
          <ul className="mt-4 space-y-2.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-ink-500 transition-colors hover:text-sakura-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-sm font-bold tracking-[0.2em] text-sakura-700 uppercase">
            Elsewhere
          </h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a
                href={`mailto:${profile.email}`}
                className="text-sm font-medium text-ink-500 transition-colors hover:text-sakura-700"
              >
                {profile.email}
              </a>
            </li>
            <li>
              <a
                href={profile.github}
                rel="me noreferrer"
                target="_blank"
                className="text-sm font-medium text-ink-500 transition-colors hover:text-sakura-700"
              >
                {profile.githubHandle}
              </a>
            </li>
            <li className="text-sm text-ink-300">{profile.timezone}</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-6 pb-10 text-xs text-ink-300 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p>
          © {new Date().getFullYear()} {profile.name} · {profile.pronouns}
        </p>
        <p lang="ja" className="font-jp">
          {profile.greetingJa}
        </p>
      </div>
    </footer>
  );
}
