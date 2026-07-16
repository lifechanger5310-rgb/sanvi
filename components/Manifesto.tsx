"use client";

import { motion } from "framer-motion";

export default function Manifesto() {
  return (
    <section className="relative flex min-h-[70vh] flex-col justify-center border-t border-[var(--color-hairline)]/60 px-6 md:px-12">
      <span className="hud-label mb-6">01 — THESIS</span>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="font-display max-w-3xl text-3xl font-light leading-snug text-white md:text-5xl"
      >
        The calmer a scene sits, the more dangerous the fight underneath it
        gets. Every frame Sanvi ships is built on that tension — a world
        that keeps moving under the surface, even when nothing on it seems
        to move at all.
      </motion.p>
    </section>
  );
}
