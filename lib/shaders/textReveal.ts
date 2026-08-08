/**
 * ✿ Name reveal
 *
 * The same wind that carried the dandelions away brings the name in. Glyph
 * coverage is rasterised once to a texture; the shader then reads it through a
 * directional smear that shortens to nothing, so each letter arrives as a
 * streak of drifting dust that settles into type — and at progress = 1 the
 * smear length is exactly zero, meaning the last frame is pixel-identical to
 * the real DOM text it hands off to.
 *
 * The halo behind the letters is left to CSS `text-shadow` on the live element,
 * which keeps the handoff seamless and the text selectable the whole time.
 */

export const TEXT_VERT = `#version 300 es
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
  // uv.y = 0 at the top, matching the rasterised canvas.
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const TEXT_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTex;
uniform float uProgress;   // 0 -> 1
uniform float uAspect;     // texture width / height
uniform float uTime;

// Matches the CSS text-gradient ramp, so the handoff to DOM text is invisible.
const vec3 G0 = vec3(0.839, 0.200, 0.424);  // #D6336C
const vec3 G1 = vec3(1.000, 0.310, 0.639);  // #FF4FA3
const vec3 G2 = vec3(1.000, 0.412, 0.706);  // #FF69B4
const vec3 G3 = vec3(0.780, 0.490, 1.000);  // #C77DFF
const vec3 GOLD = vec3(1.000, 0.855, 0.520);

const int TAPS = 6;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

vec3 ramp(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c = mix(G0, G1, smoothstep(0.00, 0.34, t));
  c = mix(c, G2, smoothstep(0.34, 0.62, t));
  c = mix(c, G3, smoothstep(0.62, 1.00, t));
  return c;
}

void main() {
  vec2 uv = vUv;

  // Lanes sweep left-to-right, warped by noise so letters don't arrive in a
  // mechanical column — a tall glyph's crossbar can land before its stem.
  float lane = clamp(uv.x * 0.80 + vnoise(vec2(uv.x * uAspect, uv.y) * 2.6) * 0.20, 0.0, 1.0);

  const float WINDOW = 0.62;
  float local = clamp((uProgress * (1.0 + WINDOW) - lane) / WINDOW, 0.0, 1.0);
  float e = local * local * (3.0 - 2.0 * local);

  // Smear direction: up-and-right in screen terms, which is -y here.
  // Kept in step with SMEAR_UV in ShaderText.tsx, which sizes the padding that
  // gives the streak somewhere to live.
  vec2 dir = vec2(0.88 / uAspect, -0.47);
  float amt = 0.22 * pow(1.0 - local, 1.7);

  float cov = 0.0;
  float wsum = 0.0;
  for (int i = 0; i < TAPS; i++) {
    float t = float(i) / float(TAPS - 1);
    float w = 1.0 - 0.80 * t;                       // settled position dominates
    cov += texture(uTex, uv + dir * amt * t).a * w;
    wsum += w;
  }
  cov /= wsum;

  float alpha = cov * smoothstep(0.0, 0.30, e);
  if (alpha <= 0.002) discard;

  vec3 col = ramp(uv.x * 0.94 + (1.0 - uv.y) * 0.14);

  // Golden arrival flare, brightest just as a lane locks into place.
  float flare = exp(-pow((e - 0.46) / 0.30, 2.0));
  col = mix(col, GOLD, flare * 0.55);

  // Grain riding the smear: the letters condense out of dandelion dust.
  float grain = step(0.72, hash21(floor(vec2(uv.x * uAspect, uv.y) * 260.0 + uTime * 0.5)));
  float dust = grain * flare * (1.0 - local) * 0.6;

  fragColor = vec4(col * alpha + GOLD * dust * alpha * 0.9 + GOLD * flare * alpha * 0.18, alpha);
}
`;
