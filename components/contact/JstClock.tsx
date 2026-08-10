"use client";

import { useSyncExternalStore } from "react";

/**
 * Shows the current time in JST (UTC+9), updating on each minute boundary.
 *
 * Uses `useSyncExternalStore` so the subscription is side-effect free —
 * the lint rule that forbids `setState` inside an effect has no purchase here.
 * The store fires once per minute, aligned to the top of the minute so every
 * clock on the page ticks in unison.
 */

function jstNow(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
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

function getSnapshot() {
  return jstNow();
}

function getServerSnapshot() {
  return null;
}

export function JstClock({ className = "" }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!time) {
    return <span className={className}>JST</span>;
  }

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
