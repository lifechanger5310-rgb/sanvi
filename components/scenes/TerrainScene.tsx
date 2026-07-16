"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { noiseGLSL, paletteGLSL } from "@/lib/glslNoise";
import { sceneWeight } from "@/lib/sceneConfig";
import { useScrollRef } from "@/lib/ScrollContext";

const vertexShader = /* glsl */ `
  ${noiseGLSL}
  uniform float uTime;
  varying float vHeight;
  varying vec3 vPos;

  void main() {
    vec3 p = position;
    float h = fbm3(vec3(p.x * 0.35, p.y * 0.35, uTime * 0.05)) * 0.9;
    p.z += h;
    vHeight = h;
    vPos = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  ${paletteGLSL}
  varying float vHeight;
  varying vec3 vPos;
  uniform float uOpacity;

  void main() {
    vec3 col = mix(ink * 1.5, cyan * 0.6, smoothstep(-0.3, 0.5, vHeight));
    col = mix(col, amber * 0.7, smoothstep(0.4, 0.9, vHeight));
    float fade = smoothstep(6.0, 1.0, length(vPos.xy));
    gl_FragColor = vec4(col, uOpacity * fade);
  }
`;

export default function TerrainScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const scrollRef = useScrollRef();

  const geometry = useMemo(() => new THREE.PlaneGeometry(14, 14, 90, 90), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const { progress } = scrollRef.current;
    const weight = sceneWeight("terrain", progress);
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.visible = weight > 0.001;

    const mat = matRef.current;
    if (mat) {
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      mat.uniforms.uOpacity.value = weight;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2.3, 0, 0]} position={[0, -1.6, -1.5]}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        wireframe
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
