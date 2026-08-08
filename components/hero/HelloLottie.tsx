"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

import { Lottie } from "@/components/lottie/Lottie";

/**
 * `hello.lottie` writes the word on with three offset strokes, holds for three
 * dead seconds, then erases itself away. The hold is dead air in a hero, so we
 * play the two useful segments back to back: write-on, a short beat, wipe-out —
 * and the wipe becomes the handoff into the name.
 *
 * The composition is 1920×1080 with the word occupying about a third of it, so
 * the SVG viewBox is cropped to the artwork's bounds, stroke width included.
 */

const FPS = 30;
const WRITE: [number, number] = [0, 58];
const ERASE: [number, number] = [148, 210];
const WRITE_SPEED = 1.55;
const ERASE_SPEED = 2.1;
const BEAT_MS = 300;
const ERASE_MS = ((ERASE[1] - ERASE[0]) / FPS / ERASE_SPEED) * 1000;

/** Artwork bounds inside the 1920×1080 composition, padded for the 30px stroke. */
export const HELLO_VIEWBOX = "502 305 927 471";

function beginWrite(anim: AnimationItem) {
  anim.setSpeed(WRITE_SPEED);
  anim.playSegments([WRITE], true);
}

type Props = {
  play: boolean;
  /** Fires partway through the wipe, so the name can start arriving. */
  onWipeStart?: () => void;
  onDone?: () => void;
  className?: string;
};

export function HelloLottie({ play, onWipeStart, onDone, className }: Props) {
  const animRef = useRef<AnimationItem | null>(null);
  const phaseRef = useRef<"idle" | "writing" | "erasing" | "done">("idle");
  const startedRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cb = useRef({ onWipeStart, onDone });
  useEffect(() => {
    cb.current = { onWipeStart, onDone };
  });

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  // Covers "animation was ready before `play` flipped". The other order is
  // handled in onReady.
  useEffect(() => {
    const anim = animRef.current;
    if (!play || !anim || startedRef.current) return;
    startedRef.current = true;
    phaseRef.current = "writing";
    beginWrite(anim);
  }, [play]);

  function handleComplete() {
    const anim = animRef.current;
    if (!anim) return;

    if (phaseRef.current === "writing") {
      phaseRef.current = "erasing";
      timers.current.push(
        setTimeout(() => {
          anim.setSpeed(ERASE_SPEED);
          anim.playSegments([ERASE], true);
          timers.current.push(
            setTimeout(() => cb.current.onWipeStart?.(), ERASE_MS * 0.5),
          );
        }, BEAT_MS),
      );
      return;
    }

    if (phaseRef.current === "erasing") {
      phaseRef.current = "done";
      cb.current.onDone?.();
    }
  }

  return (
    <Lottie
      src="/hello.lottie"
      loop={false}
      autoplay={false}
      viewBox={HELLO_VIEWBOX}
      className={className}
      label="Hello"
      onReady={(anim) => {
        animRef.current = anim;
        anim.addEventListener("complete", handleComplete);
        if (play && !startedRef.current) {
          startedRef.current = true;
          phaseRef.current = "writing";
          beginWrite(anim);
        }
      }}
    />
  );
}
