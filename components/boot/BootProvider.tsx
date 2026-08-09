"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Lottie } from "@/components/lottie/Lottie";
import { DandelionTransition } from "@/components/boot/DandelionTransition";
import { loadDotLottie } from "@/lib/dotlottie";
import { MEDIA_KEYS, whenMedia } from "@/lib/mediaRegistry";
import { usePrefersReducedMotion } from "@/lib/motion";
import {
  preloadImage,
  preloadMedia,
  runPreload,
  waitForFonts,
  type PreloadStep,
} from "@/lib/preload";

/**
 * `loading`    — white screen, loading.lottie looping, assets downloading
 * `dissolving` — the dandelion shader is tearing the white sheet away
 * `revealed`   — the homepage is on show; music and the hero sequence run
 * `settled`    — nothing left to orchestrate
 */
export type BootStage = "loading" | "dissolving" | "revealed" | "settled";

type BootValue = {
  stage: BootStage;
  /** The hero may start its own sequence. */
  isLive: boolean;
  /**
   * The hero's own intro (hello → name → tail) still has to play. False once
   * it has run, so navigating back to `/` lands on a settled hero instead of
   * replaying four seconds of animation.
   */
  heroIntroPending: boolean;
  /** Scroll is held until the intro has fully played out. */
  scrollLocked: boolean;
  /** Called by the hero once its own sequence has landed. */
  markIntroDone: () => void;
};

const BootContext = createContext<BootValue>({
  stage: "settled",
  isLive: true,
  heroIntroPending: false,
  scrollLocked: false,
  markIntroDone: () => {},
});

export function useBoot(): BootValue {
  return useContext(BootContext);
}

/** The loading animation never flashes past — it holds for at least this long. */
const MIN_LOADER_MS = 1500;
const LOADER_FADE_MS = 620;
/** Breathing room between the name settling and the page becoming scrollable. */
const SCROLL_RELEASE_DELAY_MS = 1400;
/** Nothing may hold the page hostage longer than this, whatever goes wrong. */
const SCROLL_RELEASE_CEILING_MS = 15_000;

export function BootProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const reduced = usePrefersReducedMotion();

  const [stage, setStage] = useState<BootStage>(isHome ? "loading" : "settled");
  const [progress, setProgress] = useState(0);
  const [loaderOut, setLoaderOut] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(isHome);
  const [heroIntroPending, setHeroIntroPending] = useState(isHome);
  const shieldCleared = useRef(false);
  const scrollReleased = useRef(false);

  /** Hand the page back to the user: unlock scroll, drop the white shield. */
  const clearShield = useCallback(() => {
    if (shieldCleared.current) return;
    shieldCleared.current = true;
    document.documentElement.removeAttribute("data-booting");
  }, []);

  const releaseScroll = useCallback(() => {
    if (scrollReleased.current) return;
    scrollReleased.current = true;
    document.documentElement.removeAttribute("data-locked");
    setScrollLocked(false);
  }, []);

  /** The hero calls this when its last element has settled. */
  const markIntroDone = useCallback(() => {
    setHeroIntroPending(false);
    if (scrollReleased.current) return;
    setTimeout(releaseScroll, SCROLL_RELEASE_DELAY_MS);
  }, [releaseScroll]);

  // Backstop: a stalled animation must never leave the page unscrollable.
  useEffect(() => {
    if (!isHome) return;
    const t = setTimeout(releaseScroll, SCROLL_RELEASE_CEILING_MS);
    return () => clearTimeout(t);
  }, [isHome, releaseScroll]);

  useEffect(() => {
    if (!isHome) {
      clearShield();
      releaseScroll();
      return;
    }

    let cancelled = false;
    const startedAt = performance.now();

    const steps: PreloadStep[] = [
      { weight: 1, run: () => waitForFonts() },
      { weight: 1, run: () => loadDotLottie("/hello.lottie") },
      { weight: 1, run: () => preloadImage("/hero-video/hero-poster.jpg") },
      {
        weight: 5,
        run: async () => {
          const el = await whenMedia(MEDIA_KEYS.heroVideo, 4000);
          return el ? preloadMedia(el, { hardMs: 8000 }) : null;
        },
      },
      {
        weight: 3,
        run: async () => {
          const el = await whenMedia(MEDIA_KEYS.music, 4000);
          return el ? preloadMedia(el, { hardMs: 6500 }) : null;
        },
      },
    ];

    void (async () => {
      await runPreload(steps, (f) => {
        if (!cancelled) setProgress(f);
      });
      if (cancelled) return;

      const held = performance.now() - startedAt;
      const remaining = Math.max(0, MIN_LOADER_MS - held);
      await new Promise((r) => setTimeout(r, remaining));
      if (cancelled) return;

      setLoaderOut(true);
      await new Promise((r) => setTimeout(r, LOADER_FADE_MS));
      if (cancelled) return;

      setStage("dissolving");
      setShowTransition(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [isHome, clearShield, releaseScroll]);

  const onReveal = useCallback(() => {
    clearShield();
    setStage((s) => (s === "dissolving" ? "revealed" : s));
  }, [clearShield]);

  const onComplete = useCallback(() => {
    clearShield();
    setStage((s) => (s === "settled" ? s : "settled"));
    setShowTransition(false);
  }, [clearShield]);

  const value = useMemo<BootValue>(
    () => ({
      stage,
      isLive: stage === "revealed" || stage === "settled",
      heroIntroPending,
      scrollLocked,
      markIntroDone,
    }),
    [stage, heroIntroPending, scrollLocked, markIntroDone],
  );

  return (
    <BootContext.Provider value={value}>
      {children}

      {isHome && stage === "loading" && (
        <LoadingScreen progress={progress} out={loaderOut} />
      )}

      {isHome && showTransition && (
        <DandelionTransition
          reduced={reduced}
          onCurtainReady={clearShield}
          onReveal={onReveal}
          onComplete={onComplete}
        />
      )}
    </BootContext.Provider>
  );
}

function LoadingScreen({ progress, out }: { progress: number; out: boolean }) {
  return (
    <div
      className="fixed inset-0 z-[140] grid place-items-center bg-white"
      style={{
        opacity: out ? 0 : 1,
        transition: `opacity ${LOADER_FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        pointerEvents: out ? "none" : "auto",
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading Shirasaka Ren's portfolio"
    >
      <div className="flex flex-col items-center gap-8">
        <Lottie
          src="/loading.lottie"
          loop
          autoplay
          className="h-40 w-40 sm:h-48 sm:w-48"
        />
        <div className="h-[3px] w-36 overflow-hidden rounded-full bg-sakura-100 sm:w-44">
          <div
            className="h-full rounded-full bg-linear-to-r from-sakura-300 via-sakura-500 to-lilac-400"
            style={{
              width: `${Math.round(progress * 100)}%`,
              transition: "width 320ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
