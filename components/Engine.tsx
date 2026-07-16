"use client";

import { motion } from "framer-motion";

const layers = [
  {
    tc: "00:01:02:08",
    name: "Lenis",
    role: "Motion layer",
    desc: "Inertia-based scroll so every reveal on this page lands on the same easing curve, not the browser's default jump.",
  },
  {
    tc: "00:01:09:15",
    name: "React Three Fiber",
    role: "Render layer",
    desc: "A fixed WebGL canvas behind the copy, running the custom shader you've been looking at this whole time.",
  },
  {
    tc: "00:01:16:22",
    name: "DOM overlay",
    role: "Content layer",
    desc: "Real, selectable, accessible text — animated on top of the canvas, never trapped inside it.",
  },
];

export default function Engine() {
  return (
    <section className="relative border-t border-[var(--color-hairline)]/60 px-6 py-24 md:px-12">
      <span className="hud-label mb-12 block">03 — THE ENGINE</span>
      <p className="font-display mb-14 max-w-xl text-2xl font-light text-white md:text-3xl">
        This page is the demo reel. Three layers, kept in sync.
      </p>
      <div className="flex flex-col divide-y divide-[var(--color-hairline)]/60 border-t border-[var(--color-hairline)]/60">
        {layers.map((l, i) => (
          <motion.div
            key={l.name}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
            className="grid grid-cols-1 gap-4 py-6 md:grid-cols-[auto_1fr_2fr]"
          >
            <span className="hud-label">{l.tc}</span>
            <div>
              <span className="font-display text-xl text-white">{l.name}</span>
              <span className="ml-3 hud-label text-[var(--color-cyan)]">{l.role}</span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[var(--color-body)]">
              {l.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
