"use client";

import { useSyncExternalStore } from "react";

/**
 * Shows the current time in JST (UTC+9), updating on each minute boundary.
 *
 * Uses `useSyncExternalStore` so the subscription is side-effect free.
 * Returns a **string** from getSnapshot — never a fresh object — because
 * React compares snapshots with Object.is and a new `Date` every call
 * would trigger an infinite re-render loop.
 */

function jstNowISO(): string {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  ).toISOString();
}

let _subs = 0;
let _timer: ReturnType<typeof setTimeout> | null = null;

function subscribe(onChange: () => void) {
  _subs++;
  if (!_timer) {
    const schedule = () => {
      const delay = (60 - new Date().getSeconds()) * 1000 + 100;
      _timer = setTimeout(() => {
        onChange();
        _timer = null;
        schedule();
      }, delay);
    };
    schedule();
  }
  return () => {
    _subs--;
    if (_subs <= 0 && _timer) {
      clearTimeout(_timer);
      _timer = null;
      _subs = 0;
    }
  };
}

/** Returns an ISO string — a primitive, so Object.is works correctly. */
function getSnapshot() {
  return jstNowISO();
}

function getServerSnapshot() {
  return null;
}

export function JstClock({ className = "" }: { className?: string }) {
  const iso = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!iso) {
    return <span className={className}>JST</span>;
  }

  const time = new Date(iso);

  const day = time.toLocaleDateString("en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const clock = time.toLocaleTimeString("en-US", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <span className={className}>
      {day} · {clock} JST
    </span>
  );
}
