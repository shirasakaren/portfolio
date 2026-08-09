"use client";

import { useEffect, useRef, useState } from "react";

import {
  createProgram,
  fullscreenTriangle,
  getGL,
  uniformMap,
} from "@/lib/gl";
import { FIELD_FRAG, FIELD_VERT } from "@/lib/shaders/petalField";
import { usePrefersReducedMotion } from "@/lib/motion";

/**
 * The living background for every page that isn't the hero.
 *
 * Three concessions keep it effectively free:
 *
 *   • it renders at 55% of CSS pixels and is stretched back up — the output is
 *     a soft gradient, so nobody can tell, and it is a third of the fragments;
 *   • it runs at ~30fps, because the field moves slowly enough that 60 buys
 *     nothing but heat;
 *   • it stops completely when the tab is hidden.
 *
 * With `prefers-reduced-motion` it draws exactly one frame and then releases
 * the loop, so the texture is still there but nothing moves. Without WebGL it
 * leaves the CSS gradient underneath alone.
 */

/** Rendered pixels per CSS pixel. */
const SCALE = 0.55;
const TARGET_FPS = 30;
const FRAME_MS = 1000 / TARGET_FPS;
const FADE_MS = 900;

/** #rrggbb to a 0–1 triple. */
function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const PALETTE = {
  cream: rgb("#fffdf9"),
  petal: rgb("#ffe4ef"),
  deep: rgb("#ff9ecb"),
  lilac: rgb("#ecd9ff"),
  dandelion: rgb("#fff4d6"),
};

export function PetalField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = getGL(canvas);
    if (!gl) {
      queueMicrotask(() => setFailed(true));
      return;
    }

    let prog: WebGLProgram;
    try {
      prog = createProgram(gl, FIELD_VERT, FIELD_FRAG);
    } catch (err) {
      console.warn("[petal-field] falling back to the CSS gradient", err);
      queueMicrotask(() => setFailed(true));
      return;
    }

    const vao = fullscreenTriangle(gl);
    const u = uniformMap(gl, prog);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.useProgram(prog);
    gl.uniform3fv(u("uCream"), PALETTE.cream);
    gl.uniform3fv(u("uPetal"), PALETTE.petal);
    gl.uniform3fv(u("uDeep"), PALETTE.deep);
    gl.uniform3fv(u("uLilac"), PALETTE.lilac);
    gl.uniform3fv(u("uDandelion"), PALETTE.dandelion);

    let raf = 0;
    let alive = true;
    let last = 0;
    let scroll = 0;
    const t0 = performance.now();

    const size = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * SCALE));
      const h = Math.max(1, Math.round(canvas.clientHeight * SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      return [w, h] as const;
    };

    const draw = (now: number) => {
      const [w, h] = size();
      gl.useProgram(prog);
      gl.uniform2f(u("uRes"), w, h);
      gl.uniform1f(u("uTime"), reduced ? 6.5 : (now - t0) / 1000);
      gl.uniform1f(u("uScroll"), scroll);
      gl.uniform1f(
        u("uFade"),
        reduced ? 1 : Math.min(1, (now - t0) / FADE_MS),
      );
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    };

    const frame = (now: number) => {
      if (!alive) return;
      if (document.hidden) {
        raf = requestAnimationFrame(frame);
        return;
      }
      if (now - last >= FRAME_MS) {
        last = now;
        draw(now);
      }
      raf = requestAnimationFrame(frame);
    };

    const onScroll = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      scroll = Math.min(1, Math.max(0, window.scrollY / max));
    };
    const onResize = () => {
      onScroll();
      if (reduced) draw(performance.now());
    };

    onScroll();

    if (reduced) {
      // One frame, then nothing. The texture stays; the wind stops.
      draw(performance.now());
      window.addEventListener("resize", onResize);
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      raf = requestAnimationFrame(frame);
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(prog);
      // Only drop the context if the canvas is really gone — releasing it while
      // still mounted breaks the very next mount under StrictMode.
      if (!canvas.isConnected) {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    };
  }, [reduced]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-linear-to-b from-sakura-50 via-cream to-sakura-100/70 ${className}`}
    >
      {!failed && (
        <canvas ref={canvasRef} className="block h-full w-full opacity-95" />
      )}
      {/* A dusting of static grain over the top, so the canvas edge never
          reads as a seam against the header's blur. */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-sakura-100/40" />
    </div>
  );
}
