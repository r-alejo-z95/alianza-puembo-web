"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils.ts";
import { contentSection, notAvailableText } from "@/lib/styles";
import { Badge } from '@/components/ui/badge';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { useScreenSize } from '@/lib/hooks/useScreenSize';
import { formatInEcuador } from '@/lib/date-utils';
import { Heart, Quote } from "lucide-react";
import dynamic from 'next/dynamic';
import { addPrayerRequest } from '@/lib/actions';
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';

const PrayerRequestForm = dynamic(() => import('@/components/public/forms/PrayerRequestForm'), { ssr: false });

export function OracionClient({ requests }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const { isSm } = useScreenSize();
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    if (isSm) setItemsPerPage(4);
    else setItemsPerPage(6);
  }, [isSm]);

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRequests = requests.slice(startIndex, startIndex + itemsPerPage);

  const onPageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  // Manejar el scroll al hash ID si existe en la URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && requests?.length > 0) {
      const id = hash.replace("#", "");
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [requests]);

    return (
      <div className={cn(contentSection, "bg-gray-50/50 pt-10 md:pt-12 pb-24 space-y-16 md:space-y-24")}>
        {/* Muro de Oración */}
        <section className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4 md:gap-6 mb-10 md:mb-16 px-2 md:px-4">
            <h2 className="text-xl md:text-4xl font-serif font-bold text-gray-900 whitespace-nowrap">
              Muro de Oración
            </h2>
            <div className="h-1 bg-[var(--puembo-green)]/20 grow rounded-full" />
            <div className="h-1 w-8 md:w-12 bg-[var(--puembo-green)] rounded-full" />
          </div>

          {requests.length === 0 ? (
            <p className={cn(notAvailableText, "text-center py-16 px-4")}>No hay peticiones para mostrar.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-2 md:px-4">
              {currentRequests.map((req, index) => (
                <motion.div
                  key={req.id}
                  id={req.id}
                  {...fadeIn}
                  transition={{ delay: (index % 3) * 0.1 }}
                  className="relative bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-lg border-r-4 md:border-r-8 border-r-[var(--puembo-green)] hover:shadow-xl transition-all duration-300 group h-full flex flex-col scroll-mt-32"
                >
                  <Quote className="absolute top-4 right-4 md:right-6 w-6 h-6 md:w-8 md:h-8 text-gray-50 group-hover:text-green-50 transition-colors" />
                  <div className="space-y-3 md:space-y-4 grow">
                    <p className="text-sm md:text-gray-700 leading-relaxed font-medium line-clamp-6 italic">
                      "{req.request_text}"
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 md:pt-6 mt-4 border-t border-gray-100">
                    <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {formatInEcuador(req.created_at, "d MMM, yyyy")}
                    </span>
                    <Badge variant={req.is_anonymous ? "secondary" : "outline"} className="rounded-full px-2 md:px-3 text-[10px] md:text-xs">
                      {req.is_anonymous ? "Anónimo" : (req.name || "Alguien")}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pt-10 md:pt-12 flex justify-center">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </section>

        {/* Formulario Section */}
        <section className="max-w-3xl mx-auto w-full px-2 md:px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-6 md:p-12 space-y-8 md:space-y-10">
              <div className="text-center space-y-3 md:space-y-4">
                <div className="inline-flex p-2.5 md:p-3 bg-green-50 rounded-xl md:rounded-2xl text-[var(--puembo-green)] mb-1 md:mb-2">
                  <Heart className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">¿Podemos orar por ti?</h2>
                <p className="text-sm md:text-base text-gray-500 max-w-lg mx-auto">
                  Tu petición será recibida por nuestro equipo de intercesión. Puedes elegir si deseas que sea pública o privada.
                </p>
              </div>

              <div className="max-w-xl mx-auto text-left">
                <PrayerRequestForm action={addPrayerRequest} />
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    );
  }