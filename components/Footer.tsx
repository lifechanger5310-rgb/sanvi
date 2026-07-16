"use client";

import { motion } from "framer-motion";
import MagneticLink from "./MagneticLink";

export default function Footer() {
  return (
    <section className="relative border-t border-[var(--color-hairline)]/60 px-6 py-24 md:px-12">
      <span className="hud-label mb-8 block">04 — CONTACT</span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
        className="font-display mb-10 max-w-2xl text-4xl text-white md:text-6xl"
      >
        Next scene starts with a message.
      </motion.h2>
      <div className="flex flex-wrap items-center gap-x-10 gap-y-4 hud-label">
        <MagneticLink href="https://www.youtube.com/@sjframes">
          YOUTUBE — @SJFRAMES
        </MagneticLink>
        <MagneticLink href="https://www.instagram.com/sjframes">
          INSTAGRAM — @SJFRAMES
        </MagneticLink>
      </div>
      <p className="mt-16 text-xs text-[var(--color-hairline)]">
        © {new Date().getFullYear()} Sanvi. Built frame by frame.
      </p>
    </section>
  );
}
