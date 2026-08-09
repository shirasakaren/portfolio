"use client";

import { useEffect, useRef, useState } from "react";

import { reactions, type ReactionName } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/motion";

/**
 * Ren, reacting.
 *
 * These are the emotional punctuation of the whole site, so they get the same
 * treatment as the hero video rather than being dropped in as GIFs:
 *
 *   • WebM/MP4 instead of GIF — roughly a tenth of the bytes and smooth,
 *     with the animated WebP kept as the fallback for anything that refuses
 *     both codecs;
 *   • decoding only starts when the clip is actually near the viewport, and
 *     stops the moment it leaves, so a page with eight of them is not decoding
 *     eight videos at once;
 *   • `prefers-reduced-motion` gets the poster frame and nothing else.
 */

type Props = {
  name: ReactionName;
  className?: string;
  /** Tailwind size classes for the frame. */
  size?: string;
  /** Aspect ratio of the frame; the clip is cover-fitted inside it. */
  ratio?: string;
  /** Decorative by default — pass a caption to make it meaningful. */
  caption?: string;
  rounded?: string;
  /** Skip the lazy gate for something above the fold. */
  eager?: boolean;
};

export function ReactionClip({
  name,
  className = "",
  size = "w-40",
  ratio = "1 / 1",
  caption,
  rounded = "rounded-[1.6rem]",
  eager = false,
}: Props) {
  const meta: { file: string; alt: string; transparent?: boolean } =
    reactions[name];
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const [near, setNear] = useState(eager);
  const [videoFailed, setVideoFailed] = useState(false);

  // Only mount the sources once we're close to the viewport.
  useEffect(() => {
    if (near) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  // Play only while on screen. Off-screen decoding is the expensive part.
  useEffect(() => {
    if (!near || reduced || videoFailed || meta.transparent) return;
    const el = wrapRef.current;
    const v = videoRef.current;
    if (!el || !v) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          void v.play().catch(() => {
            /* muted inline playback is allowed everywhere we ship */
          });
        } else if (!v.paused) {
          v.pause();
        }
      },
      { threshold: [0, 0.01], rootMargin: "-1px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, reduced, videoFailed, meta.transparent]);

  const src = `/ren/${meta.file}`;
  const still = `${src}-poster.webp`;
  const asImage = reduced || videoFailed || meta.transparent;

  return (
    <figure className={`${size} ${className}`}>
      <div
        ref={wrapRef}
        className={`relative overflow-hidden ${rounded} border border-sakura-200/70 bg-sakura-100/60 shadow-[0_16px_40px_-22px_rgba(214,51,108,0.65)]`}
        style={{ aspectRatio: ratio }}
      >
        {asImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- static export, no loader
          <img
            src={reduced ? still : `${src}.webp`}
            alt={caption ?? meta.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload={near ? "auto" : "none"}
            poster={still}
            aria-label={caption ?? meta.alt}
            onError={() => setVideoFailed(true)}
            className="h-full w-full object-cover"
          >
            {/* H.264 only. The VP9 encodes of these clips came out
                consistently larger than the MP4s, and a <source> the browser
                prefers is a <source> that costs the visitor more. */}
            {near && <source src={`${src}.mp4`} type="video/mp4" />}
          </video>
        )}

        {/* A soft inner light so the clip sits in the page instead of on it. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/45"
        />
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-center font-display text-xs font-bold text-sakura-600">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
