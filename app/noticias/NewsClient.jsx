"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils.ts";
import {
  sectionTitle,
  sectionText,
  contentSection,
  notAvailableText,
} from "@/lib/styles";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { formatLiteralDate } from "@/lib/date-utils";
import { Quote } from "lucide-react";
import { useEffect } from "react";

export function NewsClient({ news, totalPages, hasNextPage, page }) {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  // Manejar el scroll al hash ID si existe en la URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && news?.length > 0) {
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
  }, [news]);

  return (
    <div className={cn(contentSection, "bg-gray-50/50 pt-12 pb-24 space-y-20")}>
      <section className="max-w-7xl mx-auto w-full">
        {/* Separador Visual Estándar */}
        <div className="flex items-center gap-6 mb-16 px-4">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 whitespace-nowrap">
            Nuestras Historias
          </h2>
          <div className="h-1.5 bg-[var(--puembo-green)]/20 grow rounded-full" />
          <div className="h-1.5 w-12 bg-[var(--puembo-green)] rounded-full" />
        </div>

        {!news || news.length === 0 ? (
          <p className={cn(notAvailableText, "text-center py-20")}>No hay noticias para mostrar.</p>
        ) : (
          <div className="space-y-24">
            {news.map((item, index) => {
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
                  hasNextPage={hasNextPage}
                  totalPages={totalPages}
                  basePath="/noticias"
                  currentPage={page}
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
