"use client";

import Link from "next/link";
import { ChevronLeft, LayoutGrid, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export function MinistryNavigation({ 
  backLink, 
  backLabel = "Volver",
  hierarchy = [], // [{ name: "Servicio", href: "/ministerios/servicio" }, ...]
  current
}) {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12 px-2 md:px-12">
      {/* Breadcrumbs / Jerarquía Visual */}
      <nav className="flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        <Link
          href="/involucrate/ministerios"
          className="hover:text-[var(--puembo-green)] transition-colors flex items-center gap-2 group"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[var(--puembo-green)] group-hover:scale-110 transition-transform" />
          Ministerios
        </Link>

        {hierarchy.map((item, index) => (
          <div key={item.href} className="flex items-center gap-2">
            <ChevronRight className="w-2.5 h-2.5 text-gray-300" />
            <Link
              href={item.href}
              className="hover:text-[var(--puembo-green)] transition-colors"
            >
              {item.name}
            </Link>
          </div>
        ))}

        {current && (
          <div className="flex items-center gap-2">
            <ChevronRight className="w-2.5 h-2.5 text-gray-300" />
            <span className="text-[var(--puembo-green)]">
              {current}
            </span>
          </div>
        )}
      </nav>

      {/* Botón de Retroceso Rápido (Opcional, se mantiene por compatibilidad o énfasis) */}
      {backLink && (
        <div className="pt-2 lg:pt-0">
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-400 hover:text-[var(--puembo-green)] transition-all group border border-gray-100 px-3.5 py-1.5 md:px-4 md:py-2 rounded-full hover:border-[var(--puembo-green)]/20 hover:bg-white"
          >
            <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform text-[var(--puembo-green)]" />
            {backLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
