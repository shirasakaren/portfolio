"use client";

import { useEffect, useRef } from "react";

/**
 * Auto-playing looping video that survives navigation — pauses when
 * off-screen or when the tab is hidden, resumes when visible.
 * Same pattern as HeroVideo's playback manager.
 */
export function FightVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    let alive = true;
    let onScreen = true;

    const ensurePlaying = () => {
      if (!alive) return;
      if (!onScreen || document.hidden) {
        if (!v.paused) v.pause();
        return;
      }
      if (v.paused || v.ended) {
        void v.play().catch(() => {
          /* muted autoplay is allowed everywhere */
        });
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting && entry.intersectionRatio > 0;
        ensurePlaying();
      },
      { threshold: [0, 0.01] },
    );
    observer.observe(v);

    for (const type of ["pause", "canplay", "loadeddata", "stalled"]) {
      v.addEventListener(type, ensurePlaying);
    }
    document.addEventListener("visibilitychange", ensurePlaying);

    ensurePlaying();

    return () => {
      alive = false;
      observer.disconnect();
      for (const type of ["pause", "canplay", "loadeddata", "stalled"]) {
        v.removeEventListener(type, ensurePlaying);
      }
      document.removeEventListener("visibilitychange", ensurePlaying);
    };
  }, []);

  return (
    <div className="flex h-full min-h-[280px] w-full flex-col sm:min-h-[340px]">
      <div className="relative flex-1 overflow-hidden rounded-2xl">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          poster="/fight-poster.jpg"
          className="h-full w-full object-cover"
        >
          <source
            src="/fight-h264.mp4"
            type='video/mp4; codecs="avc1.64002a"'
            media="(min-width: 640px)"
          />
          <source
            src="/fight-720p.mp4"
            type='video/mp4; codecs="avc1.64002a"'
          />
        </video>
      </div>
      <p className="mt-2 text-center font-display text-xs font-bold tracking-[0.2em] text-ink-400 uppercase">
        me fighting downtime
      </p>
    </div>
  );
}
