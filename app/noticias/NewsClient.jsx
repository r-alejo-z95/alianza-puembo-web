"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className={cn(contentSection, "bg-gray-50/50 pt-12 pb-24 space-y-12")}>
      <section className="max-w-7xl mx-auto w-full">
        {/* Separador Visual Estándar */}
        <div className="flex items-center gap-6 mb-12 px-4">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 whitespace-nowrap">
            Nuestras Historias
          </h2>
          <div className="h-1.5 bg-[var(--puembo-green)]/20 grow rounded-full" />
          <div className="h-1.5 w-12 bg-[var(--puembo-green)] rounded-full" />
        </div>

        {/* Barra de Búsqueda */}
        <motion.div
          {...fadeIn}
          className="bg-white p-4 md:p-6 rounded-3xl shadow-lg border border-gray-100 mb-12 flex flex-col md:flex-row gap-4 items-center mx-4"
        >
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar historias por título o contenido..."
              className="pl-12 h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all text-base"
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
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 mx-4">
            <p className={notAvailableText}>
              {searchTerm 
                ? "No se encontraron noticias que coincidan con tu búsqueda." 
                : "No hay noticias para mostrar."}
            </p>
          </div>
        ) : (
          <div className="space-y-24 px-4">
            {paginatedNews.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={item.id}
                  id={item.id}
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn(
                    "flex flex-col gap-8 items-center scroll-mt-32",
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  )}
                >
                  {/* Imagen destacada */}
                  <div className="w-full md:w-1/2">
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Quote className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Contenido de la noticia */}
                  <div className="w-full md:w-1/2 space-y-6 px-4">
                    <div className="space-y-2">
                      <span className="text-[var(--puembo-green)] font-bold tracking-widest uppercase text-xs">
                        {item.news_date ? formatLiteralDate(item.news_date) : "Actualidad"}
                      </span>
                      <h3 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
                        {item.title}
                      </h3>
                    </div>

                    <div className="h-1 w-16 bg-[var(--puembo-green)]/30 rounded-full" />

                    <p className={cn(sectionText, "text-lg text-gray-600 leading-relaxed whitespace-pre-wrap")}>
                      {item.description}
                    </p>

                    <div className="pt-4 flex items-center gap-4 text-gray-400">
                       <div className="h-px bg-gray-200 grow" />
                       <Quote className="w-5 h-5 opacity-20" />
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
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}