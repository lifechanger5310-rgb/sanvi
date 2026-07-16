"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { noiseGLSL, paletteGLSL } from "@/lib/glslNoise";
import { sceneWeight } from "@/lib/sceneConfig";
import { useScrollRef } from "@/lib/ScrollContext";

const vertexShader = /* glsl */ `
  ${noiseGLSL}
  uniform float uTime;
  uniform float uPointerStrength;
  uniform vec2 uPointer;
  varying float vDisplacement;
  varying vec3 vNormal;
  varying vec3 vPos;

  void main() {
    vec3 p = position;
    float n = fbm3(p * 1.6 + uTime * 0.12);

    // Pointer pushes the surface outward like a hand pressing into fabric.
    float distToPointer = distance(normalize(p).xy, uPointer);
    float push = smoothstep(0.9, 0.0, distToPointer) * uPointerStrength;

    float displacement = n * 0.32 + push * 0.45;
    vDisplacement = displacement;
    vec3 displaced = p + normal * displacement;

    vNormal = normalize(normalMatrix * normal);
    vPos = displaced;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  ${paletteGLSL}
  varying float vDisplacement;
  varying vec3 vNormal;
  varying vec3 vPos;
  uniform float uOpacity;

  void main() {
    vec3 viewDir = normalize(-vPos);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.4);

    vec3 base = mix(ink * 1.4, cyan * 0.5, smoothstep(-0.2, 0.5, vDisplacement));
    vec3 col = base + amber * fresnel * 0.9 + cyan * fresnel * 0.3;
    col += amber * smoothstep(0.35, 0.6, vDisplacement) * 0.4;

    gl_FragColor = vec4(col, uOpacity);
  }
`;

export default function BlobScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const wireMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const scrollRef = useScrollRef();
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerStrength: { value: 0 },
      uOpacity: { value: 1 },
    }),
    []
  );

  useFrame((state, delta) => {
    const { progress } = scrollRef.current;
    const weight = sceneWeight("blob", progress);
    const group = meshRef.current;
    const wire = wireRef.current;
    if (!group || !wire) return;

    group.visible = weight > 0.001;
    wire.visible = weight > 0.001;

    const mat = matRef.current;
    if (mat) {
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      mat.uniforms.uPointer.value.set(state.pointer.x, state.pointer.y);
      mat.uniforms.uPointerStrength.value = THREE.MathUtils.lerp(
        mat.uniforms.uPointerStrength.value,
        0.6,
        0.05
      );
      mat.uniforms.uOpacity.value = weight;
    }
    if (wireMatRef.current) wireMatRef.current.opacity = weight * 0.18;

    group.rotation.y += delta * 0.09;
    group.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
    wire.rotation.copy(group.rotation);

    const scale = 1.05 + progress * 0.15;
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, scale, 0.05));
    wire.scale.copy(group.scale);
  });

  const scaleBase = Math.min(viewport.width, viewport.height) * 0.34;

  return (
    <group scale={scaleBase}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 64]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>
      <mesh ref={wireRef} scale={1.01}>
        <icosahedronGeometry args={[1, 10]} />
        <meshBasicMaterial
          ref={wireMatRef}
          color="#3fa9a0"
          wireframe
          transparent
          opacity={0.18}
        />
      </mesh>
    </group>
  );
}
