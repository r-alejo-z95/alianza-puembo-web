"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils.ts";

export function PageHeader({ title, description, imageUrl, imageAlt }) {
  return (
    <div className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image with subtle zoom */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority
          className="object-cover object-center brightness-75"
          sizes="(max-width: 768px) 768px, (max-width: 1200px) 1200px, 1920px"
        />
        {/* Deep gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 text-center text-white space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-[var(--puembo-green)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--puembo-green)]">
              Alianza Puembo
            </span>
            <div className="h-px w-12 bg-[var(--puembo-green)]" />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight tracking-tight max-w-4xl mx-auto">
            {title}
          </h1>

          {description && (
            <p className="text-sm md:text-lg lg:text-xl text-gray-200/90 font-light max-w-2xl mx-auto leading-relaxed italic">
              {description}
            </p>
          )}
        </motion.div>
      </div>

      {/* Decorative bottom element */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent z-10" />
    </div>
  );
}
