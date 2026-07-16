"use client";
/* eslint-disable react-hooks/immutability --
   This file only ever mutates the live scene camera inside useFrame, R3F's
   per-frame imperative loop that runs outside React's render phase. The
   rule doesn't yet recognize useFrame as a safe escape hatch (same as it
   wouldn't recognize a requestAnimationFrame loop or a GSAP ticker), so it
   flags this as if it happened during render. It doesn't. */

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";
import { cameraAt } from "@/lib/sceneConfig";
import { useScrollRef } from "@/lib/ScrollContext";

export default function CameraRig() {
  const { camera } = useThree();
  const scrollRef = useScrollRef();
  const lookTarget = useRef(new THREE.Vector3());
  const posTarget = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const { progress } = scrollRef.current;
    const { pos, look, fov } = cameraAt(progress);

    posTarget.current.set(pos[0], pos[1], pos[2]);
    lookTarget.current.set(look[0], look[1], look[2]);

    // Gentle pointer parallax layered on top of the scroll dolly.
    const px = state.pointer.x * 0.35;
    const py = state.pointer.y * 0.2;

    const smoothing = 1 - Math.pow(0.001, delta);
    camera.position.lerp(
      new THREE.Vector3(posTarget.current.x + px, posTarget.current.y + py, posTarget.current.z),
      smoothing
    );

    const cam = camera as THREE.PerspectiveCamera;
    if (cam.fov !== undefined) {
      // camera from useThree() is R3F's live scene camera; mutating it
      // per-frame is the standard imperative pattern, same as .position.lerp() above.
      cam.fov = THREE.MathUtils.lerp(cam.fov, fov, smoothing);
      cam.updateProjectionMatrix();
    }
    camera.lookAt(lookTarget.current);
  });

  return null;
}
