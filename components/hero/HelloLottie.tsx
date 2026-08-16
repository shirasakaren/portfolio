"use client";

import { useCallback, useEffect, useRef } from "react";
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

  /**
   * Every link in this chain — archive fetch, player import, the write-on, the
   * wipe — releases the hero text that sits beneath it. One stalled link must
   * never leave the name invisible, so each phase arms a watchdog and any
   * watchdog that fires skips straight to the released state.
   */
  const releasedRef = useRef(false);
  const readyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eraseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const release = useCallback(() => {
    if (releasedRef.current) return;
    releasedRef.current = true;
    phaseRef.current = "done";
    cb.current.onWipeStart?.();
    cb.current.onDone?.();
  }, []);

  const armWrite = useCallback(() => {
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(release, 7000);
  }, [release]);

  const startWrite = useCallback(() => {
    phaseRef.current = "writing";
    startedRef.current = true;
    const anim = animRef.current;
    if (anim) beginWrite(anim);
    armWrite();
  }, [armWrite]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      if (readyTimer.current) clearTimeout(readyTimer.current);
      if (writeTimer.current) clearTimeout(writeTimer.current);
      if (eraseTimer.current) clearTimeout(eraseTimer.current);
    },
    [],
  );

  // Covers "animation was ready before `play` flipped". The other order is
  // handled in onReady.
  useEffect(() => {
    if (!play || startedRef.current) return;
    if (animRef.current) {
      startWrite();
    } else {
      // The loader has this long to produce a player; otherwise the hero
      // proceeds without the write-on.
      readyTimer.current = setTimeout(release, 4500);
    }
  }, [play, startWrite, release]);

  function handleComplete() {
    const anim = animRef.current;
    if (!anim) return;

    if (phaseRef.current === "writing") {
      phaseRef.current = "erasing";
      if (writeTimer.current) clearTimeout(writeTimer.current);
      timers.current.push(
        setTimeout(() => {
          anim.setSpeed(ERASE_SPEED);
          anim.playSegments([ERASE], true);
          timers.current.push(
            setTimeout(() => cb.current.onWipeStart?.(), ERASE_MS * 0.5),
          );
          // The erase must complete too, or the tail below the name never
          // fades in.
          eraseTimer.current = setTimeout(release, ERASE_MS + 1500);
        }, BEAT_MS),
      );
      return;
    }

    if (phaseRef.current === "erasing") {
      phaseRef.current = "done";
      if (eraseTimer.current) clearTimeout(eraseTimer.current);
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
      onError={release}
      onReady={(anim) => {
        animRef.current = anim;
        anim.addEventListener("complete", handleComplete);
        if (readyTimer.current) clearTimeout(readyTimer.current);
        if (play && !startedRef.current) {
          startWrite();
        }
      }}
    />
  );
}
