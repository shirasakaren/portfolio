"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Diagram } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/motion";

import { SealedPlate } from "./plates";

/**
 * An architecture diagram, and a way to actually read it.
 *
 * These are 4,000–6,400px wide Excalidraw exports with node labels at ~14px —
 * legible only at full size. So the inline view is a preview that opens a
 * full-screen viewer with drag-to-pan and wheel-to-zoom-at-the-cursor, which is
 * the interaction everyone already knows from every map they have ever used.
 *
 * The transform lives in a ref and is written straight to `style.transform`.
 * Routing a pan through React state would re-render the whole dossier on every
 * pointer move; this way the drag is one compositor property and nothing else.
 */

const MIN_SCALE = 1;
const MAX_SCALE = 6;

export function DiagramViewer({
  diagram,
  title,
}: {
  diagram: Diagram;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  if (diagram.sealed) {
    return (
      <div className="relative overflow-hidden rounded-[1.5rem]" style={{ aspectRatio: 16 / 9 }}>
        <SealedPlate reason={diagram.sealedReason} />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block w-full overflow-hidden rounded-[1.5rem] border border-sakura-200/70 bg-white"
        aria-label={`Open the ${title} architecture diagram full screen`}
      >
        <span
          className="blueprint-paper relative block"
          style={{ aspectRatio: diagram.aspect }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
          <img
            src={diagram.preview ?? diagram.raster}
            alt={diagram.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-ink-900/0 transition-colors duration-500 group-hover:bg-ink-900/5"
          />
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 font-display text-xs font-bold text-sakura-700 shadow-[0_6px_18px_-8px_rgba(214,51,108,0.6)] backdrop-blur-sm">
            <span aria-hidden>⤢</span> open full size
          </span>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <FullScreenDiagram
            diagram={diagram}
            title={title}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function FullScreenDiagram({
  diagram,
  title,
  onClose,
}: {
  diagram: Diagram;
  title: string;
  onClose: () => void;
}) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduced = usePrefersReducedMotion();

  /** The live transform. Never state — see the note at the top of the file. */
  const view = useRef({ scale: 1, x: 0, y: 0 });
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const [zoomLabel, setZoomLabel] = useState(100);

  const apply = useCallback(() => {
    const el = imageRef.current;
    if (!el) return;
    const { scale, x, y } = view.current;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);

  /** Clamp the pan so the diagram can never be dragged off the screen. */
  const clamp = useCallback(() => {
    const surface = surfaceRef.current;
    const el = imageRef.current;
    if (!surface || !el) return;
    const s = surface.getBoundingClientRect();
    const w = el.offsetWidth * view.current.scale;
    const h = el.offsetHeight * view.current.scale;
    const maxX = Math.max(0, (w - s.width) / 2);
    const maxY = Math.max(0, (h - s.height) / 2);
    view.current.x = Math.min(maxX, Math.max(-maxX, view.current.x));
    view.current.y = Math.min(maxY, Math.max(-maxY, view.current.y));
  }, []);

  const zoomTo = useCallback(
    (next: number, originX?: number, originY?: number) => {
      const surface = surfaceRef.current;
      if (!surface) return;
      const prev = view.current.scale;
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
      if (scale === prev) return;

      // Keep whatever is under the pointer under the pointer.
      if (originX !== undefined && originY !== undefined) {
        const r = surface.getBoundingClientRect();
        const cx = originX - (r.left + r.width / 2);
        const cy = originY - (r.top + r.height / 2);
        const k = scale / prev;
        view.current.x = cx - (cx - view.current.x) * k;
        view.current.y = cy - (cy - view.current.y) * k;
      }
      view.current.scale = scale;
      clamp();
      apply();
      setZoomLabel(Math.round(scale * 100));
    },
    [apply, clamp],
  );

  const reset = useCallback(() => {
    view.current = { scale: 1, x: 0, y: 0 };
    apply();
    setZoomLabel(100);
  }, [apply]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        zoomTo(view.current.scale * 1.4);
      } else if (e.key === "-") {
        zoomTo(view.current.scale / 1.4);
      } else if (e.key === "0") {
        reset();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, reset, zoomTo]);

  // Non-passive, because zooming must stop the page scrolling behind the modal.
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomTo(view.current.scale * (e.deltaY < 0 ? 1.16 : 1 / 1.16), e.clientX, e.clientY);
    };
    surface.addEventListener("wheel", onWheel, { passive: false });
    return () => surface.removeEventListener("wheel", onWheel);
  }, [zoomTo]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (view.current.scale <= 1) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    surfaceRef.current?.setAttribute("data-panning", "true");
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    view.current.x += e.clientX - d.x;
    view.current.y += e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    clamp();
    apply();
  };

  const endDrag = () => {
    drag.current = null;
    surfaceRef.current?.removeAttribute("data-panning");
  };

  return (
    <motion.div
      className="fixed inset-0 z-[150] flex flex-col bg-ink-900/92 backdrop-blur-md"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduced ? undefined : { opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — architecture diagram`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="font-display text-sm font-extrabold text-sakura-100">
          {title} <span className="font-normal text-white/50">· architecture</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => zoomTo(view.current.scale / 1.4)}
            aria-label="Zoom out"
            className="grid size-9 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            −
          </button>
          <p className="w-14 text-center font-mono text-xs text-white/70 tabular-nums">
            {zoomLabel}%
          </p>
          <button
            type="button"
            onClick={() => zoomTo(view.current.scale * 1.4)}
            aria-label="Zoom in"
            className="grid size-9 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            +
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-white/25 bg-white/10 px-3.5 py-2 font-display text-xs font-bold text-white transition-colors hover:bg-white/20"
          >
            reset
          </button>
          <a
            href={diagram.svg ?? diagram.raster}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/25 bg-white/10 px-3.5 py-2 font-display text-xs font-bold text-white transition-colors hover:bg-white/20"
          >
            open file ↗
          </a>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full bg-white px-4 py-2 font-display text-xs font-bold text-ink-900"
          >
            close
          </button>
        </div>
      </div>

      <div
        ref={surfaceRef}
        className="pan-surface relative flex-1 touch-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          ref={imageRef}
          className="absolute inset-0 origin-center will-change-transform"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
          <img
            src={diagram.svg ?? diagram.raster}
            alt={diagram.alt}
            draggable={false}
            className="h-full w-full object-contain p-4 select-none"
          />
        </div>
      </div>

      <p className="px-4 pb-3 text-center text-xs text-white/45 sm:px-6">
        scroll to zoom · drag to pan · <kbd>0</kbd> to reset · <kbd>Esc</kbd> to
        close
      </p>
    </motion.div>
  );
}
