'use client';

import { Youtube, MapPin, Clock } from "lucide-react";
import dynamic from 'next/dynamic';
import { cn } from "@/lib/utils.ts";
import {
  sectionPx,
} from "@/lib/styles.ts";
import { useEffect, useRef, useState } from "react";
import { motion } from 'framer-motion';

const GoogleMapView = dynamic(() => import('@/components/public/map/InteractiveMap'), { ssr: false });

export default function Ubicacion({ youtubeStatus }) {
  const { videoUrl } = youtubeStatus;
  const sectionRef = useRef(null);
  const [showMap, setShowMap] = useState(false);
  const [mapIsLoaded, setMapIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleMapLoad = () => {
    setMapIsLoaded(true);
  };

  useEffect(() => {
    // Detectar si es móvil solo en el cliente para evitar hidratación fallida
    setIsMobile(window.innerWidth < 768);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShowMap(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="ubicacion" ref={sectionRef} className="w-full py-16 md:py-24 bg-gray-50/50 overflow-hidden">
      <div className={cn(sectionPx, "max-w-7xl mx-auto space-y-12 md:space-y-16")}>
        {/* Cabecera de Sección Modernizada */}
        <div className="text-center space-y-4 px-2">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3"
          >
            <div className="h-0.5 w-8 md:w-12 bg-[var(--puembo-green)]" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[var(--puembo-green)]">
              Te esperamos
            </span>
            <div className="h-0.5 w-8 md:w-12 bg-[var(--puembo-green)]" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight"
          >
            ¡Queremos conocerte! <br />
            <span className="text-[var(--puembo-green)]">Visítanos</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 items-start">
          {/* Mapa Interactiva - Eliminamos desplazamiento lateral en móvil de forma segura */}
          <motion.div 
            initial={{ opacity: 0, x: isMobile ? 0 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-3 h-[350px] md:h-[500px] overflow-hidden rounded-2xl md:rounded-3xl w-full shadow-lg"
          >
            {showMap && <GoogleMapView onMapLoad={handleMapLoad} />}
          </motion.div>

          {/* Tarjetas de Información */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 w-full">
            <motion.div 
              initial={{ opacity: 0, x: isMobile ? 0 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100 space-y-4 md:space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--puembo-green)]/10 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-[var(--puembo-green)]" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Horarios</h3>
                  <div className="space-y-3 md:space-y-4 pt-1 md:pt-2">
                    <div>
                      <p className="text-xl md:text-2xl font-serif font-bold text-gray-800">10:00 | 12:00</p>
                      <p className="text-xs md:text-sm text-gray-500 font-medium">Servicios Presenciales</p>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-xl md:text-2xl font-serif font-bold text-gray-800">10:00</p>
                        <p className="text-xs md:text-sm text-gray-500 font-medium">Transmisión Online</p>
                      </div>
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 md:p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
                      >
                        <Youtube className="w-5 h-5 md:w-6 md:h-6" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: isMobile ? 0 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--puembo-green)]/10 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-[var(--puembo-green)]" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Dirección</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed mt-1 md:mt-2">
                    Julio Tobar Donoso y 24 de Mayo <br />
                    Puembo, Ecuador
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
