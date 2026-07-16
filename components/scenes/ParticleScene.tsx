"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { noiseGLSL, paletteGLSL } from "@/lib/glslNoise";
import { sceneWeight } from "@/lib/sceneConfig";
import { useScrollRef } from "@/lib/ScrollContext";

const COUNT = 3200;

// Generated once at module init, not during render — the new React
// Compiler purity lint forbids calling Math.random() inside a component
// or hook body, since a memoized render must be able to re-run safely.
function buildParticleField() {
  const positions = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const r = 1.6 + Math.random() * 1.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    positions[i * 3 + 2] = r * Math.cos(phi) * 0.6;
    seeds[i] = Math.random();
  }
  return { positions, seeds };
}

const PARTICLE_FIELD = buildParticleField();

const vertexShader = /* glsl */ `
  ${noiseGLSL}
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vSeed;
  varying float vDist;

  void main() {
    vec3 p = position;
    float t = uTime * 0.06 + aSeed * 6.28;
    p += vec3(
      fbm3(p * 0.6 + t),
      fbm3(p * 0.6 + t + 12.0),
      fbm3(p * 0.6 + t + 24.0)
    ) * 0.55;

    float distToPointer = distance(p.xy, uPointer * 2.2);
    float repel = smoothstep(1.1, 0.0, distToPointer);
    vec2 dir = normalize(p.xy - uPointer * 2.2 + 0.0001);
    p.xy += dir * repel * 0.9;

    vSeed = aSeed;
    vDist = repel;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (2.0 + aSeed * 2.6 + repel * 3.0) * uPixelRatio * (60.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  ${paletteGLSL}
  varying float vSeed;
  varying float vDist;
  uniform float uOpacity;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d);

    vec3 col = mix(cyan, amber, step(0.5, vSeed));
    col += vDist * amber * 0.6;

    gl_FragColor = vec4(col, alpha * uOpacity * (0.55 + vDist * 0.4));
  }
`;

export default function ParticleScene() {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const scrollRef = useScrollRef();
  const { viewport, size } = useThree();

  const { positions, seeds } = PARTICLE_FIELD;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const { progress } = scrollRef.current;
    const weight = sceneWeight("particles", progress);
    const points = pointsRef.current;
    if (!points) return;
    points.visible = weight > 0.001;

    const mat = matRef.current;
    if (mat) {
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      mat.uniforms.uPointer.value.set(
        state.pointer.x * (viewport.width / viewport.height),
        state.pointer.y
      );
      mat.uniforms.uPixelRatio.value = size.width > 0 ? window.devicePixelRatio : 1;
      mat.uniforms.uOpacity.value = weight;
    }

    points.rotation.y = progress * 1.4;
    points.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.15;
  });

  return (
    <points ref={pointsRef} scale={Math.min(viewport.width, viewport.height) * 0.42}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
