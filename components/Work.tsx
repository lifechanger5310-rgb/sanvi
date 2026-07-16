"use client";

import { motion } from "framer-motion";

const projects = [
  {
    tc: "00:00:14:02",
    title: "AEGIS — Episode 1",
    tag: "Sci-fi / K-pop short",
    desc: "A five-member unit holds a shrinking perimeter in near silence — composure written into every camera move, every wardrobe seam, before the first cut lands.",
  },
  {
    tc: "00:00:41:19",
    title: "A Girl's Dream Note",
    tag: "Character short",
    desc: "A single notebook carries a full arc across 28 shots — built frame by frame from character bible to final grade, no stock footage.",
  },
];

export default function Work() {
  return (
    <section className="relative border-t border-[var(--color-hairline)]/60 px-6 py-24 md:px-12">
      <span className="hud-label mb-12 block">02 — SELECTED WORK</span>
      <div className="grid gap-px overflow-hidden rounded-sm border border-[var(--color-hairline)]/60 md:grid-cols-2">
        {projects.map((p, i) => (
          <motion.article
            key={p.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex min-h-[320px] flex-col justify-between bg-[var(--color-ink-raised)]/40 p-8 backdrop-blur-sm transition-colors hover:bg-[var(--color-ink-raised)]/70"
          >
            <div className="flex items-center justify-between">
              <span className="hud-label">{p.tc}</span>
              <span className="hud-label text-[var(--color-amber)]">{p.tag}</span>
            </div>
            <div>
              <h3 className="font-display mb-3 text-3xl text-white md:text-4xl">
                {p.title}
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-[var(--color-body)]">
                {p.desc}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
