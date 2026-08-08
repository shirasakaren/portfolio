"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

import { loadDotLottie } from "@/lib/dotlottie";

export type LottieHandle = AnimationItem;

type Props = {
  /** Path to a `.lottie` archive under /public. */
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  /**
   * Override the SVG viewBox to crop the composition to its artwork —
   * `hello.lottie` draws a ~900px word inside a 1920×1080 canvas.
   */
  viewBox?: string;
  className?: string;
  /** Fires once the animation is parsed and in the DOM. */
  onReady?: (anim: AnimationItem) => void;
  onError?: (err: unknown) => void;
  /** Omit for decorative animations so screen readers skip them. */
  label?: string;
};

export function Lottie({
  src,
  loop = false,
  autoplay = true,
  speed = 1,
  viewBox,
  className,
  onReady,
  onError,
  label,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  // Kept in refs so changing a callback never tears down the animation.
  // Refreshed in an effect declared ahead of the loader below, so it always
  // holds the latest value by the time the animation resolves.
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onReadyRef.current = onReady;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let anim: AnimationItem | undefined;
    let cancelled = false;

    void (async () => {
      try {
        // The player is ~55 KB gzipped — keep it out of the initial bundle.
        const [{ default: lottie }, animationData] = await Promise.all([
          import("lottie-web/build/player/lottie_light"),
          loadDotLottie(src),
        ]);
        if (cancelled) return;

        anim = lottie.loadAnimation({
          container: host,
          renderer: "svg",
          loop,
          autoplay,
          animationData,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            progressiveLoad: true,
          },
        });
        anim.setSpeed(speed);

        if (viewBox) {
          const svg = host.querySelector("svg");
          svg?.setAttribute("viewBox", viewBox);
        }

        onReadyRef.current?.(anim);
      } catch (err) {
        if (!cancelled) onErrorRef.current?.(err);
      }
    })();

    return () => {
      cancelled = true;
      anim?.destroy();
      host.replaceChildren();
    };
    // `speed`/`viewBox` are applied on load; changing them mid-flight is not a
    // case this site has, and reloading the animation for it would be worse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, loop, autoplay]);

  return (
    <div
      ref={hostRef}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
