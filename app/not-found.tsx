import Link from "next/link";

import { Lottie } from "@/components/lottie/Lottie";
import { Magnetic, Reveal } from "@/components/motion";
import { PageTransition } from "@/components/site/PageTransition";
import { Sparkles } from "@/components/ui";
import { ReactionClip } from "@/components/visual/ReactionClip";
import { navLinks } from "@/lib/content";

export default function NotFound() {
  return (
    <PageTransition>
      <main className="relative mx-auto flex min-h-svh w-full max-w-3xl flex-col items-center justify-center px-6 py-32 text-center">
        <Sparkles count={12} className="opacity-50" />

        <Reveal y={0}>
          <Lottie
            src="/404.lottie"
            loop
            autoplay
            className="w-full max-w-md"
            label="Lost in the clouds"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="text-gradient mt-4 font-display text-[clamp(2rem,5.4vw,3.4rem)] leading-tight font-extrabold">
            This route doesn&rsquo;t resolve
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-ink-500">
            It&rsquo;s not DNS · there&rsquo;s no way it&rsquo;s DNS · it was
            DNS. 🙃
          </p>
        </Reveal>

        <Reveal delay={0.18} className="mt-8">
          <ReactionClip
            name="shock"
            size="mx-auto w-32"
            rounded="rounded-[1.4rem]"
            caption="404, apparently"
          />
        </Reveal>

        <Reveal delay={0.24}>
          <Magnetic className="mt-9">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-sakura-600 to-lilac-400 px-7 py-3.5 font-display font-bold text-white shadow-[0_12px_32px_-12px_rgba(214,51,108,0.7)]"
            >
              take me home <span aria-hidden>→</span>
            </Link>
          </Magnetic>
        </Reveal>

        <Reveal delay={0.3}>
          <nav aria-label="Elsewhere" className="mt-10">
            <ul className="flex flex-wrap justify-center gap-2">
              {navLinks
                .filter((l) => l.href !== "/")
                .map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex rounded-full border border-sakura-200/80 bg-white/65 px-4 py-2 font-display text-sm font-bold text-ink-700 transition-colors hover:border-sakura-400 hover:text-sakura-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </Reveal>
      </main>
    </PageTransition>
  );
}
