/**
 * Boot-time asset preloading.
 *
 * The loading animation stays up until everything the reveal depends on is
 * genuinely in memory — the hero video buffered enough to play, the music
 * decodable, the fonts resolved — because the whole point of the dandelion
 * transition is landing on a homepage that is *already alive*.
 *
 * Every step is individually fail-soft and the whole thing is wrapped in a hard
 * ceiling: a slow CDN should delay the intro, never trap someone on a white
 * screen.
 */

export type PreloadStep = {
  /** Relative pull on the progress bar. */
  weight: number;
  run: () => Promise<unknown>;
};

export const PRELOAD_TIMEOUT_MS = 12_000;

/** Resolves (rather than rejects) once `ms` has passed. */
function timeout(ms: number): Promise<"timeout"> {
  return new Promise((resolve) => setTimeout(() => resolve("timeout"), ms));
}

/** Never reject — a missing decoration must not hold the door shut. */
function soft<T>(p: Promise<T>): Promise<T | null> {
  return p.catch(() => null);
}

export function waitForFonts(): Promise<unknown> {
  if (typeof document === "undefined" || !("fonts" in document)) {
    return Promise.resolve();
  }
  return soft(document.fonts.ready);
}

/** Fetch and cache a URL so the browser serves it from memory later. */
export function warmCache(url: string): Promise<unknown> {
  return soft(fetch(url, { cache: "force-cache" }).then((r) => r.arrayBuffer()));
}

export function preloadImage(url: string): Promise<unknown> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Resolve once a media element has buffered enough to play through without a
 * stall. `canplaythrough` is the honest signal but some browsers sit on it
 * forever, so `canplay` plus a grace period acts as the floor.
 */
export function preloadMedia(
  el: HTMLMediaElement,
  { hardMs = 9000 }: { hardMs?: number } = {},
): Promise<unknown> {
  if (el.readyState >= 4) return Promise.resolve();

  return new Promise((resolve) => {
    let settled = false;
    let graceTimer: ReturnType<typeof setTimeout> | undefined;

    const done = () => {
      if (settled) return;
      settled = true;
      clearTimeout(graceTimer);
      clearTimeout(hardTimer);
      el.removeEventListener("canplaythrough", onThrough);
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("error", done);
      el.removeEventListener("stalled", done);
      resolve(null);
    };

    const onThrough = () => done();
    // Enough to start, but give the buffer a moment to get ahead of playback.
    const onCanPlay = () => {
      clearTimeout(graceTimer);
      graceTimer = setTimeout(done, 1200);
    };

    const hardTimer = setTimeout(done, hardMs);

    el.addEventListener("canplaythrough", onThrough);
    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("error", done);
    el.addEventListener("stalled", done);

    if (el.readyState >= 3) onCanPlay();
    el.load();
  });
}

/**
 * Run every step, reporting weighted progress as each lands.
 * Always resolves — worst case after `PRELOAD_TIMEOUT_MS`.
 */
export async function runPreload(
  steps: PreloadStep[],
  onProgress: (fraction: number) => void,
): Promise<void> {
  const total = steps.reduce((sum, s) => sum + s.weight, 0) || 1;
  let done = 0;

  const all = Promise.all(
    steps.map((step) =>
      soft(Promise.resolve(step.run())).then((value) => {
        done += step.weight;
        onProgress(Math.min(1, done / total));
        return value;
      }),
    ),
  );

  await Promise.race([all, timeout(PRELOAD_TIMEOUT_MS)]);
  onProgress(1);
}
