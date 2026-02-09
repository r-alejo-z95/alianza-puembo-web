"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils.ts";
import {
  contentSection,
  notAvailableText,
  sectionText,
} from "@/lib/styles";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { formatLiteralDate } from "@/lib/date-utils";
import { Quote, Search, X } from "lucide-react";

const ITEMS_PER_PAGE = 4;

export function NewsClient({ news: initialNews = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPage = parseInt(searchParams.get("page")) || 1;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(initialPage);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  // Sincronizar currentPage con cambios en la URL (ej. botones atrás/adelante)
  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  }, [searchParams]);

  // Manejar el scroll al hash ID si existe en la URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && initialNews?.length > 0) {
      const id = hash.replace("#", "");
      // Pequeño delay para asegurar que el DOM y las animaciones iniciales permitan el scroll
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialNews]);

  const filteredNews = useMemo(() => {
    if (!searchTerm) return initialNews;
    const lowerSearch = searchTerm.toLowerCase();
    return initialNews.filter((item) =>
      item.title.toLowerCase().includes(lowerSearch) ||
      (item.description && item.description.toLowerCase().includes(lowerSearch))
    );
  }, [initialNews, searchTerm]);

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const paginatedNews = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNews.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNews, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/noticias?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    handlePageChange(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    handlePageChange(1);
  };

  return (
    <div className={cn(contentSection, "bg-gray-50/50 pt-10 md:pt-12 pb-24 space-y-8 md:space-y-12")}>
      <section className="max-w-7xl mx-auto w-full">
        {/* Separador Visual Estándar */}
        <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12 px-2 md:px-4">
          <h2 className="text-xl md:text-4xl font-serif font-bold text-gray-900 whitespace-nowrap">
            Nuestras Historias
          </h2>
          <div className="h-1 bg-[var(--puembo-green)]/20 grow rounded-full" />
          <div className="h-1 w-8 md:w-12 bg-[var(--puembo-green)] rounded-full" />
        </div>

        {/* Barra de Búsqueda */}
        <motion.div
          {...fadeIn}
          className="bg-white p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 mb-10 md:mb-12 flex flex-col md:flex-row gap-4 items-center mx-2 md:mx-4"
        >
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar historias..."
              className="pl-12 h-12 md:h-14 rounded-xl md:rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all text-sm md:text-base"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </motion.div>

        {filteredNews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 mx-2 md:mx-4">
            <p className={notAvailableText}>
              {searchTerm 
                ? "No se encontraron noticias." 
                : "No hay noticias para mostrar."}
            </p>
          </div>
        ) : (
          <div className="space-y-16 md:space-y-24 px-2 md:px-4">
            {paginatedNews.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={item.id}
                  id={item.slug || item.id}
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn(
                    "flex flex-col gap-6 md:gap-8 items-center scroll-mt-32",
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  )}
                >
                  {/* Imagen destacada */}
                  <div className="w-full md:w-1/2">
                    <div className="relative aspect-[16/10] md:aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl group">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Quote className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Contenido de la noticia */}
                  <div className="w-full md:w-1/2 space-y-4 md:space-y-6 px-2 md:px-4">
                    <div className="space-y-1 md:space-y-2">
                      <span className="text-[var(--puembo-green)] font-bold tracking-widest uppercase text-[10px] md:text-xs">
                        {formatLiteralDate(item.publish_at)}
                      </span>
                      <h3 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
                        {item.title}
                      </h3>
                    </div>

                    <div className="h-0.5 md:h-1 w-12 md:w-16 bg-[var(--puembo-green)]/30 rounded-full" />

                    <p className={cn(sectionText, "text-base md:text-lg text-gray-600 leading-relaxed whitespace-pre-wrap")}>
                      {item.description}
                    </p>

                    <div className="pt-2 md:pt-4 flex items-center gap-4 text-gray-400">
                       <div className="h-px bg-gray-100 md:bg-gray-200 grow" />
                       <Quote className="w-4 h-4 md:w-5 md:h-5 opacity-20" />
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {totalPages > 1 && (
              <div className="flex justify-center pt-16 border-t border-gray-100">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}