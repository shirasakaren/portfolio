"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  getPrefs,
  getServerPrefs,
  subscribePrefs,
  updatePrefs,
} from "@/lib/audioPrefs";
import { MEDIA_KEYS, provideMedia } from "@/lib/mediaRegistry";

const FADE_MS = 1400;

type AudioValue = {
  volume: number;
  muted: boolean;
  playing: boolean;
  /** Autoplay was refused; we're waiting on any interaction to start. */
  needsGesture: boolean;
  setVolume: (v: number) => void;
  toggleMuted: () => void;
  /** Begin playback, fading in. Safe to call more than once. */
  start: () => void;
};

const AudioCtx = createContext<AudioValue | null>(null);

export function useAudio(): AudioValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used inside <AudioProvider>");
  return ctx;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const elRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const prefs = useSyncExternalStore(
    subscribePrefs,
    getPrefs,
    getServerPrefs,
  );
  const { volume, muted } = prefs;

  const [playing, setPlaying] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);

  /** Ramp to the target instead of snapping — a hard cut is startling. */
  const fadeTo = useCallback((target: number, ms = FADE_MS) => {
    const el = elRef.current;
    if (!el) return;
    if (fadeRef.current !== null) cancelAnimationFrame(fadeRef.current);
    const from = el.volume;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = ms <= 0 ? 1 : Math.min(1, (now - t0) / ms);
      const eased = k * k * (3 - 2 * k);
      el.volume = Math.min(1, Math.max(0, from + (target - from) * eased));
      fadeRef.current = k < 1 ? requestAnimationFrame(step) : null;
    };
    fadeRef.current = requestAnimationFrame(step);
  }, []);

  // Later volume/mute changes ramp; the first application is `start`'s job.
  const target = muted ? 0 : volume;
  useEffect(() => {
    if (!startedRef.current) return;
    fadeTo(target, 240);
  }, [target, fadeTo]);

  useEffect(
    () => () => {
      if (fadeRef.current !== null) cancelAnimationFrame(fadeRef.current);
    },
    [],
  );

  const start = useCallback(() => {
    const el = elRef.current;
    if (!el || startedRef.current) return;

    el.volume = 0;
    const attempt = el.play();
    if (!attempt) return;

    const succeed = (ms: number) => {
      const current = getPrefs();
      startedRef.current = true;
      setPlaying(true);
      setNeedsGesture(false);
      fadeTo(current.muted ? 0 : current.volume, ms);
    };

    void attempt.then(() => succeed(FADE_MS)).catch(() => {
      // Autoplay policy. Wait for any interaction, then try once more.
      setNeedsGesture(true);
      const retry = () => {
        detach();
        void elRef.current
          ?.play()
          .then(() => succeed(700))
          .catch(() => {
            /* still blocked — the music button is the way in */
          });
      };
      const detach = () => {
        document.removeEventListener("pointerdown", retry);
        document.removeEventListener("keydown", retry);
        document.removeEventListener("touchstart", retry);
      };
      document.addEventListener("pointerdown", retry, { once: true });
      document.addEventListener("keydown", retry, { once: true });
      document.addEventListener("touchstart", retry, { once: true });
    });
  }, [fadeTo]);

  const setVolume = useCallback(
    (v: number) => {
      const next = Math.min(1, Math.max(0, v));
      // Nudging the slider up is an unmute in spirit.
      updatePrefs(next > 0 ? { volume: next, muted: false } : { volume: next });
      // Touching the slider is a gesture — a good moment to retry autoplay.
      if (!startedRef.current) start();
    },
    [start],
  );

  const toggleMuted = useCallback(() => {
    updatePrefs({ muted: !getPrefs().muted });
    if (!startedRef.current) start();
  }, [start]);

  const value = useMemo<AudioValue>(
    () => ({
      volume,
      muted,
      playing,
      needsGesture,
      setVolume,
      toggleMuted,
      start,
    }),
    [volume, muted, playing, needsGesture, setVolume, toggleMuted, start],
  );

  return (
    <AudioCtx.Provider value={value}>
      <SiteAudio elRef={elRef} />
      {children}
    </AudioCtx.Provider>
  );
}

/**
 * Ogg Vorbis is the source file; Safari has never shipped Vorbis decoding, so
 * an AAC twin sits beside it. Both are declared and the browser picks — no
 * capability sniffing, no client-only state.
 */
function SiteAudio({
  elRef,
}: {
  elRef: React.RefObject<HTMLAudioElement | null>;
}) {
  const localRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    elRef.current = localRef.current;
    // Let the boot sequence wait on this element buffering.
    provideMedia(MEDIA_KEYS.music, localRef.current);
  }, [elRef]);

  return (
    <audio ref={localRef} loop preload="auto" aria-hidden="true">
      <source src="/audio.ogg" type='audio/ogg; codecs="vorbis"' />
      <source src="/audio.m4a" type='audio/mp4; codecs="mp4a.40.2"' />
    </audio>
  );
}
