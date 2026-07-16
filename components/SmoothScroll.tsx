"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * Wraps Lenis smooth-scroll and drives the RAF loop.
 * Exposes scroll progress (0..1) on a global CSS variable + window event
 * so the shader background and HUD timecode can react without prop drilling.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      const progress = lenis.progress || 0;
      document.documentElement.style.setProperty("--scroll-progress", String(progress));
      window.dispatchEvent(new CustomEvent("sanvi:scroll", { detail: { progress } }));
      requestAnimationFrame(raf);
    }
    const raf_id = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(raf_id);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
