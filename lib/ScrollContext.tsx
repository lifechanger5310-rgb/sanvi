"use client";

import { createContext, useContext, useEffect, useRef } from "react";

export type ScrollState = { progress: number; velocity: number };

const ScrollCtx = createContext<{ current: ScrollState } | null>(null);

/**
 * Wraps the R3F <Canvas>. R3F bridges context from ancestors above the
 * Canvas into the fiber tree, so components inside the scene can read
 * this ref every frame with zero re-renders — the mutation happens on a
 * window event, not React state.
 */
export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<ScrollState>({ progress: 0, velocity: 0 });

  useEffect(() => {
    let last = 0;
    let lastTime = performance.now();
    function onScroll(e: Event) {
      const detail = (e as CustomEvent).detail;
      const progress = detail?.progress ?? 0;
      const now = performance.now();
      const dt = Math.max(now - lastTime, 1);
      const velocity = (progress - last) / dt;
      ref.current = { progress, velocity };
      last = progress;
      lastTime = now;
    }
    window.addEventListener("sanvi:scroll", onScroll);
    return () => window.removeEventListener("sanvi:scroll", onScroll);
  }, []);

  return <ScrollCtx.Provider value={ref}>{children}</ScrollCtx.Provider>;
}

export function useScrollRef() {
  const ctx = useContext(ScrollCtx);
  if (!ctx) throw new Error("useScrollRef must be used inside ScrollProvider");
  return ctx;
}
