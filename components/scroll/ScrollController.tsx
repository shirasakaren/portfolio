"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useBoot } from "@/components/boot/BootProvider";
import { usePrefersReducedMotion } from "@/lib/motion";

/**
 * Scrolling, in three modes.
 *
 *   locked  — during the intro; nothing moves
 *   snapped — the hero behaves like a slide: it stays pinned until you push
 *             past a threshold, then the page animates to the next section in
 *             one move (and back up the same way)
 *   smooth  — everywhere else, wheel input drives an eased target rather than
 *             the scroll position directly
 *
 * Touch keeps native momentum below the hero — no JS reimplementation comes
 * close — but the hero's snap is handled for touch too, so the slide behaves
 * the same on a phone. `prefers-reduced-motion` opts out of all of it.
 */

/** Accumulated wheel delta before the hero lets go. */
const SNAP_WHEEL_PX = 80;
/** Same, for a finger drag — shorter, because a swipe is more deliberate. */
const SNAP_TOUCH_PX = 52;
const SNAP_MS = 900;
/** Fraction of the remaining distance covered per 60fps frame. */
const LERP = 0.115;
/** How close before we call it arrived, in px. */
const EPSILON = 0.35;
/** Tolerance for "the scroll position is where we last put it". */
const DRIFT = 2;

const SCROLL_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "PageDown",
  "PageUp",
  "Home",
  "End",
  " ",
]);

function easeInOutCubic(p: number): number {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

/** Wheel deltas arrive in pixels, lines or pages depending on the device. */
function wheelPixels(e: WheelEvent): number {
  if (e.deltaMode === 1) return e.deltaY * 16;
  if (e.deltaMode === 2) return e.deltaY * window.innerHeight;
  return e.deltaY;
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

export function ScrollController() {
  const pathname = usePathname();
  const { scrollLocked } = useBoot();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    // Reduced motion gets the browser's own scrolling, untouched.
    if (reduced) return;

    const hero =
      pathname === "/" ? document.getElementById("hero") : null;

    let current = window.scrollY;
    let target = current;
    let raf = 0;
    let running = false;
    let snapping = false;
    let lastFrame = 0;
    let accumDown = 0;
    let accumUp = 0;
    let touchY = 0;

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    /** Bottom edge of the hero — measured, not assumed to be the viewport. */
    const heroBottom = () =>
      hero ? Math.round(hero.offsetTop + hero.offsetHeight) : 0;

    /**
     * Free scrolling never drifts back up into the hero; the only way in is the
     * deliberate up-snap. Without this, a fast flick could coast past the seam
     * and leave the slide half-shown.
     */
    const clampTarget = (v: number) =>
      Math.min(maxScroll(), Math.max(heroBottom(), v));

    const scrollTo = (y: number) => {
      current = y;
      window.scrollTo({ top: y, left: 0, behavior: "instant" });
    };

    const step = (now: number) => {
      const dt = Math.min(64, now - lastFrame);
      lastFrame = now;
      // Frame-rate independent easing: LERP is defined per 60fps frame.
      const k = 1 - Math.pow(1 - LERP, dt / (1000 / 60));
      const next = current + (target - current) * k;
      scrollTo(Math.abs(target - next) < EPSILON ? target : next);

      if (current !== target) {
        raf = requestAnimationFrame(step);
      } else {
        running = false;
      }
    };

    const startLoop = () => {
      if (running || snapping) return;
      running = true;
      current = window.scrollY;
      lastFrame = performance.now();
      raf = requestAnimationFrame(step);
    };

    const snapTo = (to: number) => {
      cancelAnimationFrame(raf);
      running = false;
      const from = window.scrollY;
      const distance = to - from;
      if (Math.abs(distance) < 1) {
        target = to;
        current = to;
        return;
      }
      snapping = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / SNAP_MS);
        scrollTo(from + distance * easeInOutCubic(p));
        if (p < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          snapping = false;
          target = to;
        }
      };
      raf = requestAnimationFrame(tick);
    };

    /**
     * Returns true if the gesture was consumed by the hero slide.
     * `delta` is positive downward.
     */
    const handleHero = (delta: number, threshold: number): boolean => {
      if (!hero) return false;
      const y = window.scrollY;
      const bottom = heroBottom();

      if (y < bottom - 2) {
        // Pinned on the hero: accumulate until it lets go.
        if (delta > 0) {
          accumUp = 0;
          accumDown += delta;
          if (accumDown >= threshold) {
            accumDown = 0;
            snapTo(bottom);
          }
        } else {
          accumDown = 0;
        }
        return true;
      }

      // A hard upward flick clamps at the seam first, then the next events
      // accumulate here — so the tolerance is wide enough to catch them.
      if (Math.abs(y - bottom) <= 6 && delta < 0) {
        // Sitting on the seam, pushing up: go back to the hero.
        accumDown = 0;
        accumUp -= delta;
        if (accumUp >= threshold) {
          accumUp = 0;
          snapTo(0);
        }
        return true;
      }

      accumUp = 0;
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      if (scrollLocked || snapping) {
        e.preventDefault();
        return;
      }
      const delta = wheelPixels(e);
      if (handleHero(delta, SNAP_WHEEL_PX)) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      target = clampTarget((running ? target : window.scrollY) + delta);
      startLoop();
    };

    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
      accumDown = 0;
      accumUp = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (scrollLocked || snapping) {
        e.preventDefault();
        return;
      }
      const y = e.touches[0]?.clientY ?? touchY;
      const delta = touchY - y; // finger up = scrolling down
      touchY = y;
      // Below the hero, native momentum is better than anything we'd write.
      if (handleHero(delta, SNAP_TOUCH_PX)) e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (scrollLocked) {
        if (SCROLL_KEYS.has(e.key)) e.preventDefault();
        return;
      }
      if (!hero || snapping) return;

      const down =
        e.key === "ArrowDown" ||
        e.key === "PageDown" ||
        (e.key === " " && !e.shiftKey);
      const up =
        e.key === "ArrowUp" ||
        e.key === "PageUp" ||
        e.key === "Home" ||
        (e.key === " " && e.shiftKey);

      if (!down && !up) return;
      if (handleHero(down ? SNAP_WHEEL_PX : -SNAP_WHEEL_PX, SNAP_WHEEL_PX)) {
        e.preventDefault();
      }
    };

    /**
     * Anything that moved the page without going through us — a scrollbar drag,
     * an in-page anchor, the browser restoring position. Re-sync so the next
     * wheel event eases from where the page actually is.
     */
    const onScroll = () => {
      if (snapping) return;
      const y = window.scrollY;
      // Our own scrollTo lands within DRIFT of `current`, so anything outside
      // that came from elsewhere. Adopt it as the new target, which also stops
      // an in-flight ease from dragging the page back to where it was going.
      if (Math.abs(y - current) > DRIFT) {
        current = y;
        target = y;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname, scrollLocked, reduced]);

  return null;
}
