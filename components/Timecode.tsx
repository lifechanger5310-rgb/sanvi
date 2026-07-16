"use client";

import { useEffect, useState } from "react";

// Maps scroll progress (0..1) onto a film timecode HH:MM:SS:FF at 24fps,
// as if the page itself were a single continuous shot.
const TOTAL_SECONDS = 96; // a 1:36 "reel" length, arbitrary but fixed
const FPS = 24;

function formatTimecode(progress: number) {
  const totalFrames = Math.floor(progress * TOTAL_SECONDS * FPS);
  const frames = totalFrames % FPS;
  const totalSeconds = Math.floor(totalFrames / FPS);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
}

export default function Timecode({ className = "" }: { className?: string }) {
  const [tc, setTc] = useState("00:00:00:00");

  useEffect(() => {
    function onScroll(e: Event) {
      const detail = (e as CustomEvent).detail;
      setTc(formatTimecode(detail?.progress ?? 0));
    }
    window.addEventListener("sanvi:scroll", onScroll);
    return () => window.removeEventListener("sanvi:scroll", onScroll);
  }, []);

  return (
    <span className={`hud-label font-hud tabular-nums ${className}`}>{tc}</span>
  );
}
