"use client";

import { useEffect, useRef, useState } from "react";

import {
  createProgram,
  fullscreenTriangle,
  getGL,
  resizeToDisplay,
  uniformMap,
} from "@/lib/gl";
import {
  SEED_FRAG,
  SEED_VERT,
  VEIL_FRAG,
  VEIL_VERT,
} from "@/lib/shaders/dandelion";

/** Seconds for the white sheet to tear completely away. */
const VEIL_DUR = 1.9;
/** Seconds until the last seed has left and the canvas can be torn down. */
const TOTAL_DUR = 3.2;
/** Veil progress at which the homepage takes over — seeds still drift on top. */
const REVEAL_AT = 0.86;
/** Half-width of the tearing band, in dissolve-field units. */
const EDGE = 0.05;

const SEEDS_DESKTOP = 1300;
const SEEDS_SMALL = 700;

export type DandelionTransitionProps = {
  /** First frame is on screen and fully opaque — safe to drop the boot shield. */
  onCurtainReady: () => void;
  /** The page is essentially uncovered; start the hero sequence. */
  onReveal: () => void;
  /** Every seed is gone. */
  onComplete: () => void;
  reduced: boolean;
};

export function DandelionTransition({
  onCurtainReady,
  onReveal,
  onComplete,
  reduced,
}: DandelionTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const [useFallback, setUseFallback] = useState(reduced);

  // Callbacks live in a ref: the GL loop is set up exactly once and must never
  // be rebuilt because a parent re-rendered. Declared before the effects that
  // read it so it is always refreshed first.
  const cb = useRef({ onCurtainReady, onReveal, onComplete });
  useEffect(() => {
    cb.current = { onCurtainReady, onReveal, onComplete };
  });

  /* ── Plain crossfade: reduced motion, or no WebGL2 ──────────────────── */
  useEffect(() => {
    if (!useFallback) return;
    const el = fallbackRef.current;
    if (!el) return;

    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(setTimeout(() => alive && fn(), ms));
    };

    // Next frame, so the browser has painted the white block before the shield
    // beneath it is removed.
    const raf = requestAnimationFrame(() => {
      if (!alive) return;
      cb.current.onCurtainReady();
      requestAnimationFrame(() => {
        if (alive) el.style.opacity = "0";
      });
    });

    at(340, () => cb.current.onReveal());
    at(900, () => cb.current.onComplete());

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [useFallback]);

  /* ── The real thing ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Deferred so the state update lands outside the effect body — a direct
    // call here would cascade a render mid-setup.
    const bailToFallback = () => queueMicrotask(() => setUseFallback(true));

    const gl = getGL(canvas);
    if (!gl) {
      bailToFallback();
      return;
    }

    const programs = (() => {
      try {
        return {
          veil: createProgram(gl, VEIL_VERT, VEIL_FRAG),
          seed: createProgram(gl, SEED_VERT, SEED_FRAG),
        };
      } catch (err) {
        console.warn("[dandelion] shader compile failed, falling back", err);
        return null;
      }
    })();

    if (!programs) {
      bailToFallback();
      return;
    }
    const { veil: veilProg, seed: seedProg } = programs;

    const isSmall = Math.min(window.innerWidth, window.innerHeight) < 620;
    const seedCount = isSmall ? SEEDS_SMALL : SEEDS_DESKTOP;

    const triVao = fullscreenTriangle(gl);

    // One quad, `seedCount` instances. Nothing else is ever uploaded — the
    // entire simulation is closed-form inside the vertex shader.
    const seedVao = gl.createVertexArray()!;
    gl.bindVertexArray(seedVao);

    const cornerBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const ids = new Float32Array(seedCount);
    for (let i = 0; i < seedCount; i++) ids[i] = i + 1;
    const idBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, idBuf);
    gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);

    gl.bindVertexArray(null);

    const uVeil = uniformMap(gl, veilProg);
    const uSeed = uniformMap(gl, seedProg);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    // Premultiplied alpha: lets the seeds carry glow (rgb above their own
    // alpha) without blowing out into the page behind them.
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let aspect = 1;
    const syncSize = () => {
      resizeToDisplay(gl, canvas, 2);
      aspect = canvas.width / Math.max(1, canvas.height);
    };
    syncSize();

    const onResize = () => syncSize();
    window.addEventListener("resize", onResize, { passive: true });

    let raf = 0;
    let startTime = 0;
    let curtainAnnounced = false;
    let revealAnnounced = false;
    let finished = false;

    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      if (!curtainAnnounced) cb.current.onCurtainReady();
      if (!revealAnnounced) cb.current.onReveal();
      if (!finished) {
        finished = true;
        cb.current.onComplete();
      }
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    const scaleFor = () =>
      Math.min(
        1.55,
        Math.max(1, 760 / Math.max(1, Math.min(window.innerWidth, window.innerHeight))),
      );

    const frame = (now: number) => {
      if (finished) return;
      if (!startTime) startTime = now;
      const t = (now - startTime) / 1000;
      const progress = Math.min(1, t / VEIL_DUR);

      gl.clear(gl.COLOR_BUFFER_BIT);

      // Veil
      gl.useProgram(veilProg);
      gl.uniform1f(uVeil("uProgress"), progress);
      gl.uniform1f(uVeil("uTime"), t);
      gl.uniform1f(uVeil("uAspect"), aspect);
      gl.uniform1f(uVeil("uEdge"), EDGE);
      gl.bindVertexArray(triVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // Seeds — skipped on frame zero so the first painted frame is a clean,
      // fully opaque white sheet, indistinguishable from the shield it replaces.
      if (t > 0) {
        const fade = 1 - smoothstep(TOTAL_DUR - 0.55, TOTAL_DUR, t);
        gl.useProgram(seedProg);
        gl.uniform1f(uSeed("uTime"), t);
        gl.uniform1f(uSeed("uVeilDur"), VEIL_DUR);
        gl.uniform1f(uSeed("uAspect"), aspect);
        gl.uniform1f(uSeed("uEdge"), EDGE);
        gl.uniform2f(uSeed("uRes"), canvas.width, canvas.height);
        gl.uniform1f(uSeed("uScale"), scaleFor());
        gl.uniform1f(uSeed("uFade"), fade);
        gl.bindVertexArray(seedVao);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, seedCount);
      }

      gl.bindVertexArray(null);

      if (!curtainAnnounced) {
        curtainAnnounced = true;
        cb.current.onCurtainReady();
      }
      if (!revealAnnounced && progress >= REVEAL_AT) {
        revealAnnounced = true;
        cb.current.onReveal();
      }
      if (t >= TOTAL_DUR) {
        finished = true;
        // Blank the layer while it is still in the tree, so the compositor has
        // the page beneath fully rasterised before the element goes away.
        canvas.style.opacity = "0";
        cb.current.onComplete();
        return;
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      finished = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.deleteVertexArray(triVao);
      gl.deleteVertexArray(seedVao);
      gl.deleteBuffer(cornerBuf);
      gl.deleteBuffer(idBuf);
      gl.deleteProgram(veilProg);
      gl.deleteProgram(seedProg);
      // Only safe once the canvas is genuinely gone: React re-runs effects on
      // the *same* element in StrictMode, and getContext() would then hand back
      // the context we just destroyed.
      if (!canvas.isConnected) {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    };
  }, [reduced]);

  if (useFallback) {
    return (
      <div
        ref={fallbackRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[130] bg-white transition-opacity duration-[560ms] ease-out"
        style={{ opacity: 1 }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[130] h-full w-full"
    />
  );
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export const DANDELION_TIMING = {
  VEIL_DUR,
  TOTAL_DUR,
  REVEAL_AT,
} as const;
