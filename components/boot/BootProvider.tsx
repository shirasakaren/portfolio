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
  /** This page never had a boot sequence (direct entry to an inner page). */
  skipped: boolean;
};

const BootContext = createContext<BootValue>({
  stage: "settled",
  isLive: true,
  skipped: true,
});

export function useBoot(): BootValue {
  return useContext(BootContext);
}

/** The loading animation never flashes past — it holds for at least this long. */
const MIN_LOADER_MS = 1500;
const LOADER_FADE_MS = 620;

export function BootProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const reduced = usePrefersReducedMotion();

  const [stage, setStage] = useState<BootStage>(isHome ? "loading" : "settled");
  const [progress, setProgress] = useState(0);
  const [loaderOut, setLoaderOut] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const shieldCleared = useRef(false);

  /** Hand the page back to the user: unlock scroll, drop the white shield. */
  const clearShield = useCallback(() => {
    if (shieldCleared.current) return;
    shieldCleared.current = true;
    document.documentElement.removeAttribute("data-booting");
  }, []);

  useEffect(() => {
    if (!isHome) {
      clearShield();
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
  }, [isHome, clearShield]);

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
      skipped: !isHome,
    }),
    [stage, isHome],
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
