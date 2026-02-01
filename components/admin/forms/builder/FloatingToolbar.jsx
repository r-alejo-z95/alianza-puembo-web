"use client";

import { Layout, Plus, Sparkles, MoveVertical, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function FloatingToolbar({ onAdd, onOpenImporter }) {
  const ToolBtn = ({ icon: Icon, label, onClick, highlight, description }) => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-14 w-14 rounded-2xl transition-all duration-500 relative group/btn border border-transparent",
              highlight
                ? "bg-white/10 text-[var(--puembo-green)] hover:bg-white/20 shadow-xl shadow-black/20 hover:scale-110 active:scale-95 border-white/5"
                : "text-white/40 hover:text-white hover:bg-white/5 hover:scale-110 active:scale-95",
            )}
            onClick={onClick}
          >
            <Icon
              className="h-6 w-6 group-hover/btn:rotate-6 transition-transform"
              strokeWidth={highlight ? 3 : 2}
            />
            {highlight && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--puembo-green)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--puembo-green)]"></span>
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="font-black text-[9px] uppercase tracking-[0.2em] border border-white/10 shadow-2xl px-5 py-3 rounded-2xl bg-black text-white max-w-[180px] backdrop-blur-xl"
          sideOffset={20}
        >
          <div className="space-y-1">
            <p className="text-[var(--puembo-green)]">{label}</p>
            {description && (
              <p className="text-[8px] text-gray-500 font-medium normal-case tracking-tight leading-tight">
                {description}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      data-toolbar
      className={cn(
        "bg-black backdrop-blur-md p-4 rounded-[2.5rem] shadow-2xl border border-[var(--puembo-green)]/20 flex flex-col gap-4 items-center",
        "transition-all duration-500 hover:border-[var(--puembo-green)]/40 hover:shadow-[var(--puembo-green)]/5",
      )}
    >
      <div className="flex flex-col gap-4">
        <ToolBtn
          icon={Plus}
          label="Añadir Pregunta"
          description="Inserta un nuevo bloque de entrada de datos"
          onClick={() => onAdd("text")}
          highlight
        />

        <div className="h-px w-8 bg-white/10 mx-auto" />

        <ToolBtn
          icon={Layout}
          label="Nueva Sección"
          description="Agrupa preguntas para organizar el flujo"
          onClick={() => onAdd("section")}
        />

        <div className="h-px w-8 bg-white/10 mx-auto" />

        <ToolBtn
          icon={FileSpreadsheet}
          label="Importar"
          description="Copia preguntas de otros formularios"
          onClick={onOpenImporter}
        />
      </div>
    </motion.div>
  );
}
