"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AdminFAB (Floating Action Button)
 * Solo visible en móviles (< lg).
 */
export function AdminFAB({ onClick, label = "Nuevo", icon: Icon = Plus, className }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: 20 }}
        className="fixed bottom-8 right-6 z-40 lg:hidden"
      >
        <Button
          onClick={onClick}
          size="icon"
          className={cn(
            "h-16 w-16 rounded-full bg-[var(--puembo-green)] text-white shadow-2xl shadow-[var(--puembo-green)]/40 hover:bg-[var(--puembo-green)]/90 active:scale-95 transition-all duration-300 border-4 border-white",
            className
          )}
        >
          <Icon className="h-8 w-8" />
          <span className="sr-only">{label}</span>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
