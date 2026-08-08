/**
 * Volume and mute, persisted across visits and shared across tabs.
 *
 * Written as an external store rather than "read localStorage in an effect" so
 * the value is available on the very first client render — no flash of the
 * default volume, no cascading re-render, and hydration stays honest because
 * the server snapshot is explicitly the default.
 */

export type AudioPrefs = { volume: number; muted: boolean };

export const DEFAULT_PREFS: AudioPrefs = { volume: 0.5, muted: false };

const KEY = "ren:audio";

let cache: AudioPrefs | null = null;
const listeners = new Set<() => void>();

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function read(): AudioPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<AudioPrefs>;
    return {
      volume:
        typeof parsed.volume === "number" && Number.isFinite(parsed.volume)
          ? clamp01(parsed.volume)
          : DEFAULT_PREFS.volume,
      muted:
        typeof parsed.muted === "boolean" ? parsed.muted : DEFAULT_PREFS.muted,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function subscribePrefs(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null; // re-read on next snapshot
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Stable reference while unchanged, as `useSyncExternalStore` requires. */
export function getPrefs(): AudioPrefs {
  cache ??= read();
  return cache;
}

export function getServerPrefs(): AudioPrefs {
  return DEFAULT_PREFS;
}

export function updatePrefs(patch: Partial<AudioPrefs>): void {
  const next = { ...getPrefs(), ...patch };
  if (next.volume === cache?.volume && next.muted === cache?.muted) return;
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode or quota — the in-memory value still works */
  }
  listeners.forEach((l) => l());
}
