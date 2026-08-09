import Link from "next/link";

import { Lottie } from "@/components/lottie/Lottie";
import { Petals } from "@/components/ui";
import { PageTransition } from "@/components/site/PageTransition";

export default function NotFound() {
  return (
    <PageTransition>
      <Petals />
      <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col items-center justify-center px-6 py-32 text-center">
        <Lottie
          src="/404.lottie"
          loop
          autoplay
          className="w-full max-w-md"
          label="Lost in the clouds"
        />
        <h1 className="text-gradient mt-6 font-display text-[clamp(2rem,5vw,3.2rem)] font-extrabold">
          This route doesn&rsquo;t resolve
        </h1>
        <p className="mt-4 max-w-md text-lg text-ink-500">
          It&rsquo;s not DNS · there&rsquo;s no way it&rsquo;s DNS · it was DNS.
          🙃
        </p>
        <Link
          href="/"
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-sakura-600 to-lilac-400 px-7 py-3.5 font-display font-bold text-white shadow-[0_12px_32px_-12px_rgba(214,51,108,0.7)] transition-transform duration-300 hover:-translate-y-0.5"
        >
          take me home <span aria-hidden>→</span>
        </Link>
      </main>
    </PageTransition>
  );
}
