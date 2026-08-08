/**
 * dotLottie (.lottie) loading.
 *
 * A `.lottie` file is a zip around the Lottie JSON, and the compression is
 * dramatic here — 404.lottie is 50 KB on the wire versus 334 KB of raw JSON.
 * So we ship the `.lottie` files as-authored and unzip in the browser with
 * fflate (~8 KB) rather than pre-extracting at build time. The archives stay
 * the single source of truth: drop in a new one and the site picks it up.
 */

import { strFromU8, unzipSync } from "fflate";

export type LottieJSON = Record<string, unknown>;

const cache = new Map<string, Promise<LottieJSON>>();

async function fetchAndUnzip(url: string): Promise<LottieJSON> {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`[lottie] ${url} -> HTTP ${res.status}`);

  const bytes = new Uint8Array(await res.arrayBuffer());
  const files = unzipSync(bytes);

  // The manifest names the animation; fall back to the first JSON we find.
  let entry: string | undefined;
  const manifestRaw = files["manifest.json"];
  if (manifestRaw) {
    try {
      const manifest = JSON.parse(strFromU8(manifestRaw)) as {
        animations?: { id?: string }[];
      };
      const id = manifest.animations?.[0]?.id;
      if (id && files[`animations/${id}.json`]) entry = `animations/${id}.json`;
    } catch {
      // Malformed manifest is survivable; the fallback below handles it.
    }
  }
  entry ??= Object.keys(files).find(
    (name) => name.startsWith("animations/") && name.endsWith(".json"),
  );

  if (!entry) throw new Error(`[lottie] no animation inside ${url}`);
  return JSON.parse(strFromU8(files[entry])) as LottieJSON;
}

/** Load (and memoise) the animation data inside a `.lottie` archive. */
export function loadDotLottie(url: string): Promise<LottieJSON> {
  let pending = cache.get(url);
  if (!pending) {
    pending = fetchAndUnzip(url).catch((err) => {
      cache.delete(url); // let a later mount retry
      throw err;
    });
    cache.set(url, pending);
  }
  return pending;
}
