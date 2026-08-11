"use client";

import { usePathname } from "next/navigation";

import { useBoot } from "@/components/boot/BootProvider";
import { Topography } from "@/components/visual/Topography";

// Sakura and lilac tokens from app/globals.css, pulled in as hex literals
// because the shader takes plain colors rather than CSS custom properties.
// Medium saturation on purpose — present enough to notice, not so bold it
// competes with the page content.
const LOW = "#fff7fa"; // --color-sakura-50
const MID = "#ffb7c5"; // --color-sakura-300
const HIGH = "#dcb9ff"; // --color-lilac-300

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

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-linear-to-b from-sakura-50 via-cream to-sakura-100/70"
    >
      <Topography
        className="h-full w-full"
        lowColor={LOW}
        midColor={MID}
        highColor={HIGH}
        speed={0.09}
        morphAmount={1.3}
        morphSpeed={0.035}
        bands={3.2}
        thickness={0.011}
        scale={1.25}
        pixelSize={1}
        glow={0.4}
        colorMode="elevation"
        contrast={1.75}
        brightness={1}
        fillBands
        opacity={0.36}
        grain
        grainIntensity={0.028}
        mouseInteraction
        mouseRadius={0.35}
        mouseStrength={0.2}
      />
      {/* A bottom-weighted fade so the canvas edge never reads as a seam
          against the header's blur. */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-sakura-100/40" />
    </div>
  );
}
