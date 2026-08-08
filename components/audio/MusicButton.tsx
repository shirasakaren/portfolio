"use client";

import { useEffect, useRef, useState } from "react";

import { useAudio } from "@/components/audio/AudioProvider";

/**
 * Music control.
 *
 * Collapsed it's just a note. Hover (or keyboard focus) slides a volume slider
 * out of it; clicking mutes and unmutes. Touch has no hover, so a tap both
 * toggles and reveals the slider for a few seconds — otherwise phone users
 * would have no way to reach the volume at all.
 */
export function MusicButton() {
  const { volume, muted, needsGesture, setVolume, toggleMuted } = useAudio();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const holdOpen = (ms: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
    closeTimer.current = setTimeout(() => setOpen(false), ms);
  };

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const pct = Math.round(volume * 100);

  return (
    <div
      className="relative flex items-center rounded-full border border-sakura-200/80 bg-white/75 p-1 shadow-[0_6px_20px_-10px_rgba(214,51,108,0.5)] backdrop-blur-md transition-colors duration-300 hover:bg-white/90"
      onMouseEnter={() => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setOpen(true);
      }}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      {/* Shown only when the browser refused audible autoplay, so the silence
          reads as "waiting for you" instead of "broken". */}
      {needsGesture && !open && (
        <span
          aria-hidden
          className="animate-pulse-soft pointer-events-none absolute top-full right-0 mt-2.5 rounded-full border border-sakura-200/80 bg-white/85 px-3 py-1.5 font-display text-xs font-bold whitespace-nowrap text-sakura-700 shadow-[0_6px_18px_-8px_rgba(214,51,108,0.5)] backdrop-blur-md"
        >
          tap anywhere for music ♪
        </span>
      )}

      <div
        className="overflow-hidden transition-[width,opacity] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ width: open ? "6.5rem" : 0, opacity: open ? 1 : 0 }}
      >
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={pct}
          aria-label="Music volume"
          tabIndex={open ? 0 : -1}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          style={{ "--fill": `${pct}%` } as React.CSSProperties}
          className="volume-range ml-3 w-[5.5rem]"
        />
      </div>

      <button
        type="button"
        onClick={() => {
          toggleMuted();
          holdOpen(3200);
        }}
        aria-label={muted ? "Unmute music" : "Mute music"}
        aria-pressed={muted}
        className="relative grid size-9 place-items-center rounded-full text-sakura-700 transition-colors duration-200 hover:bg-sakura-100 hover:text-sakura-800"
      >
        {muted ? <MutedNote /> : <Note />}
        {needsGesture && (
          <span
            aria-hidden
            className="animate-pulse-soft absolute -top-0.5 -right-0.5 size-2 rounded-full bg-sakura-500 ring-2 ring-white"
          />
        )}
        <span className="sr-only">
          {muted ? "Music is muted" : `Music volume ${pct} percent`}
        </span>
      </button>
    </div>
  );
}

function Note() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[1.15rem]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </svg>
  );
}

function MutedNote() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[1.15rem]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18V5l11-2v13" opacity={0.45} />
      <circle cx="6" cy="18" r="3" opacity={0.45} />
      <circle cx="17" cy="16" r="3" opacity={0.45} />
      <path d="M3 3l18 18" />
    </svg>
  );
}
