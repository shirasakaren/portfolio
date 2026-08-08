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
/** How long WebKit gets to veto an ungestured unmute by pausing us. */
const UNMUTE_VETO_MS = 1500;

type AudioValue = {
  volume: number;
  muted: boolean;
  playing: boolean;
  /** The browser refused audible playback; we're waiting on any interaction. */
  needsGesture: boolean;
  setVolume: (v: number) => void;
  toggleMuted: () => void;
  /** Make the music audible. Safe to call more than once. */
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
  const gestureRef = useRef(false);

  const prefs = useSyncExternalStore(subscribePrefs, getPrefs, getServerPrefs);
  const { volume, muted } = prefs;

  const [playing, setPlaying] = useState(false);
  const [needsGesture, setNeedsGestureState] = useState(false);

  const setNeedsGesture = useCallback((v: boolean) => {
    gestureRef.current = v;
    setNeedsGestureState(v);
  }, []);

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

  /**
   * Autoplay, honestly.
   *
   * No browser will start *audible* media without a gesture, but every browser
   * allows muted playback — so the track has been rolling silently since mount
   * and this only has to unmute it, which is a far lower bar and clears in
   * Chrome, Edge and Firefox. WebKit answers an ungestured unmute by pausing
   * us, which we detect and turn into a one-shot "any interaction" retry.
   */
  const start = useCallback(() => {
    const el = elRef.current;
    if (!el || startedRef.current) return;
    startedRef.current = true;

    let detach = () => {};

    function goAudible() {
      const audio = elRef.current;
      if (!audio) return;
      const saved = getPrefs();
      audio.muted = false;
      audio.volume = 0;

      const settle = () => {
        setPlaying(true);
        setNeedsGesture(false);
        fadeTo(saved.muted ? 0 : saved.volume);

        // WebKit pauses rather than refusing outright. Watch briefly.
        const onPause = () => {
          window.clearTimeout(guard);
          armGesture();
        };
        audio.addEventListener("pause", onPause, { once: true });
        const guard = window.setTimeout(() => {
          audio.removeEventListener("pause", onPause);
        }, UNMUTE_VETO_MS);
      };

      const attempt = audio.play();
      if (attempt) void attempt.then(settle).catch(armGesture);
      else settle();
    }

    function armGesture() {
      const audio = elRef.current;
      setPlaying(false);
      setNeedsGesture(true);
      // Keep the silent stream alive so a tap only has to unmute it.
      if (audio) {
        audio.muted = true;
        void audio.play().catch(() => {});
      }
      const retry = () => {
        detach();
        goAudible();
      };
      detach = () => {
        document.removeEventListener("pointerdown", retry);
        document.removeEventListener("keydown", retry);
        document.removeEventListener("touchstart", retry);
      };
      document.addEventListener("pointerdown", retry, { once: true });
      document.addEventListener("keydown", retry, { once: true });
      document.addEventListener("touchstart", retry, { once: true });
    }

    // The silent pre-roll has been running for a few seconds; start the track
    // over so the music begins with the reveal.
    try {
      if (el.currentTime > 0.05) el.currentTime = 0;
    } catch {
      /* not seekable yet — it will just continue from here */
    }
    goAudible();
  }, [fadeTo, setNeedsGesture]);

  const setVolume = useCallback(
    (v: number) => {
      const next = Math.min(1, Math.max(0, v));
      // Nudging the slider up is an unmute in spirit.
      updatePrefs(next > 0 ? { volume: next, muted: false } : { volume: next });
    },
    [],
  );

  const toggleMuted = useCallback(() => {
    // While autoplay is blocked the button's job is to start the music, not to
    // mute it — the document-level gesture listener is already doing that, so
    // toggling here would silence the track the same click just unlocked.
    if (gestureRef.current) return;
    updatePrefs({ muted: !getPrefs().muted });
  }, []);

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
    const el = localRef.current;
    elRef.current = el;
    // Let the boot sequence wait on this element buffering.
    provideMedia(MEDIA_KEYS.music, el);
    if (!el) return;

    // Silent pre-roll: universally permitted, and it means `start()` only has
    // to unmute rather than ask for audible playback from a standing stop.
    el.muted = true;
    el.volume = 0;
    void el.play().catch(() => {
      /* even muted autoplay can be refused; start() falls back to a gesture */
    });
  }, [elRef]);

  return (
    <audio ref={localRef} loop preload="auto" aria-hidden="true">
      <source src="/audio.ogg" type='audio/ogg; codecs="vorbis"' />
      <source src="/audio.m4a" type='audio/mp4; codecs="mp4a.40.2"' />
    </audio>
  );
}
