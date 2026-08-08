# ren.shirasaka.work

Personal portfolio for **Shirasaka Ren** — DevOps · Security · Cloud · Servers.

Static Next.js site (`output: "export"`) hosted on Cloudflare Pages. The only
server-side code is a single Cloudflare Pages Function for the contact form.

```bash
npm run dev      # http://localhost:3000
npm run build    # -> ./out
npm run lint
```

## The entrance

Everything about the first four seconds is deliberate, so it's worth knowing how
the pieces fit before changing any of them.

1. **Boot shield.** An inline script in `app/layout.tsx` sets `data-booting` on
   `<html>` while the HTML is still parsing — before the first paint. With JS
   off it never runs and the shield stays invisible. A 16-second dead-man's
   timeout removes it if the boot sequence ever fails.
2. **Loading.** `loading.lottie` loops on white while `lib/preload.ts` waits for
   fonts, the hello animation, the hero video, and the music to buffer. Every
   step is fail-soft, with a hard 12-second ceiling.
3. **Dandelion transition** (`components/boot/DandelionTransition.tsx`). Two GLSL
   passes. The white sheet tears along `dissolveField(uv)` — a wind sweep warped
   by three octaves of noise — and every seed spawns at the exact moment its own
   home point crosses that same threshold, so the seeds are literally made of
   the veil that vanished. The whole particle simulation is closed-form in the
   vertex shader; there is no per-frame CPU work and nothing is ever re-uploaded.
4. **Hero.** The video is already playing underneath. `hello.lottie` writes
   itself on, wipes away, and the name materialises out of the same wind
   (`components/hero/ShaderText.tsx`). Music fades in at 50%.

Reduced motion, a missing WebGL2 context, and a failed shader compile all fall
back to a plain crossfade. Nothing about the sequence is required to reach the
content.

### Two things that will bite you

- **Backticks inside the GLSL template literals** terminate the string. Shader
  comments use plain prose for that reason.
- **`background-clip: text` paints the gradient in the _background_ layer**,
  underneath the element's own `text-shadow`. Gradient text with a halo
  therefore needs the halo on a separate layer behind it — see `.halo-layer`
  in `app/globals.css`. Putting `hero-halo` and `text-gradient` on the same
  element washes the fill out to near-white.

## Assets

`.lottie` files are zip archives and are shipped as-authored; the browser
unzips them with fflate (`lib/dotlottie.ts`). That's a real win — `404.lottie`
is 50 KB on the wire versus 334 KB of raw JSON. Drop in a replacement and the
site picks it up with no build step.

Audio ships twice: `audio.ogg` (source) and `audio.m4a`, because Safari has
never shipped Ogg Vorbis. Both are declared on the `<audio>` element and the
browser chooses.

The hero video ladder and its encode recipe are documented in
`public/hero-video/README.md`.

Japanese type is Zen Maru Gothic, subset to only the glyphs this site uses —
11 KB per weight instead of several megabytes. If you add Japanese copy with
new characters, re-subset:

```bash
curl -H 'User-Agent: Mozilla/5.0 ... Chrome/120' \
  "https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700&text=<url-encoded glyphs>"
# then download the woff2 URLs into app/fonts/
```

Glyphs outside the subset fall through to the system Japanese stack declared
on `--font-jp`, so nothing breaks in the meantime.

## Deploying to Cloudflare Pages

| Setting        | Value           |
| -------------- | --------------- |
| Build command  | `npm run build` |
| Output dir     | `out`           |
| Functions dir  | `functions`     |

`public/_headers` sets long-lived immutable caching for the video, audio and
`_next/static`, plus the usual security headers.

### Contact form

`functions/api/contact.ts` sends through Cloudflare Email Routing, so there's no
third-party mail provider and no API key. One-time setup:

1. Enable Email Routing on the zone and verify the destination address.
2. Pages → Settings → Functions → **Email bindings**: bind it as `SEND_EMAIL`.
3. Set vars `CONTACT_TO` (the verified destination) and `CONTACT_FROM` (any
   address on the zone, e.g. `noreply@shirasaka.work`).

Until that's configured the endpoint returns 503 with a message pointing at the
direct email address, rather than pretending to have sent anything.

## Content

All copy lives in `lib/content.ts`, mirroring the profile README. The entries in
`projects` are capability areas rather than named client work — replace them
with real case studies when there's something public to point at.
