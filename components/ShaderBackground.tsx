"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Original fragment shader: layered flow-noise field, warped by pointer
// proximity and scroll depth, split into amber/cyan channels to read like
// a lens scope monitor rather than a flat gradient.
const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uScroll;

  vec3 amber = vec3(0.910, 0.663, 0.408);
  vec3 cyan  = vec3(0.247, 0.663, 0.627);
  vec3 ink   = vec3(0.039, 0.047, 0.063);

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p);
      p *= 2.02;
      amp *= 0.52;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspectUv = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

    float distToPointer = length(aspectUv - uPointer);
    float pointerField = smoothstep(0.9, 0.0, distToPointer);

    vec2 flow = aspectUv * 1.6 + vec2(0.0, uTime * 0.035 + uScroll * 0.6);
    flow += pointerField * 0.35 * normalize(aspectUv - uPointer + 0.0001);

    float n1 = fbm(flow);
    float n2 = fbm(flow * 1.8 + 4.2);

    float bands = smoothstep(0.35, 0.85, n1);
    vec3 col = mix(ink, ink + cyan * 0.14, bands);

    float aberration = pointerField * 0.02;
    float rChannel = fbm(flow + vec2(aberration, 0.0));
    float bChannel = fbm(flow - vec2(aberration, 0.0));
    col += amber * smoothstep(0.5, 0.95, rChannel) * 0.22;
    col += cyan * smoothstep(0.55, 0.98, bChannel) * 0.16;

    col += pointerField * amber * 0.10;

    float vign = smoothstep(1.15, 0.25, length(aspectUv));
    col *= mix(0.55, 1.0, vign);

    float grain = (hash(uv * uResolution.xy + uTime * 60.0) - 0.5) * 0.035;
    col += grain;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function ShaderPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, pointer } = useThree();
  const scrollRef = useRef(0);

  useEffect(() => {
    function onScroll(e: Event) {
      const detail = (e as CustomEvent).detail;
      scrollRef.current = detail?.progress ?? 0;
    }
    window.addEventListener("sanvi:scroll", onScroll);
    return () => window.removeEventListener("sanvi:scroll", onScroll);
  }, []);

  useFrame((state) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uPointer.value.set(
      pointer.x * (viewport.width / viewport.height),
      pointer.y
    );
    mat.uniforms.uScroll.value = scrollRef.current;
    mat.uniforms.uResolution.value.set(state.size.width, state.size.height);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uScroll: { value: 0 },
        }}
      />
    </mesh>
  );
}

export default function ShaderBackground() {
  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  );
}
