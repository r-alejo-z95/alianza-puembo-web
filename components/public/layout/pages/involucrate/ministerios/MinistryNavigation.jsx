"use client";

import Link from "next/link";
import { ChevronLeft, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export function MinistryNavigation({ backLink, backLabel = "Volver" }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 px-12">
      {/* Botón Nivel Superior (Opcional) */}
      {backLink ? (
        <Link
          href={backLink}
          className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[var(--puembo-green)] transition-all group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[var(--puembo-green)]" />
          {backLabel}
        </Link>
      ) : (
        <div className="hidden sm:block w-32" />
      )}

      {/* Botón Obligatorio al Mapa de Ministerios */}
      <Link
        href="/involucrate/ministerios"
        className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[var(--puembo-green)] transition-all group"
      >
        <LayoutGrid className="w-4 h-4 text-[var(--puembo-green)] transition-transform group-hover:scale-110" />
        Mapa de Ministerios
      </Link>
    </div>
  );
}
