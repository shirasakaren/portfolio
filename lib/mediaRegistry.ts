/**
 * A tiny rendezvous between the boot sequence and the media elements it waits
 * on.
 *
 * The hero video lives in `<Hero>` and the music element in `<AudioProvider>`,
 * but the loading screen has to know when both are buffered. Rather than thread
 * refs through the tree, each owner drops its element here by name and the boot
 * sequence awaits it.
 */

type Entry = {
  promise: Promise<HTMLMediaElement | null>;
  resolve: (el: HTMLMediaElement | null) => void;
  element: HTMLMediaElement | null;
};

const registry = new Map<string, Entry>();

function entry(key: string): Entry {
  let e = registry.get(key);
  if (!e) {
    let resolve!: (el: HTMLMediaElement | null) => void;
    const promise = new Promise<HTMLMediaElement | null>((r) => (resolve = r));
    e = { promise, resolve, element: null };
    registry.set(key, e);
  }
  return e;
}

export function provideMedia(key: string, el: HTMLMediaElement | null): void {
  const e = entry(key);
  if (!el) return; // unmount — leave any earlier resolution alone
  e.element = el;
  e.resolve(el);
}

/** Resolves with the element, or `null` if it never showed up in time. */
export function whenMedia(
  key: string,
  timeoutMs = 3000,
): Promise<HTMLMediaElement | null> {
  const e = entry(key);
  if (e.element) return Promise.resolve(e.element);
  return Promise.race([
    e.promise,
    new Promise<null>((r) => setTimeout(() => r(null), timeoutMs)),
  ]);
}

export const MEDIA_KEYS = {
  heroVideo: "hero-video",
  music: "music",
} as const;
