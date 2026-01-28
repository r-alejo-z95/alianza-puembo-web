"use client";

import { Layout, Plus, Sparkles, MoveVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function FloatingToolbar({ onAdd }) {
  const ToolBtn = ({ icon: Icon, label, onClick, highlight, description }) => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-14 w-14 rounded-[1.25rem] transition-all duration-500 relative group/btn",
              highlight
                ? "bg-black text-[var(--puembo-green)] hover:bg-black shadow-xl shadow-black/10 hover:scale-110 active:scale-95"
                : "hover:bg-gray-100 text-gray-400 hover:text-black hover:scale-110 active:scale-95"
            )}
            onClick={onClick}
          >
            <Icon className="h-6 w-6 group-hover/btn:rotate-6 transition-transform" />
            {highlight && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--puembo-green)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--puembo-green)]"></span>
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="font-black text-[9px] uppercase tracking-[0.2em] border-none shadow-2xl px-5 py-3 rounded-2xl bg-black text-white max-w-[180px]"
          sideOffset={15}
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
    <div
      data-toolbar
      className={cn(
        "bg-white/90 backdrop-blur-2xl p-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col gap-4 items-center",
        "animate-in fade-in slide-in-from-right duration-700 ease-out",
        "hover:shadow-2xl transition-all duration-500"
      )}
    >
      {/* Visual handle / Header */}
      <div className="flex flex-col items-center gap-1.5 opacity-20 group-hover:opacity-40 transition-opacity">
        <MoveVertical className="w-4 h-4 text-gray-400" />
      </div>

      <div className="flex flex-col gap-4">
        <ToolBtn
          icon={Plus}
          label="Añadir Pregunta"
          description="Inserta un nuevo bloque de entrada de datos"
          onClick={() => onAdd("text")}
          highlight
        />

        <div className="h-px w-10 bg-gradient-to-r from-transparent via-gray-100 to-transparent mx-auto" />

        <ToolBtn
          icon={Layout}
          label="Nueva Sección"
          description="Agrupa preguntas para organizar el flujo"
          onClick={() => onAdd("section")}
        />
      </div>

      {/* Decorative Brand indicator */}
      <div className="pt-2">
        <Sparkles className="w-4 h-4 text-[var(--puembo-green)] opacity-20 animate-pulse" />
      </div>
    </div>
  );
}