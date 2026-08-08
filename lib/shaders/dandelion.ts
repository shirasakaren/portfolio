/**
 * ✿ The dandelion transition
 *
 * A white sheet is picked up by a wind blowing toward the upper-right. It warms
 * from white to dandelion-gold at the tearing edge, breaks apart, and every
 * scrap that leaves becomes a seed that drifts off-screen — revealing the
 * homepage (already playing) underneath.
 *
 * The whole thing hangs off one shared function, `dissolveField(uv)`, which
 * says *when* a given point lets go. The veil erodes wherever
 * `progress > dissolveField(uv)`; a seed spawns at the exact moment its own
 * home point crosses that same threshold. Because both passes evaluate the
 * identical field, the seeds are literally made of the veil that vanished —
 * they detach from the tear instead of merely being sprinkled near it.
 *
 * Two shaders, one draw call each, zero CPU work per frame: the entire particle
 * simulation is a closed-form function of `age`, so 5000 seeds cost nothing but
 * fill rate.
 */

/** Shared GLSL: hashes, noise, wind, and the dissolve field itself. */
const COMMON = /* glsl */ `
const float TAU = 6.28318530718;

// Wind blows up and to the right; the sheet peels from the lower-left.
const vec2 WIND = vec2(0.88123, 0.47268);

uniform float uAspect;   // width / height
uniform float uEdge;     // half-width of the tearing band, in field units

vec2 toAspect(vec2 uv) { return vec2(uv.x * uAspect, uv.y); }

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 hash31(float n) {
  vec3 p = fract(vec3(n) * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yzx + 33.33);
  return fract((p.xxy + p.yzz) * p.zyx);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  mat2 R = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = R * p * 2.03;
    a *= 0.5;
  }
  return s;
}

// Normalised sweep along the wind: 0 at the upwind corner, 1 at the downwind one.
float windSweep(vec2 uv) {
  vec2 p = toAspect(uv);
  vec2 w = WIND;
  float lo = min(0.0, w.x * uAspect) + min(0.0, w.y);
  float hi = max(0.0, w.x * uAspect) + max(0.0, w.y);
  return (dot(p, w) - lo) / max(hi - lo, 1e-4);
}

/**
 * When this point lets go, in [0,1]. Pure sweep would give a straight ruler
 * edge; three octaves of zero-mean noise at descending scales turn it into
 * something torn — big lobes peeling first, medium flecks, then grain that
 * makes the boundary itself ragged rather than blurry.
 */
float dissolveField(vec2 uv) {
  vec2 p = toAspect(uv);
  float sweep = windSweep(uv);
  float big  = fbm(p * 1.85 + 11.3) - 0.5;
  float mid  = fbm(p * 5.30 -  4.7) - 0.5;
  float fine = vnoise(p * 19.0 +  2.1) - 0.5;
  float f = sweep * 0.72 + big * 0.30 + mid * 0.12 + fine * 0.05;
  return clamp((f + 0.238) / 1.196, 0.0, 1.0);
}

// smoothstep(0,1,x) and its exact inverse — lets a seed solve for the instant
// its home point tears, without the CPU ever touching a particle.
float ease01(float x)    { return x * x * (3.0 - 2.0 * x); }
float easeInv01(float y) { return 0.5 - sin(asin(clamp(1.0 - 2.0 * y, -1.0, 1.0)) / 3.0); }

// Progress remapped so the band is fully off-screen at both ends.
float frontier(float progress) { return mix(-uEdge, 1.0 + uEdge, ease01(clamp(progress, 0.0, 1.0))); }
`;

/* ── Pass 1: the veil ─────────────────────────────────────────────────── */

export const VEIL_VERT = `#version 300 es
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const VEIL_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform float uProgress;
uniform float uTime;

${COMMON}

const vec3 C_WHITE     = vec3(1.0, 1.0, 1.0);
const vec3 C_CREAM     = vec3(1.0, 0.972, 0.902);
const vec3 C_DANDELION = vec3(1.0, 0.855, 0.560);
const vec3 C_BLUSH     = vec3(1.0, 0.796, 0.886);
const vec3 C_GLOW      = vec3(1.0, 0.900, 0.680);

void main() {
  vec2 uv = vUv;
  float f  = dissolveField(uv);
  float pr = frontier(uProgress);

  // Signed distance to the tear, in edge-widths. <0 intact, >0 already gone.
  float d = (pr - f) / uEdge;

  // Opacity. Asymmetric: material thins slowly as the tear approaches, then
  // lets go fast — the way paper gives way rather than fading.
  float alpha = 1.0 - smoothstep(-1.0, 0.30, d);

  // Colour ramp running ahead of the tear: white -> cream -> dandelion, with a
  // blush kiss right on the lip where the light gets through the thinnest part.
  float warm  = smoothstep(-2.6, 0.10, d);
  float lip   = smoothstep(-1.2, 0.25, d);
  vec3 col = mix(C_WHITE, C_CREAM, warm);
  col = mix(col, C_DANDELION, pow(warm, 1.9) * 0.62);
  col = mix(col, C_BLUSH, lip * 0.30);

  // Subsurface grain: the thinning sheet is fibrous, not flat.
  float grain = fbm(toAspect(uv) * 26.0 + uTime * 0.07);
  col *= 1.0 + (grain - 0.5) * 0.10 * smoothstep(-3.0, 0.0, d);

  // Light leaking through the tear, spilling a little past the edge onto the
  // page below. Carried as unmultiplied RGB so it adds instead of covering.
  float leak = exp(-d * d * 1.15) * smoothstep(0.015, 0.10, uProgress)
             * (1.0 - smoothstep(0.88, 1.0, uProgress));
  vec3 glow = C_GLOW * leak * 0.20;

  fragColor = vec4(col * alpha + glow, alpha);
}
`;

/* ── Pass 2: the seeds ────────────────────────────────────────────────── */

export const SEED_VERT = `#version 300 es
layout(location = 0) in vec2 aCorner;  // quad corner in [-1,1]
layout(location = 1) in float aId;     // instance index

uniform float uTime;      // seconds since the transition began
uniform float uVeilDur;   // seconds the veil takes to fully tear
uniform vec2  uRes;       // drawing-buffer size, px
uniform float uScale;     // global size multiplier (bigger seeds on small screens)
uniform float uFade;      // global outro fade

out vec2  vLocal;
out float vAlpha;
out float vHash;
out float vBody;
out float vPxR;

${COMMON}

// R2 low-discrepancy sequence: covers the plane far more evenly than a hash,
// so seeds never clump into visible clusters.
const float PHI2 = 1.32471795724474602596;

void main() {
  vec2 a2 = vec2(1.0 / PHI2, 1.0 / (PHI2 * PHI2));
  vec2 home = fract(0.5 + a2 * aId);

  vec3 h1 = hash31(aId * 1.7 + 3.1);
  vec3 h2 = hash31(aId * 0.9 + 91.7);

  // Break the lattice just enough to look organic, not enough to clump.
  home = fract(home + (h1.xy - 0.5) * 0.02);

  // The instant this point's own patch of veil lets go.
  float f = dissolveField(home);
  float tSpawn = uVeilDur * easeInv01(clamp((f + uEdge) / (1.0 + 2.0 * uEdge), 0.0, 1.0));
  float age = uTime - tSpawn;

  float life = mix(0.95, 1.95, h1.z);
  float u = age / life;
  if (age < 0.0 || u > 1.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);  // clipped away
    vAlpha = 0.0;
    vLocal = vec2(0.0);
    vHash = 0.0;
    vBody = 0.0;
    vPxR = 1.0;
    return;
  }

  // Drift: velocity relaxes toward the wind speed, v(t) = V(1 - e^-kt).
  // Integrating gives a seed that hesitates, then commits — the hallmark of
  // something light being picked up rather than thrown.
  float k    = mix(1.30, 3.20, h2.x);
  float vmax = mix(0.60, 1.35, h2.y);
  float decay = exp(-k * age);
  float s = age - (1.0 - decay) / k;
  vec2 drift = WIND * vmax * s;

  // Flutter perpendicular to the wind, plus a slow curl so the whole field
  // breathes instead of marching in formation.
  vec2 perp = vec2(-WIND.y, WIND.x);
  float w  = mix(1.6, 3.6, h2.z);
  float ph = h1.x * TAU;
  float ramp = 1.0 - exp(-age * 1.4);
  float famp = mix(0.012, 0.050, h1.y);
  vec2 flutter = perp * sin(age * w + ph) * famp * ramp;

  float cn = fbm(home * 2.3 + vec2(uTime * 0.05, 1.7)) * TAU;
  vec2 curl = vec2(cos(cn), sin(cn)) * 0.038 * ramp;

  vec2 posA = toAspect(home) + drift + flutter + curl;

  // Orientation: pappus leads, stalk trails, with a pendulum swing.
  vec2 vel = WIND * vmax * (1.0 - decay) + perp * cos(age * w + ph) * famp * w * ramp;
  float ang = (dot(vel, vel) > 1e-8 ? atan(vel.y, vel.x) : atan(WIND.y, WIND.x)) - 1.5707963;
  ang += 0.34 * sin(age * mix(1.3, 2.9, h2.z) + ph);
  float ca = cos(ang), sa = sin(ang);
  mat2 R = mat2(ca, sa, -sa, ca);

  // Size, in screen-height units. Heavily skewed small: a handful of big
  // showpiece seeds reading as foreground, many motes reading as depth.
  float radius = mix(0.005, 0.034, pow(h2.x, 2.7)) * mix(0.8, 1.2, h1.z) * uScale;
  radius *= 1.0 + 0.34 * (1.0 - decay);

  float fadeIn  = smoothstep(0.0, 0.06, u);
  float fadeOut = 1.0 - smoothstep(0.40, 1.0, u);

  vAlpha = fadeIn * fadeOut * uFade * mix(0.30, 0.80, h1.y);
  vHash  = h2.z;
  vBody  = step(0.40, h1.x) * mix(0.7, 1.0, h2.y);   // ~60% keep a visible stalk
  vPxR   = radius * uRes.y;
  vLocal = aCorner;

  vec2 offset = R * (aCorner * radius);
  vec2 uvOut = vec2((posA.x + offset.x) / uAspect, posA.y + offset.y);
  gl_Position = vec4(uvOut * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const SEED_FRAG = `#version 300 es
precision highp float;

in vec2  vLocal;
in float vAlpha;
in float vHash;
in float vBody;
in float vPxR;

out vec4 fragColor;

const float TAU = 6.28318530718;

const vec3 C_FLUFF = vec3(1.000, 0.992, 0.976);
const vec3 C_GOLD  = vec3(1.000, 0.855, 0.520);
const vec3 C_SEED  = vec3(0.780, 0.470, 0.430);
const vec3 C_PINK  = vec3(1.000, 0.862, 0.925);

void main() {
  if (vAlpha <= 0.002) discard;

  vec2 p = vLocal;

  // One drawing-buffer pixel expressed in local units. Every feature width is
  // clamped to this, so a 9px seed dissolves into believable fluff instead of
  // shimmering — analytic AA in place of multisampling.
  float aa = 1.7 / max(vPxR, 2.0);

  /* ── pappus: the parachute ── */
  vec2 q = (p - vec2(0.0, 0.34)) / 0.62;
  float r = length(q);
  float ang = atan(q.y, q.x);

  float N = floor(mix(13.0, 21.0, vHash));
  float fr = abs(fract(ang * N / TAU) - 0.5);
  float arc = fr * TAU * r / N;                 // ≈ distance to nearest filament

  float wid = max(0.030 * (1.0 - 0.55 * r), aa * 0.9);
  float fil = smoothstep(wid, wid * 0.25, arc);
  fil *= smoothstep(0.05, 0.20, r) * (1.0 - smoothstep(0.70, 1.02, r));

  // Barbs — the tiny side-hairs that make a real pappus look feathered.
  float barb = smoothstep(wid * 3.2, wid * 1.1, arc)
             * (0.5 + 0.5 * sin(r * 46.0 + vHash * 37.0))
             * smoothstep(0.18, 0.55, r)
             * (1.0 - smoothstep(0.68, 1.0, r));
  fil = max(fil, barb * 0.45);

  float halo = exp(-r * r * 2.6);
  float pappus = clamp(fil * 0.85 + halo * 0.15, 0.0, 1.0);
  pappus *= 1.0 - smoothstep(0.94, 1.26, r);

  /* ── stalk + achene ── */
  float inStem = step(-0.86, p.y) * step(p.y, 0.34);
  float stemW = max(0.011, aa * 0.85);
  float stem = smoothstep(stemW, stemW * 0.2, abs(p.x)) * inStem;
  stem *= 0.45 + 0.55 * smoothstep(-0.86, 0.34, p.y);

  vec2 sp = (p - vec2(0.0, -0.80)) / vec2(0.078, 0.165);
  float achene = 1.0 - smoothstep(0.70, 1.0, length(sp));

  float body = max(stem * 0.72, achene) * vBody;

  float a = clamp(pappus + body, 0.0, 1.0) * vAlpha;
  if (a <= 0.003) discard;

  vec3 col = C_FLUFF;
  col = mix(col, C_SEED, clamp(body * 1.25, 0.0, 1.0) * (1.0 - pappus * 0.55));
  col = mix(col, C_PINK, smoothstep(0.50, 1.0, r) * 0.30 * (1.0 - body));
  col += C_GOLD * halo * 0.30;

  // Premultiplied, with a little unmultiplied gold on top so the fluff glows
  // rather than merely sitting there.
  fragColor = vec4(col * a + C_GOLD * halo * 0.05 * vAlpha, a);
}
`;
