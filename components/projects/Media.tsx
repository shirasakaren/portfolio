"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { EASE } from "@/components/motion";
import type { Clip, Shot } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/motion";

/**
 * Screenshots and screen recordings for a project dossier.
 *
 * The gallery is a grid of thumbnails that opens a real dialog — Escape closes
 * it, Tab cannot escape it, and the arrow keys walk the set, because a
 * lightbox you can only leave with a mouse is a trap. The thumbnails are the
 * 720px variants; the dialog swaps to the 1600px one only once it opens, so
 * browsing the page never downloads the big files.
 */

export function Gallery({ shots, title }: { shots: Shot[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpen((i) => (i === null ? i : (i + delta + shots.length) % shots.length)),
    [shots.length],
  );

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shots.map((shot, i) => (
          <li key={shot.src}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full overflow-hidden rounded-[1.3rem] border border-sakura-200/70 bg-cream/70 text-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1"
            >
              <span
                className="relative block overflow-hidden bg-sakura-100"
                style={{ aspectRatio: shot.aspect }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
                <img
                  src={shot.thumb ?? shot.src}
                  alt={shot.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
                <span
                  aria-hidden
                  className="absolute right-2.5 bottom-2.5 grid size-7 place-items-center rounded-full bg-white/85 text-sm text-sakura-700 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
                >
                  ⤢
                </span>
              </span>
              <span className="block px-3.5 py-3 text-xs leading-snug font-semibold text-ink-500">
                {shot.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        shots={shots}
        index={open}
        title={title}
        onClose={close}
        onStep={step}
      />
    </>
  );
}

function Lightbox({
  shots,
  index,
  title,
  onClose,
  onStep,
}: {
  shots: Shot[];
  index: number | null;
  title: string;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduced = usePrefersReducedMotion();
  const isOpen = index !== null;

  useEffect(() => {
    if (!isOpen) return;

    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onStep(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onStep(-1);
        return;
      }
      if (e.key !== "Tab") return;

      // Keep Tab inside the dialog. Without this, focus walks off into the
      // page behind the backdrop, which for a keyboard user is a dead end.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [isOpen, onClose, onStep]);

  const shot = index === null ? null : shots[index];

  return (
    <AnimatePresence>
      {shot && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-ink-900/80 p-4 backdrop-blur-md sm:p-8"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — screenshot ${(index ?? 0) + 1} of ${shots.length}`}
        >
          <motion.div
            ref={panelRef}
            className="relative w-full max-w-6xl"
            initial={reduced ? false : { scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={reduced ? undefined : { scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
            <img
              src={shot.src}
              alt={shot.alt}
              className="max-h-[76vh] w-full rounded-[1.4rem] object-contain shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-xl text-sm text-sakura-100">{shot.caption}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onStep(-1)}
                  aria-label="Previous screenshot"
                  className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  ←
                </button>
                <p className="font-mono text-xs text-white/70 tabular-nums">
                  {(index ?? 0) + 1} / {shots.length}
                </p>
                <button
                  type="button"
                  onClick={() => onStep(1)}
                  aria-label="Next screenshot"
                  className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  →
                </button>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  className="ml-2 rounded-full bg-white px-4 py-2.5 font-display text-sm font-bold text-ink-900"
                >
                  close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * A screen recording.
 *
 * Sources are withheld until the element is near the viewport and playback
 * stops the moment it leaves — these clips run to 1.5MB each and a dossier can
 * hold two of them, which is not something to decode speculatively.
 */
export function ClipPlayer({ clip }: { clip: Clip }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "500px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  useEffect(() => {
    if (!near || reduced) return;
    const el = wrapRef.current;
    const v = videoRef.current;
    if (!el || !v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio > 0) {
          void v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      },
      { threshold: [0, 0.05], rootMargin: "-1px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, reduced]);

  return (
    <figure ref={wrapRef} className="overflow-hidden rounded-[1.3rem] border border-sakura-200/70 bg-cream/70">
      <div
        className="relative bg-sakura-100"
        style={{ aspectRatio: clip.aspect }}
      >
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          controls={reduced}
          preload="none"
          poster={clip.poster}
          aria-label={clip.alt}
          className="absolute inset-0 h-full w-full object-cover"
        >
          {near && !reduced && <source src={clip.mp4} type="video/mp4" />}
        </video>
      </div>
      <figcaption className="px-3.5 py-3 text-xs font-semibold text-ink-500">
        {clip.caption}
      </figcaption>
    </figure>
  );
}
