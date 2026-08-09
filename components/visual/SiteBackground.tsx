"use client";

import { usePathname } from "next/navigation";

import { useBoot } from "@/components/boot/BootProvider";
import { PetalField } from "@/components/visual/PetalField";

/**
 * Decides when the shader background is allowed to exist.
 *
 * On the homepage the dandelion transition owns the GPU for the first few
 * seconds, and the hero video is decoding at the same time — starting a second
 * WebGL context in the middle of that is exactly the kind of contention that
 * shows up as a dropped frame in the one animation nobody should ever see
 * stutter. So on `/` the field waits until the boot sequence has settled; on
 * every other route it mounts immediately.
 */
export function SiteBackground() {
  const pathname = usePathname();
  const { isLive } = useBoot();

  if (pathname === "/" && !isLive) return null;

  return <PetalField />;
}
