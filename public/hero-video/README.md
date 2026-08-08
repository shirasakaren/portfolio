# Hero background video — compressed & mirrored

Source: `~/Downloads/videoplayback.mp4` — AV1, 3840×2158, 60 fps, 13.9 s, no audio, **15.64 MB**.
All outputs are **horizontally flipped**, faststart-enabled, BT.709-tagged, silent.

## What you got

| File | Resolution | Size | Bitrate | vs source |
|---|---|---:|---:|---:|
| `hero-2160p.av1.mp4` | 3840×2160 | **2.79 MB** | 1.68 Mbps | 5.6× |
| `hero-1440p.av1.mp4` | 2560×1440 | **1.48 MB** | 0.89 Mbps | 10.6× |
| `hero-1080p.av1.mp4` | 1920×1080 | **0.98 MB** | 0.59 Mbps | 15.9× |
| `hero-720p.av1.mp4`  | 1280×720  | **0.58 MB** | 0.35 Mbps | 26.8× |
| `hero-1080p.h264.mp4` | 1920×1080 | 2.85 MB | 1.71 Mbps | fallback |
| `hero-720p.h264.mp4`  | 1280×720  | 1.65 MB | 1.00 Mbps | fallback |
| `hero-poster.avif` / `.webp` / `.jpg` | 1920×1080 | 66 / 102 / 152 KB | — | first frame |

**A typical desktop visitor downloads ~1.0 MB** (1080p AV1 + AVIF poster) instead of the
original 15.64 MB. Phones get ~0.65 MB. Only genuine 4K/5K displays pull the 2.79 MB top tier.

`index.html` is a working demo — open it in a browser to see it running.

## Drop-in markup

```html
<div class="hero">
  <video class="hero__video" autoplay muted loop playsinline
         preload="metadata" disablepictureinpicture aria-hidden="true" tabindex="-1">
    <source src="hero-2160p.av1.mp4"  type='video/mp4; codecs="av01.0.12M.10.0.110.01.01.01.0"' media="(min-width: 2000px)">
    <source src="hero-1440p.av1.mp4"  type='video/mp4; codecs="av01.0.12M.10.0.110.01.01.01.0"' media="(min-width: 1280px)">
    <source src="hero-1080p.av1.mp4"  type='video/mp4; codecs="av01.0.08M.10.0.110.01.01.01.0"' media="(min-width: 760px)">
    <source src="hero-720p.av1.mp4"   type='video/mp4; codecs="av01.0.05M.10.0.110.01.01.01.0"'>
    <source src="hero-1080p.h264.mp4" type='video/mp4; codecs="avc1.64002a"' media="(min-width: 760px)">
    <source src="hero-720p.h264.mp4"  type='video/mp4; codecs="avc1.64002a"'>
  </video>
  <div class="hero__scrim"></div>
  <div class="hero__content">…</div>
</div>
```

Rules that matter:

- **Keep the `codecs=` strings.** They are how a browser without AV1 skips to the H.264
  source. With a bare `type="video/mp4"` it would claim it can play AV1 and then show nothing.
- **AV1 sources must come before H.264.** The browser takes the first source whose `media`
  matches *and* whose codec it supports.
- `media` on `<source>` is evaluated **once, at load time** — it does not re-evaluate on
  resize. That is fine for a hero; the demo page just needs a reload to switch tiers.
- `muted` + `playsinline` are both required for autoplay on iOS.
- The poster is applied as a CSS `image-set()` background on the wrapper rather than the
  `poster` attribute, because `poster` takes a single URL and can't negotiate AVIF/WebP/JPEG.

## Encode recipe

```
hflip → hqdn3d=0:0:12:12 → fps=30 → scale (lanczos) → unsharp → SVT-AV1 preset 3, 10-bit
```

Why each step:

- **`hqdn3d=0:0:12:12`** — purely *temporal* denoise (spatial terms are 0). The clip is
  near-static (peak scene-change score 0.009), so averaging across time strips the source's
  YouTube compression mottling without touching line-art sharpness. Worth ~14% on its own,
  and the flat pastel areas come out visibly *cleaner than the original*. The animated
  sparkle particles survive because hqdn3d's temporal term is threshold-based.
- **60 → 30 fps** — worth ~31%. The motion is a slow camera drift; 30 fps is indistinguishable
  here and halves decode cost on mobile.
- **10-bit AV1** — costs ~2% in size and largely removes banding risk in the pastel gradients.
  Decoded fine by every browser that supports AV1 at all.
- **`unsharp=3:3:0.5`** on downscaled tiers only — measurably crisper line art for **zero**
  extra bytes. Not applied to 2160p, which isn't downscaled.
- **CRF 52–56** — quality is remarkably flat on this content: VMAF moved only 3.9 points
  (89.9 → 85.9) while size fell 3×, because the ceiling is set by the denoise, not the encoder.
  At 1:1, CRF 46 / 50 / 54 were indistinguishable at 1080p.
- **`keyint=600`** — one keyframe for the whole clip. Nobody seeks a background video.

Rebuild script: `build.sh` — reproduces this exact ladder and the posters from the original source in one pass.

## Two things to know

1. **The loop is not perfectly seamless.** The source has a slow zoom that doesn't fully
   reset — first vs. last frame is 31 dB PSNR — so `loop` produces a small "pop" back to the
   wider framing every 14 s. It's subtle and largely hidden behind the scrim, but it is there.
   Fixable by cross-fading the tail into the head (costs ~0.7 s of runtime); say the word.
2. **`preload="metadata"` + `autoplay` still fetches the video.** If the hero is your LCP
   element, defer it: drop `autoplay`, and call `video.play()` on `window.load`. The poster
   paints immediately either way.
