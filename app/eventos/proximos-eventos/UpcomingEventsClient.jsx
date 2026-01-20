"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils.ts";
import {
  sectionTitle,
  sectionText,
  contentSection,
  notAvailableText,
} from "@/lib/styles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { subDays } from "date-fns";
import { formatInEcuador, getNowInEcuador } from "@/lib/date-utils";
import { MapPin, Calendar, Clock } from "lucide-react";

export function UpcomingEventsClient({
  paginatedEvents,
  totalPages,
  hasNextPage,
  page,
}) {
  const now = getNowInEcuador();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <div className={cn(contentSection, "bg-gray-50/50 pt-12 pb-24 space-y-20")}>
      <section className="max-w-7xl mx-auto w-full">
        {/* Separador Visual Estándar */}
        <div className="flex items-center gap-6 mb-16 px-4">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 whitespace-nowrap">
            Próximos Eventos
          </h2>
          <div className="h-1.5 bg-[var(--puembo-green)]/20 grow rounded-full" />
          <div className="h-1.5 w-12 bg-[var(--puembo-green)] rounded-full" />
        </div>

        {paginatedEvents.length === 0 ? (
          <p className={cn(notAvailableText, "text-center py-20")}>
            No hay eventos próximamente.
          </p>
        ) : (
          <div className="space-y-12">
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
                  hasNextPage={hasNextPage}
                  totalPages={totalPages}
                  basePath="/eventos/proximos-eventos"
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
