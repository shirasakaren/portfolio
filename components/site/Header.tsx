"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { MusicButton } from "@/components/audio/MusicButton";
import { useBoot } from "@/components/boot/BootProvider";
import { navLinks } from "@/lib/content";

export function Header() {
  const pathname = usePathname();
  const { isLive } = useBoot();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-[90] transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ opacity: isLive ? 1 : 0, pointerEvents: isLive ? "auto" : "none" }}
    >
      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "border-b border-sakura-200/60 bg-sakura-50/80 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-5 sm:h-[4.5rem] sm:px-8">
          <Link
            href="/"
            className={`group flex shrink-0 items-baseline gap-2 transition-[filter] duration-500 ${
              scrolled
                ? ""
                : "drop-shadow-[0_0_10px_rgba(255,255,255,0.95)] drop-shadow-[0_0_26px_rgba(255,255,255,0.8)]"
            }`}
            aria-label="Shirasaka Ren — home"
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

          <nav className="ml-auto hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-4 py-2 font-display text-sm font-bold transition-colors duration-200 ${
                    active
                      ? "text-sakura-700"
                      : "text-ink-700 hover:text-sakura-700"
                  } ${scrolled ? "" : "hero-halo-sm"}`}
                >
                  {link.label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-4 -bottom-0.5 h-[3px] rounded-full bg-linear-to-r from-sakura-400 to-lilac-400"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:ml-3">
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
    </header>
  );
}
