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

  const handleMapLoad = () => {
    setMapIsLoaded(true);
  };

  useEffect(() => {
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
    <section id="ubicacion" ref={sectionRef} className="w-full py-24 bg-gray-50/50">
      <div className={cn(sectionPx, "max-w-7xl mx-auto space-y-16")}>
        {/* Cabecera de Sección Modernizada */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3"
          >
            <div className="h-0.5 w-12 bg-[var(--puembo-green)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
              Te esperamos
            </span>
            <div className="h-0.5 w-12 bg-[var(--puembo-green)]" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900"
          >
            ¡Queremos conocerte! <br />
            <span className="text-[var(--puembo-green)]">Visítanos</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Mapa Interactiva - Solo el mapa, limpio */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-3 h-[400px] md:h-[500px] overflow-hidden rounded-3xl"
          >
            {showMap && <GoogleMapView onMapLoad={handleMapLoad} />}
          </motion.div>

          {/* Tarjetas de Información */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--puembo-green)]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-[var(--puembo-green)]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Horarios</h3>
                  <div className="space-y-4 pt-2">
                    <div>
                      <p className="text-2xl font-serif font-bold text-gray-800">10:00 | 12:00</p>
                      <p className="text-sm text-gray-500 font-medium">Servicios Presenciales</p>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-2xl font-serif font-bold text-gray-800">10:00</p>
                        <p className="text-sm text-gray-500 font-medium">Transmisión Online</p>
                      </div>
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
                      >
                        <Youtube className="w-6 h-6" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--puembo-green)]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-[var(--puembo-green)]" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Dirección</h3>
                  <p className="text-gray-600 leading-relaxed mt-2">
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
