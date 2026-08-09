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
 * No scrim over the artwork itself. The only concession to legibility is a
 * light wash on the right, under the text column — a *lightening* gradient
 * rather than a darkening one, so it reads as daylight from the window instead
 * of a panel laid over the illustration. The girl, the cat and the desk keep
 * their original colours; the rest of the text's contrast comes from
 * glyph-attached halos.
 */

/**
 * Peaks where the text is densest (the right edge) and is gone by 70% across,
 * well before the subject. Alphas are deliberately low — this should be
 * invisible as a layer and only felt as contrast.
 */
const RIGHT_WASH =
  "linear-gradient(to left," +
  " rgba(255,250,252,0.46) 0%," +
  " rgba(255,250,252,0.33) 18%," +
  " rgba(255,250,252,0.17) 38%," +
  " rgba(255,250,252,0.05) 55%," +
  " rgba(255,250,252,0) 68%)";

/**
 * Tier breakpoints are deliberately higher than the encode ladder's defaults.
 * AV1 has no hardware decoder on most Macs before M3 or on older PCs, so a
 * 2560×1440 stream is decoded in software — continuously, for the whole visit.
 * For a background illustration sitting behind text that is a bad trade, so a
 * typical 1440px-wide window now gets the 1080p tier and only genuinely large
 * displays pull the heavy ones.
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

  /**
   * Keep it rolling whenever the hero is on screen.
   *
   * A single play() on mount is not enough: browsers pause off-screen video to
   * save power, a backgrounded tab suspends it, and client-side navigation away
   * from `/` and back builds a fresh element that starts paused. So instead of
   * firing once, we state the invariant — visible means playing — and re-assert
   * it on every event that could have broken it.
   */
  useEffect(() => {
    const v = ref.current;
    if (!v || !play) return;

    let alive = true;
    let onScreen = true;

    const ensurePlaying = () => {
      if (!alive) return;
      if (!onScreen || document.hidden) {
        // Nothing to look at: stop decoding rather than merely not resuming.
        if (!v.paused) v.pause();
        return;
      }
      if (v.paused || v.ended) {
        void v.play().catch(() => {
          /* muted inline playback is allowed everywhere we support */
        });
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Chrome reports isIntersecting = true with ratio 0 when the element's
        // edge exactly touches the viewport's — which is precisely where the
        // hero snap parks. The ratio is the honest signal.
        onScreen = entry.isIntersecting && entry.intersectionRatio > 0;
        ensurePlaying();
      },
      // The 1px inset matters: parked at the snap seam the hero's bottom edge
      // sits exactly on the viewport's top, which Chrome still calls
      // "intersecting" — so with a bare 0 threshold nothing is ever crossed and
      // the callback never fires at all. Shrinking the root makes that case
      // decisively outside.
      { threshold: [0, 0.01], rootMargin: "-1px 0px" },
    );
    observer.observe(v);

    // `pause` covers the browser pausing us; the media events cover a source
    // that finished loading after we first asked.
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
          media="(min-width: 2400px)"
        />
        <source
          src="/hero-video/hero-1440p.av1.mp4"
          type={AV1_HIGH}
          media="(min-width: 1700px)"
        />
        <source
          src="/hero-video/hero-1080p.av1.mp4"
          type={AV1_MID}
          media="(min-width: 900px)"
        />
        <source src="/hero-video/hero-720p.av1.mp4" type={AV1_LOW} />
        <source
          src="/hero-video/hero-1080p.h264.mp4"
          type={H264}
          media="(min-width: 900px)"
        />
        <source src="/hero-video/hero-720p.h264.mp4" type={H264} />
      </video>

      {/* Lighter on small screens, where the text is centred and the backdrop
          behind it is already bright. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 md:opacity-100"
        style={{ backgroundImage: RIGHT_WASH }}
      />
    </div>
  );
}
