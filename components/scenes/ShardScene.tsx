"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { paletteGLSL } from "@/lib/glslNoise";
import { sceneWeight } from "@/lib/sceneConfig";
import { useScrollRef } from "@/lib/ScrollContext";

const fragmentShader = /* glsl */ `
  ${paletteGLSL}
  varying vec3 vNormal;
  varying vec3 vPos;
  uniform float uOpacity;
  uniform vec3 uTint;

  void main() {
    vec3 viewDir = normalize(-vPos);
    float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 2.0);
    vec3 col = ink * 1.6 + uTint * fresnel * 1.1 + amber * fresnel * 0.25;
    gl_FragColor = vec4(col, uOpacity * (0.35 + fresnel * 0.7));
  }
`;

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

type Shard = {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  speed: number;
  geo: "octa" | "tetra";
  tint: THREE.Color;
};

function buildShards(): Shard[] {
  const amber = new THREE.Color("#e8a968");
  const cyan = new THREE.Color("#3fa9a0");
  return Array.from({ length: 12 }, (_, i) => ({
    pos: [
      (Math.random() - 0.5) * 3.4,
      (Math.random() - 0.5) * 2.2,
      (Math.random() - 0.5) * 2.4,
    ],
    rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    scale: 0.18 + Math.random() * 0.3,
    speed: 0.5 + Math.random() * 1.2,
    geo: i % 2 === 0 ? "octa" : "tetra",
    tint: i % 3 === 0 ? amber : cyan,
  }));
}

const SHARDS = buildShards();

function useShardMaterial(tint: THREE.Color) {
  return useMemo(
    () => ({
      uOpacity: { value: 0 },
      uTint: { value: tint },
    }),
    [tint]
  );
}

function ShardMesh({ shard, weightRef }: { shard: Shard; weightRef: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useShardMaterial(shard.tint);

  useFrame((state) => {
    const mesh = ref.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;
    const w = weightRef.current;
    mesh.visible = w > 0.001;
    mat.uniforms.uOpacity.value = w;
    mesh.rotation.x += 0.0018 * shard.speed;
    mesh.rotation.y += 0.0026 * shard.speed;
    mesh.position.y = shard.pos[1] + Math.sin(state.clock.elapsedTime * shard.speed + shard.pos[0]) * 0.12;
  });

  return (
    <mesh
      ref={ref}
      position={shard.pos}
      rotation={shard.rot}
      scale={shard.scale}
    >
      {shard.geo === "octa" ? <octahedronGeometry args={[1, 0]} /> : <tetrahedronGeometry args={[1, 0]} />}
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function ShardScene() {
  const scrollRef = useScrollRef();
  const weightRef = useRef(0);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const { viewport } = useThree();

  const shards = SHARDS;

  useFrame((state) => {
    const { progress } = scrollRef.current;
    weightRef.current = sceneWeight("shards", progress);
    const ring = ringRef.current;
    if (ring) {
      ring.visible = weightRef.current > 0.001;
      ring.rotation.x = state.clock.elapsedTime * 0.12;
      ring.rotation.z = progress * 2.4;
    }
    if (ringMatRef.current) ringMatRef.current.opacity = weightRef.current * 0.5;
  });

  const scale = Math.min(viewport.width, viewport.height) * 0.5;

  return (
    <group scale={scale * 0.55}>
      {shards.map((s, i) => (
        <ShardMesh key={i} shard={s} weightRef={weightRef} />
      ))}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.012, 16, 100]} />
        <meshBasicMaterial ref={ringMatRef} color="#e8a968" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.9, 0.006, 16, 100]} />
        <meshBasicMaterial color="#3fa9a0" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
