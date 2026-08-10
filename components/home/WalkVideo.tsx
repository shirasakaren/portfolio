"use client";

import { useEffect, useRef } from "react";

/**
 * Auto-playing looping video for the "walk" visual between sections.
 * Same playback survival pattern as HeroVideo/FightVideo.
 */
export function WalkVideo() {
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
    <div className="relative overflow-hidden rounded-2xl">
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
        poster="/walk-poster.jpg"
        className="h-full w-full object-cover"
      >
        <source
          src="/walk-h264.mp4"
          type='video/mp4; codecs="avc1.64002a"'
          media="(min-width: 640px)"
        />
        <source
          src="/walk-720p.mp4"
          type='video/mp4; codecs="avc1.64002a"'
        />
      </video>
    </div>
  );
}
