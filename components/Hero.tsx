"use client";

import { motion } from "framer-motion";
import Timecode from "./Timecode";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-between px-6 pt-28 pb-10 md:px-12">
      <div className="flex items-start justify-between hud-label">
        <span>SANVI / REEL 001</span>
        <Timecode />
      </div>

      <div>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="hud-label mb-6"
        >
          AI CINEMATIC PRODUCTION
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[13vw] leading-[0.92] tracking-tight text-white md:text-[8vw]"
        >
          Composure
          <br />
          <span className="italic text-[var(--color-amber)]">is the weapon.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-8 max-w-md text-sm leading-relaxed text-[var(--color-body)] md:text-base"
        >
          Sanvi builds character-driven sci-fi shorts, music-led narratives,
          and the shader-rendered worlds they live in — end to end, one
          director&apos;s chair.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="flex items-center gap-3 hud-label"
      >
        <span className="h-px w-10 bg-[var(--color-cyan)]" />
        <span>SCROLL TO PLAY</span>
      </motion.div>
    </section>
  );
}
