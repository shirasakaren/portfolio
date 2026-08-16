"use client";

import { useEffect, useRef } from "react";

import { MEDIA_KEYS, provideMedia } from "@/lib/mediaRegistry";

import "./hero.css";

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
 * A soft, width-driven veil — not a scrim over the artwork (see the note on
 * `RIGHT_WASH`), just a little extra lift for the text as the crop tightens
 * and she fills more of the frame on a phone. Gone by ~860px, where the text
 * sits beside the illustration rather than on top of it; at the narrowest
 * phones it tops out at 30% alpha of the site's own cream — present, never a
 * haze over the artwork.
 */
const NARROW_VEIL_OPACITY = "clamp(0, calc((860px - 100vw) / 1600px), 0.3)";

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
   * The ladder is the fast path; this is the guarantee underneath it. If every
   * source is rejected — a browser that claims AV1 support but cannot decode
   * these streams, or one that trips on the ladder itself — force the plain
   * H.264 tier onto the element directly and let it play. `src` set directly
   * skips source negotiation entirely, so there is nothing left to go wrong.
   */
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let fallbackTried = false;

    const tryH264 = () => {
      if (fallbackTried) return;
      fallbackTried = true;
      v.src =
        window.innerWidth >= 900
          ? "/hero-video/hero-1080p.h264.mp4"
          : "/hero-video/hero-720p.h264.mp4";
      v.load();
      if (play) void v.play().catch(() => {});
    };

    // Source-level failures fire `error` on the <source> children; the capture
    // listener sees them on the way up. Only the terminal state acts: while the
    // browser is still working down the ladder, networkState is LOADING and the
    // error is not on the element yet.
    const onError = () => {
      if (v.networkState === HTMLMediaElement.NETWORK_NO_SOURCE || v.error) {
        tryH264();
      }
    };
    v.addEventListener("error", onError, true);

    // Some browsers sit silent instead of erroring. A stall with nothing
    // decoded is treated the same — but never while a download is in flight,
    // where interrupting would trade the lighter AV1 for a heavier H.264.
    const stall = setTimeout(() => {
      if (v.readyState < 2 && v.networkState !== HTMLMediaElement.NETWORK_LOADING) {
        tryH264();
      }
    }, 8000);
    const clearStall = () => clearTimeout(stall);
    v.addEventListener("canplay", clearStall);

    return () => {
      clearTimeout(stall);
      v.removeEventListener("canplay", clearStall);
      v.removeEventListener("error", onError, true);
    };
  }, [play]);

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
      className="hero-poster absolute inset-0 -z-10 bg-sakura-100 bg-cover"
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
        className="hero-video h-full w-full object-cover"
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

      {/* The width-driven veil described above `NARROW_VEIL_OPACITY`. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: "var(--color-cream)",
          opacity: NARROW_VEIL_OPACITY,
        }}
      />
    </div>
  );
}
