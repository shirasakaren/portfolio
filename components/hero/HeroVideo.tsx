"use client";

import { useEffect, useRef } from "react";

import { MEDIA_KEYS, provideMedia } from "@/lib/mediaRegistry";

/**
 * The hero background, straight off the encode ladder in
 * public/hero-video/README.md.
 *
 * The `codecs=` strings are load-bearing: with a bare `video/mp4` a browser
 * without AV1 support would claim it can play the AV1 file and then show
 * nothing. AV1 sources must also stay ahead of the H.264 fallbacks, since the
 * browser takes the first source whose `media` matches *and* whose codec it
 * knows.
 *
 * Deliberately un-scrimmed — the artwork is the point. Hero text earns its
 * legibility from glyph-attached halos instead.
 */

const AV1_HIGH = 'video/mp4; codecs="av01.0.12M.10.0.110.01.01.01.0"';
const AV1_MID = 'video/mp4; codecs="av01.0.08M.10.0.110.01.01.01.0"';
const AV1_LOW = 'video/mp4; codecs="av01.0.05M.10.0.110.01.01.01.0"';
const H264 = 'video/mp4; codecs="avc1.64002a"';

export function HeroVideo({ play }: { play: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  // Let the boot sequence wait on this element's buffering.
  useEffect(() => {
    provideMedia(MEDIA_KEYS.heroVideo, ref.current);
  }, []);

  // Playback starts a beat before the dandelions, so the page the transition
  // uncovers is already in motion.
  useEffect(() => {
    const v = ref.current;
    if (!v || !play) return;
    try {
      if (v.readyState >= 1 && v.currentTime > 0.05) v.currentTime = 0;
    } catch {
      /* not seekable yet — it'll just start from wherever it is */
    }
    void v.play().catch(() => {
      /* muted inline video is allowed everywhere we support; nothing to do */
    });
  }, [play]);

  return (
    <div
      className="absolute inset-0 -z-10 bg-sakura-100 bg-cover bg-center"
      style={{
        backgroundImage:
          'image-set(url("/hero-video/hero-poster.avif") type("image/avif"), url("/hero-video/hero-poster.webp") type("image/webp"), url("/hero-video/hero-poster.jpg") type("image/jpeg"))',
      }}
    >
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
        className="h-full w-full object-cover object-[62%_center] md:object-center"
      >
        <source
          src="/hero-video/hero-2160p.av1.mp4"
          type={AV1_HIGH}
          media="(min-width: 2000px)"
        />
        <source
          src="/hero-video/hero-1440p.av1.mp4"
          type={AV1_HIGH}
          media="(min-width: 1280px)"
        />
        <source
          src="/hero-video/hero-1080p.av1.mp4"
          type={AV1_MID}
          media="(min-width: 760px)"
        />
        <source src="/hero-video/hero-720p.av1.mp4" type={AV1_LOW} />
        <source
          src="/hero-video/hero-1080p.h264.mp4"
          type={H264}
          media="(min-width: 760px)"
        />
        <source src="/hero-video/hero-720p.h264.mp4" type={H264} />
      </video>
    </div>
  );
}
