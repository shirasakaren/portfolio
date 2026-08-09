"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { MusicButton } from "@/components/audio/MusicButton";
import { useBoot } from "@/components/boot/BootProvider";
import { navLinks } from "@/lib/content";

/**
 * Two navigations, one at a time.
 *
 * On the hero — the top of the homepage, where the video is the whole screen —
 * the links drop down the left edge under the wordmark, each on its own small
 * readable patch. Everywhere else they collapse back into a conventional bar,
 * spread evenly between the wordmark and the music control.
 *
 * Contact is pulled out of the run of links in both layouts and styled as a
 * filled pill: it is the one thing on this site that asks for a reply.
 */

const CTA_HREF = "/contact";
const PLAIN_LINKS = navLinks.filter((l) => l.href !== CTA_HREF);
const CTA_LINK = navLinks.find((l) => l.href === CTA_HREF);

/** Far enough that the hero snap has visibly committed before the bar appears. */
const BAR_AT = 40;

export function Header() {
  const pathname = usePathname();
  const { isLive } = useBoot();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > BAR_AT);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroMode = pathname === "/" && !scrolled;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className="fixed inset-x-0 top-0 z-[90] transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ opacity: isLive ? 1 : 0, pointerEvents: isLive ? "auto" : "none" }}
    >
      <div
        className={`transition-all duration-500 ${
          heroMode && !menuOpen
            ? "border-b border-transparent"
            : "border-b border-sakura-200/45 bg-sakura-50/45 backdrop-blur-2xl"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1600px] items-center px-5 sm:h-[4.5rem] sm:px-8">
          <Link
            href="/"
            aria-label="Shirasaka Ren — home"
            className={`group flex shrink-0 items-baseline gap-2 transition-[filter] duration-500 ${
              heroMode
                ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.95)] drop-shadow-[0_0_26px_rgba(255,255,255,0.8)]"
                : ""
            }`}
          >
            <span className="text-gradient font-display text-2xl leading-none font-extrabold">
              ren
            </span>
            <span
              aria-hidden
              className="text-sakura-400 transition-transform duration-500 group-hover:rotate-90"
            >
              ✿
            </span>
          </Link>

          {/* Bar layout — evenly spread from the wordmark to the music button. */}
          <nav
            aria-label="Main"
            inert={heroMode}
            className={`hidden flex-1 items-center justify-between px-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:flex lg:px-12 ${
              heroMode
                ? "pointer-events-none -translate-y-1 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            {PLAIN_LINKS.map((link) => (
              <BarLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={isActive(link.href)}
              />
            ))}
            {CTA_LINK && <CtaLink href={CTA_LINK.href} label={CTA_LINK.label} />}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            <MusicButton />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label="Menu"
              className="grid size-11 place-items-center rounded-full border border-sakura-200/80 bg-white/75 text-sakura-700 backdrop-blur-md sm:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <>
                    <path d="M5 5l14 14" />
                    <path d="M19 5L5 19" />
                  </>
                ) : (
                  <>
                    <path d="M4 8h16" />
                    <path d="M4 16h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <nav
          id="mobile-nav"
          aria-label="Mobile"
          hidden={!menuOpen}
          className="border-t border-sakura-200/60 bg-sakura-50/95 px-5 pb-4 backdrop-blur-xl sm:hidden"
        >
          <ul className="flex flex-col py-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 font-display font-bold text-ink-700 transition-colors hover:bg-sakura-100 hover:text-sakura-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Hero layout — down the left edge, under the wordmark. */}
      <nav
        aria-label="Main"
        inert={!heroMode}
        className={`absolute inset-x-0 top-16 hidden flex-col items-start gap-1 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:top-[4.6rem] sm:flex ${
          heroMode
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        {PLAIN_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(link.href) ? "page" : undefined}
            className={`nav-patch w-fit rounded-r-full py-2 pr-14 pl-5 font-display text-sm font-bold transition-colors duration-200 sm:pl-8 ${
              isActive(link.href)
                ? "text-sakura-700"
                : "text-ink-700 hover:text-sakura-700"
            }`}
          >
            {link.label}
          </Link>
        ))}
        {CTA_LINK && (
          <div className="mt-2.5 pl-5 sm:pl-8">
            <CtaLink href={CTA_LINK.href} label={CTA_LINK.label} />
          </div>
        )}
      </nav>
    </header>
  );
}

function BarLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative rounded-full py-2 font-display text-sm font-bold transition-colors duration-200 ${
        active ? "text-sakura-700" : "text-ink-700 hover:text-sakura-700"
      }`}
    >
      {label}
      {active && (
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full bg-linear-to-r from-sakura-400 to-lilac-400"
        />
      )}
    </Link>
  );
}

function CtaLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-linear-to-r from-sakura-600 to-sakura-500 px-5 py-2.5 font-display text-sm font-bold text-white shadow-[0_8px_22px_-8px_rgba(214,51,108,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(214,51,108,0.85)]"
    >
      {label}
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-0.5"
      >
        ♡
      </span>
    </Link>
  );
}
