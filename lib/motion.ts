"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
/** Prerendered HTML assumes motion is fine; the client corrects on hydration. */
const getServerSnapshot = () => false;

/**
 * `prefers-reduced-motion` as live state.
 *
 * Everything expensive on this site — the dandelion transition, the name
 * reveal, the drifting decorations — checks this and substitutes a plain fade.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Non-reactive read, for imperative code that runs once. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(QUERY).matches;
}
