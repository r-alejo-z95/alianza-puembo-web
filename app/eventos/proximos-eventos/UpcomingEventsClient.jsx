"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils.ts";
import {
  contentSection,
  notAvailableText,
} from "@/lib/styles";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { formatInEcuador } from "@/lib/date-utils";
import { MapPin, Calendar, Clock, Search, X } from "lucide-react";

const ITEMS_PER_PAGE = 4;

export function UpcomingEventsClient({ initialEvents = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const filteredEvents = useMemo(() => {
    if (!searchTerm) return initialEvents;
    return initialEvents.filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [initialEvents, searchTerm]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

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
            Próximos Eventos
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
              placeholder="Buscar eventos por nombre, descripción o lugar..."
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

        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 mx-4">
            <p className={notAvailableText}>
              {searchTerm 
                ? "No se encontraron eventos que coincidan con tu búsqueda." 
                : "No hay eventos próximamente."}
            </p>
          </div>
        ) : (
          <div className="space-y-12 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {paginatedEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  id={event.title}
                  {...fadeIn}
                  transition={{
                    ...fadeIn.transition,
                    delay: (index % 2) * 0.1,
                  }}
                >
                  <Link href={`/eventos/${event.slug}`} className="block h-full group">
                    <Card className="h-full border-none shadow-xl bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl">
                      <div className="relative w-full aspect-square overflow-hidden">
                        {event.poster_url ? (
                          <Image
                            src={event.poster_url}
                            alt={event.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            priority={index < 2}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <Calendar className="w-12 h-12" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-8">
                          <span className="text-white font-medium bg-[var(--puembo-green)] px-6 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            Ver detalles
                          </span>
                        </div>
                      </div>

                      <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-serif font-bold text-gray-900 leading-tight group-hover:text-[var(--puembo-green)] transition-colors">
                            {event.title}
                          </h3>
                          <div className="h-1 w-12 bg-[var(--puembo-green)]/30 rounded-full group-hover:w-20 transition-all duration-500" />
                        </div>

                        <div className="grid grid-cols-1 gap-3 pt-2">
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-[var(--puembo-green)]" />
                            <span className="font-medium">
                              {formatInEcuador(event.start_time, "d 'de' MMMM, yyyy")}
                            </span>
                          </div>

                          {!(event.is_multi_day || event.all_day) && (
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <Clock className="w-4 h-4 text-[var(--puembo-green)]" />
                              <span className="font-medium">
                                {formatInEcuador(event.start_time, "HH:mm")}
                              </span>
                            </div>
                          )}

                          {event.location && (
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-[var(--puembo-green)]" />
                              <span className="font-medium truncate">
                                {event.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center pt-8">
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