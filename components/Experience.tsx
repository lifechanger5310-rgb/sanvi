"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Suspense } from "react";
import * as THREE from "three";
import { ScrollProvider } from "@/lib/ScrollContext";
import CameraRig from "./scenes/CameraRig";
import BlobScene from "./scenes/BlobScene";
import ParticleScene from "./scenes/ParticleScene";
import ShardScene from "./scenes/ShardScene";
import TerrainScene from "./scenes/TerrainScene";

export default function Experience() {
  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <ScrollProvider>
        <Canvas
          camera={{ position: [0, 0, 6.2], fov: 45, near: 0.1, far: 50 }}
          dpr={[1, 1.75]}
          gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
          onCreated={({ gl }) => gl.setClearColor(new THREE.Color("#0a0c10"), 1)}
        >
          <Suspense fallback={null}>
            <CameraRig />
            <BlobScene />
            <ParticleScene />
            <ShardScene />
            <TerrainScene />
            <EffectComposer multisampling={0}>
              <Bloom
                intensity={0.55}
                luminanceThreshold={0.15}
                luminanceSmoothing={0.4}
                mipmapBlur
              />
              <ChromaticAberration
                offset={new THREE.Vector2(0.0012, 0.0012)}
                blendFunction={BlendFunction.NORMAL}
              />
              <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.06} />
              <Vignette eskil={false} offset={0.25} darkness={0.85} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </ScrollProvider>
    </div>
  );
}
