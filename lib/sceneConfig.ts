import * as THREE from "three";

// The page has 5 DOM sections but 4 visual "scenes" — Manifesto and the
// tail end of Hero share the particle-swarm scene so the transition into
// 01 — THESIS reads as one continuous camera move, not a hard cut.
//
// [start, end] is the scroll-progress range (0..1) where a scene is fully
// "in". Scenes cross-fade across a 0.08 progress band at each boundary.
export const SCENES = {
  blob: [0, 0.27],
  particles: [0.2, 0.52],
  shards: [0.45, 0.78],
  terrain: [0.7, 1],
} as const;

export type SceneName = keyof typeof SCENES;

/** Returns 0..1 visibility weight for a scene at a given scroll progress. */
export function sceneWeight(name: SceneName, progress: number) {
  const [start, end] = SCENES[name];
  const fade = 0.08;
  if (progress <= start - fade || progress >= end + fade) return 0;
  if (progress >= start && progress <= end) return 1;
  if (progress < start) return THREE.MathUtils.smoothstep(progress, start - fade, start);
  return 1 - THREE.MathUtils.smoothstep(progress, end, end + fade);
}

// Camera dolly keyframes: [progress, position, lookAt]. The camera lerps
// through these as one continuous "shot" pushing deeper into the scene —
// this is the scroll -> camera-matrix mapping, not a page moving up.
export const CAMERA_KEYFRAMES: Array<{
  t: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
}> = [
  { t: 0.0, pos: [0, 0, 6.2], look: [0, 0, 0], fov: 45 },
  { t: 0.27, pos: [0.6, 0.1, 4.6], look: [0, 0, 0], fov: 42 },
  { t: 0.5, pos: [-0.8, 0.3, 4.2], look: [0, 0, 0], fov: 44 },
  { t: 0.78, pos: [1.2, 0.6, 3.8], look: [0, 0.2, 0], fov: 40 },
  { t: 1.0, pos: [0, 2.4, 5.5], look: [0, 0, -2], fov: 50 },
];

function lerp3(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [
    THREE.MathUtils.lerp(a[0], b[0], t),
    THREE.MathUtils.lerp(a[1], b[1], t),
    THREE.MathUtils.lerp(a[2], b[2], t),
  ];
}

export function cameraAt(progress: number) {
  const kfs = CAMERA_KEYFRAMES;
  let i = 0;
  while (i < kfs.length - 2 && progress > kfs[i + 1].t) i++;
  const a = kfs[i];
  const b = kfs[i + 1];
  const span = b.t - a.t || 1;
  const localT = THREE.MathUtils.clamp((progress - a.t) / span, 0, 1);
  const eased = localT * localT * (3 - 2 * localT);
  return {
    pos: lerp3(a.pos, b.pos, eased),
    look: lerp3(a.look, b.look, eased),
    fov: THREE.MathUtils.lerp(a.fov, b.fov, eased),
  };
}
