/**
 * The page background: a slow, domain-warped petal field.
 *
 * This runs behind every page except the hero, so it is built to be nearly
 * free — half resolution, capped frame rate, and a fragment shader with a
 * fixed instruction count (no dynamic branching, no texture reads). Four
 * octaves of value noise, warped once by another two, then coloured straight
 * out of the site's own palette so the canvas and the CSS never disagree.
 *
 * The bokeh highlights are analytic: six exponential falloffs whose centres
 * are computed from a hash and drift on the same wind as the dandelions, so
 * there is no particle buffer and nothing to update per frame on the CPU.
 *
 * Note for future edits: no backticks anywhere inside these template literals.
 */

export const FIELD_VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FIELD_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 frag;

uniform vec2  uRes;
uniform float uTime;
/** 0 at the top of the document, 1 at the bottom. Parallaxes the field. */
uniform float uScroll;
/** Master opacity, so the whole layer can fade in without a CSS repaint. */
uniform float uFade;
/** Palette, handed in from the CSS tokens. */
uniform vec3  uCream;
uniform vec3  uPetal;
uniform vec3  uDeep;
uniform vec3  uLilac;
uniform vec3  uDandelion;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  // Quintic — smoother second derivative than smoothstep, which matters when
  // the result is stretched across a whole viewport.
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  // Irrational rotation between octaves kills the axis-aligned grid artefacts
  // that plain scaling leaves behind.
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    sum += amp * vnoise(p);
    p = rot * p * 2.03;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y);

  // Everything drifts on the same diagonal as the dandelion transition.
  vec2 wind = vec2(0.88123, 0.47268);
  float t = uTime * 0.035;
  vec2 drift = wind * t + vec2(0.0, uScroll * 0.55);

  // Two-stage domain warp: cheap, and it is what turns bland noise into
  // something that reads as drifting fabric.
  vec2 q = vec2(fbm(p * 1.55 + drift), fbm(p * 1.55 + drift + 3.7));
  vec2 r = vec2(
    fbm(p * 2.1 + q * 1.15 + drift * 1.4 + 1.3),
    fbm(p * 2.1 + q * 1.15 + drift * 1.4 + 9.2)
  );
  float f = fbm(p * 1.9 + r * 1.35 + drift);

  // Palette ramp. The deep pink only ever appears at the very top of the
  // range, so the page stays light enough to read black text on.
  vec3 col = mix(uCream, uPetal, smoothstep(0.28, 0.62, f));
  col = mix(col, uLilac, smoothstep(0.52, 0.86, r.x) * 0.55);
  col = mix(col, uDandelion, smoothstep(0.62, 0.95, q.y) * 0.32);
  col = mix(col, uDeep, smoothstep(0.74, 1.0, f) * 0.22);

  // Six drifting bokeh petals, entirely analytic.
  float glow = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec2 seed = vec2(hash21(vec2(fi, 11.0)), hash21(vec2(fi, 27.0)));
    float speed = 0.018 + seed.y * 0.03;
    vec2 c = vec2(
      fract(seed.x + wind.x * uTime * speed) * aspect,
      fract(seed.y + wind.y * uTime * speed * 0.6 + uScroll * 0.3)
    );
    float rad = mix(0.16, 0.42, seed.x);
    float d = length((p - c) / vec2(1.0, 1.15)) / rad;
    glow += exp(-d * d * 2.2) * mix(0.10, 0.24, seed.y);
  }
  col += glow * mix(uPetal, uCream, 0.35);

  // Keep the middle of the screen calm — that is where the words go.
  vec2 vc = uv - 0.5;
  float centre = 1.0 - smoothstep(0.15, 0.78, length(vc * vec2(aspect * 0.62, 1.0)));
  col = mix(col, uCream, centre * 0.42);

  // A whisper of grain. Without it these gradients band badly on 8-bit panels.
  float grain = hash21(gl_FragCoord.xy + fract(uTime) * 137.0) - 0.5;
  col += grain * 0.014;

  frag = vec4(clamp(col, 0.0, 1.0) * uFade, uFade);
}
`;
