# Sanvi — Project Guide

One reference file. Update sections independently as things change — don't rewrite the whole doc for one fact.

---

## 1. Project

| | |
|---|---|
| Name | Sanvi — Cinematic AI Production (Sanvi Frames) |
| Repo | `github.com/lifechanger5310-rgb/sanvi` |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Deploy target | Vercel |
| Design register | Cinematic restraint + bold WebGL motion (Lusion-inspired, film-grade palette) |

---

## 2. Stack (current, as of this build)

```json
"dependencies": {
  "next": "16.2.10",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "three": "^0.185.1",
  "@react-three/fiber": "^9.6.1",
  "@react-three/postprocessing": "latest",
  "postprocessing": "latest",
  "lenis": "^1.3.25",
  "framer-motion": "^12.42.2"
},
"devDependencies": {
  "tailwindcss": "^4",
  "typescript": "^5",
  "eslint": "^9",
  "eslint-config-next": "16.2.10"
}
```

**Role of each piece**
- `three` + `@react-three/fiber` — the WebGL render layer (fixed canvas behind DOM)
- `@react-three/postprocessing` — bloom / chromatic aberration / grain / vignette stack
- `lenis` — inertia scroll; also the single source of scroll progress (`sanvi:scroll` window event)
- `framer-motion` — DOM-layer reveals, magnetic hover, spring-based cursor
- `tailwindcss` v4 — utility styling, CSS vars for the palette live in `app/globals.css`

**Don't add without a reason:** GSAP (framer-motion + Lenis already cover this project's motion needs — adding GSAP means two competing animation engines), a second 3D library, Redux/Zustand (no app state complex enough yet).

---

## 3. Architecture (how the repo is laid out)

```
app/            → routes, layout, global CSS
components/     → DOM sections (Hero, Manifesto, Work, Engine, Footer, Cursor...)
components/scenes/ → R3F scene pieces (BlobScene, ParticleScene, ShardScene, TerrainScene, CameraRig)
lib/            → non-visual logic: GLSL snippets, scene/camera config, scroll context
docs/           → this file + any other reference docs
```

**Three-layer rule** (don't blur these):
1. **Motion layer** (Lenis) — owns scroll physics, dispatches progress
2. **Render layer** (R3F canvas, `z-0`, fixed) — reacts to scroll/pointer, never contains real content
3. **DOM layer** (`main`, `z-10`) — real, selectable, accessible text and links, always on top

---

## 4. GitHub — rules for this repo

- **Remote**: `https://github.com/lifechanger5310-rgb/sanvi.git`, branch `main`
- **Auth**: PAT stored in Claude memory (same account as the memory-sync repo) — never print it in chat, never commit it to a file
- **Push pattern**:
  ```bash
  git add -A
  git commit -m "short imperative summary

  - what changed
  - why (one line, if not obvious)"
  git push "https://<PAT>@github.com/lifechanger5310-rgb/sanvi.git" main
  ```
- **Before any push**: `npm run lint` and `npm run build` must both pass clean. Never push a build that doesn't compile.
- **Commit messages**: what changed + why, not "update files". Multi-line body for anything touching >2 files.
- No force-push to `main` unless explicitly asked.

---

## 5. Vercel — deployment details

- **Framework preset**: Next.js (auto-detected)
- **Build command**: `next build` (default — don't override unless a custom step is added)
- **Output**: default `.next` (App Router, no static export)
- **Env vars**: none required yet for this project (no Firebase/API keys in this repo). If any get added (analytics, form endpoint, etc.), set them at **Project → Settings → Environment Variables**, and add each to `.env.local` locally with a matching `.env.example` (no real values) committed to the repo.
- **Domains**: not yet configured — add under **Project → Settings → Domains** when ready.
- **Auto-deploy**: pushing to `main` triggers a production deploy; other branches get preview URLs automatically — this is default Vercel + GitHub integration behavior, no extra config needed once the repo is linked once in the Vercel dashboard.

⚠️ **PITFALL** → WebGL canvas + SSR → Next.js will try to server-render the `<Canvas>` on first load, which crashes (no `window`/`WebGLRenderingContext` on the server) → **Prevention**: always mount the R3F canvas through a client-only wrapper using `next/dynamic` with `{ ssr: false }` (see `ShaderBackgroundClient.tsx`) → **Recovery**: if you see a build-time or hydration error mentioning `Canvas`/`WebGL`/`document is not defined`, check that the dynamic import boundary wasn't accidentally removed.

---

## 6. React Compiler / lint rules specific to this codebase

This Next.js version's ESLint config includes strict **render-purity rules** (`react-hooks/purity`, `react-hooks/immutability`) that don't yet understand R3F's `useFrame` as a safe imperative escape hatch. Two concrete rules to follow when adding new scenes:

1. **Never call `Math.random()` (or any non-deterministic function) inside a component body or `useMemo`.** Generate randomized data once at **module scope**, outside the component, and reference the constant.
2. **Mutating refs/camera/material properties inside `useFrame` is correct and expected** — but if the linter flags it, scope a documented `eslint-disable` to that specific rule and file (see the top of `components/scenes/CameraRig.tsx` for the pattern), rather than disabling broadly or reaching for `// @ts-ignore`.

---

## 7. Design system reference — "mindblowing" modern site patterns

Not a checklist to cram into one site — a menu. Pick what serves the content; a site using all of these at once reads as noisy, not premium.

### Motion & scroll
- **Inertia/smooth scroll** (Lenis) — makes wheel/trackpad input feel like a camera move, not a jump
- **Scroll-driven camera dolly** — map scroll progress to a 3D camera's position/lookAt/fov instead of just fading sections
- **Scroll-triggered reveals** — fade/slide-up on `whileInView`, staggered per item
- **Parallax layers** — background moves slower than foreground; use sparingly, breaks on very long pages if overdone
- **Horizontal scroll sections** — for galleries/portfolios, scroll-jacked into sideways motion

### Cursor & interaction
- **Custom cursor** — replace the OS cursor with a shape that grows/inverts over interactive elements
- **Magnetic buttons/links** — element visually "pulled" toward the cursor within a radius (spring physics, not linear)
- **Hover distortion** — WebGL/CSS filter warps the region under the cursor
- **Cursor-following labels** — small tooltip/text that trails the cursor over specific elements (e.g. "View project")

### WebGL / 3D
- **Fixed background canvas** — full-viewport `<Canvas>` behind DOM content, `pointer-events` passed through where needed
- **Noise-displaced geometry** — blobs/terrain driven by simplex/fbm noise for organic, non-repeating motion
- **Particle systems** — GPU point clouds, reactive to pointer/scroll, additive blending for a glow look
- **Shader-based text** — MSDF text rendered inside WebGL for ripple/distortion effects (heavier to build; only worth it if type *is* the hero visual)
- **Post-processing stack** — bloom (glow on bright areas), chromatic aberration (lens-like RGB split), film grain, vignette — small values read as "graded footage," not gimmicky

### Typography & layout
- **Oversized display type** — hero headlines sized in `vw` units so they scale with viewport, not fixed `px`
- **Variable/serif + mono pairing** — one serif/display font for voice, one mono for HUD/labels/timestamps (this project: Fraunces + Space Mono + Inter)
- **Asymmetric grids** — avoid perfectly centered everything; offset content blocks
- **Generous whitespace / negative space** — premium sites under-fill the frame, not over-fill it

### Surface & texture
- **Grain/noise overlay** — subtle film grain over the whole page kills the "flat digital" look
- **Glassmorphism** — frosted-glass panels (`backdrop-blur` + low-opacity background) for cards over busy backgrounds — use sparingly, accessibility/contrast risk if overused
- **Gradient meshes** — soft multi-color gradients as backgrounds instead of flat fills

### Content-reveal mechanics
- **Split-text animations** — headline splits into chars/words, each animates in with a stagger
- **Marquee/ticker strips** — horizontal auto-scrolling text for credits, tags, or a client/brand list
- **Case-study "exploded" views** — layers of a system pulled apart in Z-space, draggable to rotate (used in this project's Engine section)
- **Number/stat counters** — count up on scroll-into-view for metrics sections

### Sound & feedback (optional, high-risk/high-reward)
- **Subtle UI sound on hover/click** — only ever opt-in (muted by default, toggle visible) — never autoplay audio
- **Haptic-style micro-interactions** — button press scales down 2–4%, springs back — cheap, disproportionately satisfying

---

## 8. Pitfall register (living list — add as new ones surface)

| Trigger | Prevention | Recovery |
|---|---|---|
| R3F `<Canvas>` server-rendered | `next/dynamic(..., { ssr: false })` wrapper, always | Check dynamic import boundary is intact |
| `Math.random()` in component/`useMemo` | Generate at module scope | Move generation above the component, reference as constant |
| Ref/camera mutation in `useFrame` flagged by lint | Scoped `eslint-disable` with a comment explaining why | Confirm mutation only happens inside `useFrame`, not render body |
| Heavy scene on low-power devices (MacBook Air 2017) | Keep particle counts modest (~3k), avoid `mipmapBlur` unless needed | Cut `Bloom`'s `mipmapBlur` first, then particle count, then post-processing passes entirely |
| Body has opaque `background` + canvas at negative `z-index` | Canvas should be `z-0`, content `z-10` — never negative z-index for a canvas meant to be visible | If background looks black/missing, check z-index stacking first |

---

*Keep this file in `docs/PROJECT_GUIDE.md`. Update the relevant section only — this doc is meant to stay short enough to actually re-read.*
