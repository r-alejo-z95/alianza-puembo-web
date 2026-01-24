"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AdminFAB (Floating Action Button) - Versión "Premium Pill"
 * Solo visible en móviles (< lg).
 */
export function AdminFAB({
  onClick,
  label = "NUEVO",
  icon: Icon = Plus,
  className,
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-22 right-6 z-400 lg:hidden"
      >
        <Button
          onClick={onClick}
          className={cn(
            "h-12 w-auto px-6 rounded-full bg-black text-white shadow-2xl shadow-black/40 active:scale-95 transition-all duration-500 border border-[var(--puembo-green)]/30 flex items-center gap-3 backdrop-blur-md",
            className,
          )}
        >
          <Icon
            size={18}
            className="text-[var(--puembo-green)]"
            strokeWidth={3}
          />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
            {label}
          </span>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
