"use client";

import { useEffect, useRef, useState } from "react";

import { createProgram, fullscreenTriangle, getGL, uniformMap } from "@/lib/gl";
import { TEXT_FRAG, TEXT_VERT } from "@/lib/shaders/textReveal";

/**
 * Text that materialises out of drifting dandelion dust.
 *
 * The live DOM text is never replaced — it stays in the tree, selectable and
 * readable by assistive tech, with only its *fill* hidden while the shader
 * draws. At progress = 1 the shader output is the same pixels the browser
 * would paint, so the handoff is a single-frame swap with nothing to crossfade.
 *
 * Three layers, back to front:
 *   1. halo   — the same glyphs with no fill, carrying the text-shadow
 *   2. text   — the real, selectable element (fill hidden during the reveal)
 *   3. canvas — the shader, removed once it has handed over
 */

/** Must match `amt`'s peak in TEXT_FRAG — this sizes the room the streak needs. */
const SMEAR_UV = 0.22;

/**
 * Transparent padding around the text box, as a fraction of its height.
 *
 * The streak trails down-and-left of each glyph by `SMEAR_UV * 0.88 * H`, where
 * H is the *padded* height — so the padding feeds back into its own
 * requirement. Solving `k ≥ 0.88·s·(1 + 2k)` for the ratio k, plus a third of
 * headroom for the flare.
 */
const PAD_RATIO = Math.min(
  0.75,
  ((0.88 * SMEAR_UV) / (1 - 1.76 * SMEAR_UV)) * 1.35,
);

type Props = {
  text: string;
  /** Typography and fill for the live text. Must NOT include a halo. */
  className?: string;
  /** Halo (text-shadow) classes, applied to the layer behind. */
  haloClassName?: string;
  /** Start the reveal. */
  active: boolean;
  durationMs?: number;
  delayMs?: number;
  onDone?: () => void;
  lang?: string;
  /** Skip the shader entirely (reduced motion) and just fade in. */
  reduced?: boolean;
};

export function ShaderText({
  text,
  className,
  haloClassName,
  active,
  durationMs = 1500,
  delayMs = 0,
  onDone,
  lang,
  reduced = false,
}: Props) {
  const haloRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [retired, setRetired] = useState(false);

  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  // Hide the fill (and the halo) until something un-hides them — either the
  // shader finishing or the plain-fade fallback.
  useEffect(() => {
    const el = textRef.current;
    if (el && !el.classList.contains("shader-masked")) {
      el.classList.add("shader-masked");
      el.style.opacity = "0";
    }
    if (haloRef.current) haloRef.current.style.opacity = "0";
  }, []);

  useEffect(() => {
    if (!active) return;

    const textEl = textRef.current;
    if (!textEl) return;

    let alive = true;
    let raf = 0;
    let cleanupGl: (() => void) | undefined;

    const finish = () => {
      if (!alive) return;
      if (canvasRef.current) canvasRef.current.style.opacity = "0";
      if (haloRef.current) haloRef.current.style.opacity = "1";
      textEl.classList.remove("shader-masked");
      textEl.style.opacity = "1";
      onDoneRef.current?.();
      setTimeout(() => {
        if (!alive) return;
        cleanupGl?.();
        cleanupGl = undefined;
        setRetired(true);
      }, 300);
    };

    const plainFade = () => {
      textEl.classList.remove("shader-masked");
      for (const el of [textEl, haloRef.current]) {
        if (!el) continue;
        el.style.transition = "opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.opacity = "1";
      }
      setTimeout(() => onDoneRef.current?.(), 700);
    };

    const startTimer = setTimeout(() => {
      if (!alive) return;
      if (reduced) {
        plainFade();
        return;
      }
      void (async () => {
        try {
          if (document.fonts?.ready) await document.fonts.ready;
          if (!alive) return;
          cleanupGl = runShader();
        } catch (err) {
          console.warn("[shader-text] falling back to a plain fade", err);
          cleanupGl = undefined;
        }
        if (alive && !cleanupGl) plainFade();
      })();
    }, delayMs);

    /** Rasterise the text, upload it, and animate. Returns a teardown fn. */
    function runShader(): (() => void) | undefined {
      if (!textEl) return undefined;

      const rect = textEl.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) return undefined;

      const pad = Math.round(rect.height * PAD_RATIO);
      const cssW = Math.ceil(rect.width) + pad * 2;
      const cssH = Math.ceil(rect.height) + pad * 2;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const texW = Math.round(cssW * dpr);
      const texH = Math.round(cssH * dpr);

      // ── rasterise the glyphs (white; the shader supplies the colour)
      const raster = document.createElement("canvas");
      raster.width = texW;
      raster.height = texH;
      const ctx = raster.getContext("2d");
      if (!ctx) return undefined;

      const cs = getComputedStyle(textEl);
      ctx.scale(dpr, dpr);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} / ${cs.lineHeight} ${cs.fontFamily}`;
      if ("letterSpacing" in ctx) {
        (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
      }
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      // Baseline within the line box, using the CSS half-leading rule.
      const m = ctx.measureText(text);
      const asc = m.fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.8;
      const desc = m.fontBoundingBoxDescent || parseFloat(cs.fontSize) * 0.2;
      const lineH = parseFloat(cs.lineHeight) || asc + desc;
      const baseline = pad + (lineH - (asc + desc)) / 2 + asc;
      ctx.fillText(text, pad, baseline);

      // ── GL
      const canvas = canvasRef.current;
      if (!canvas) return undefined;
      canvas.style.left = `${-pad}px`;
      canvas.style.top = `${-pad}px`;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = texW;
      canvas.height = texH;

      const gl = getGL(canvas);
      if (!gl) return undefined;

      let prog: WebGLProgram;
      try {
        prog = createProgram(gl, TEXT_VERT, TEXT_FRAG);
      } catch (err) {
        console.warn("[shader-text] compile failed", err);
        return undefined;
      }

      const vao = fullscreenTriangle(gl);
      const u = uniformMap(gl, prog);

      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, raster);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      // Transparent padding all round, so clamping reads as "nothing here".
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.viewport(0, 0, texW, texH);
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);

      canvas.style.opacity = "1";

      const aspect = texW / Math.max(1, texH);
      const t0 = performance.now();
      let done = false;

      const frame = (now: number) => {
        if (!alive || done) return;
        const p = Math.min(1, (now - t0) / durationMs);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(prog);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(u("uTex"), 0);
        gl.uniform1f(u("uProgress"), p);
        gl.uniform1f(u("uAspect"), aspect);
        gl.uniform1f(u("uTime"), (now - t0) / 1000);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindVertexArray(null);

        // The halo swells in ahead of the letters, like light arriving first.
        if (haloRef.current) {
          haloRef.current.style.opacity = String(Math.min(1, p * 1.9));
        }

        if (p >= 1) {
          done = true;
          finish();
          return;
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      return () => {
        cancelAnimationFrame(raf);
        gl.deleteTexture(tex);
        gl.deleteVertexArray(vao);
        gl.deleteProgram(prog);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    }

    return () => {
      alive = false;
      clearTimeout(startTimer);
      cancelAnimationFrame(raf);
      cleanupGl?.();
    };
  }, [active, delayMs, durationMs, reduced, text]);

  return (
    <span className="relative inline-block align-baseline">
      <span
        ref={haloRef}
        aria-hidden="true"
        className={`halo-layer ${className ?? ""} ${haloClassName ?? ""}`}
      >
        {text}
      </span>
      <span ref={textRef} className={`relative ${className ?? ""}`} lang={lang}>
        {text}
      </span>
      {!retired && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute opacity-0"
        />
      )}
    </span>
  );
}
