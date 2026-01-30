"use client";

import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--puembo-green)] opacity-[0.03] blur-[120px] -z-10" />

      <div className="max-w-xl w-full space-y-10 animate-in fade-in zoom-in duration-1000">
        {/* Icon/Visual */}
        <div className="relative mx-auto w-32 h-32 md:w-40 md:h-40">
          <div className="absolute inset-0 bg-[var(--puembo-green)] opacity-10 rounded-[3rem] rotate-12 animate-pulse" />
          <div className="absolute inset-0 bg-gray-50 rounded-[3rem] -rotate-6 border border-gray-100 flex items-center justify-center shadow-inner">
            <Search className="w-12 h-12 md:w-16 md:h-16 text-gray-300" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex items-center justify-center">
            <span className="text-2xl md:text-3xl font-black font-serif text-[var(--puembo-green)]">
              404
            </span>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-serif font-black text-gray-900 leading-tight">
            Página no <br />
            <span className="text-[var(--puembo-green)] italic">
              encontrada.
            </span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-light leading-relaxed max-w-md mx-auto">
            Lo sentimos, el camino que buscas parece no existir o ha sido
            movido.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="rounded-full h-14 px-8 text-gray-400 hover:text-gray-900 transition-all text-xs font-black uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="w-4 h-4 mr-2 opacity-50" />
            Volver
          </Button>
          <Button
            asChild
            className="rounded-full h-14 px-10 bg-black text-white hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10 text-xs font-black uppercase tracking-[0.2em]"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-3 text-[var(--puembo-green)]" />
              Ir a casa
            </Link>
          </Button>
        </div>

        {/* Footer info */}
        <div className="pt-12 border-t border-gray-100 flex flex-col items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
            Iglesia Alianza Puembo
          </p>
        </div>
      </div>
    </main>
  );
}
