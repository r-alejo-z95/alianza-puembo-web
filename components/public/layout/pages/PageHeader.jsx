"use client";

import { motion } from "framer-motion";

/**
 * @description Transparent Text Overlay Header
 * Renders high-impact typography meant to float over an immersive backdrop.
 */
export function PageHeader({ title, description }) {
  return (
    <div className="container mx-auto px-6 text-center text-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-2">
          <div className="h-px w-12 md:w-16 bg-[var(--puembo-green)] opacity-60" />
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-[var(--puembo-green)]">
            Alianza Puembo
          </span>
          <div className="h-px w-12 md:w-16 bg-[var(--puembo-green)] opacity-60" />
        </div>

        <h1 className="text-3xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight tracking-tight max-w-5xl mx-auto drop-shadow-2xl">
          {title}
        </h1>

        {description && (
          <p className="text-sm md:text-xl lg:text-2xl text-gray-200/80 font-light max-w-3xl mx-auto leading-relaxed italic drop-shadow-lg px-4">
            {description}
          </p>
        )}
      </motion.div>
    </div>
  );
}