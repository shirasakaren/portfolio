/**
 * Minimal WebGL2 helpers.
 *
 * Everything visual on this site is hand-written GLSL, so the goal here is a
 * tiny, dependency-free layer: compile, link, size a canvas to the display,
 * and get out of the way.
 */

export type GL = WebGL2RenderingContext;

export function getGL(canvas: HTMLCanvasElement): GL | null {
  try {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
      desynchronized: false,
    }) as GL | null;

    // `getContext` hands back the *existing* context for a canvas. If a previous
    // mount lost it, every compile from here would fail with an empty info log,
    // so treat it as no context at all and let the caller fall back.
    if (gl?.isContextLost()) return null;
    return gl;
  } catch {
    return null;
  }
}

function compile(gl: GL, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log =
      gl.getShaderInfoLog(sh) ||
      (gl.isContextLost() ? "context lost" : "no info log");
    gl.deleteShader(sh);
    throw new Error(
      `[gl] ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader: ${log}`,
    );
  }
  return sh;
}

export function createProgram(gl: GL, vert: string, frag: string): WebGLProgram {
  const vs = compile(gl, gl.VERTEX_SHADER, vert);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  // Shaders are refcounted by the program; drop our references immediately.
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog) ?? "unknown link error";
    gl.deleteProgram(prog);
    throw new Error(`[gl] link: ${log}`);
  }
  return prog;
}

/** Cached uniform locations — `gl.getUniformLocation` is surprisingly costly in a hot loop. */
export function uniformMap(gl: GL, prog: WebGLProgram) {
  const cache = new Map<string, WebGLUniformLocation | null>();
  return (name: string) => {
    let loc = cache.get(name);
    if (loc === undefined) {
      loc = gl.getUniformLocation(prog, name);
      cache.set(name, loc);
    }
    return loc;
  };
}

/**
 * Resize the drawing buffer to match the element's box, capped so a 3× DPR
 * phone doesn't try to shade nine million fragments per frame.
 */
export function resizeToDisplay(
  gl: GL,
  canvas: HTMLCanvasElement,
  maxDpr = 2,
): boolean {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
  if (canvas.width === w && canvas.height === h) return false;
  canvas.width = w;
  canvas.height = h;
  gl.viewport(0, 0, w, h);
  return true;
}

/** A single oversized triangle covering clip space — cheaper than two triangles. */
export function fullscreenTriangle(gl: GL): WebGLVertexArrayObject {
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  return vao;
}
