"use client";

import { useEffect } from "react";

import { useAudio } from "@/components/audio/AudioProvider";
import { useBoot } from "@/components/boot/BootProvider";

/**
 * Unmutes the music at the right moment: as the dandelions clear on the
 * homepage, or immediately on any page entered directly.
 *
 * Lives here rather than in the hero so that landing straight on /about still
 * gets the soundtrack.
 */
export function AudioStarter() {
  const { isLive } = useBoot();
  const { start } = useAudio();

  useEffect(() => {
    if (isLive) start();
  }, [isLive, start]);

  return null;
}
