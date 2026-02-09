"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils.ts";
import { contentSection } from "@/lib/styles";
import Link from "next/link";
import {
  ChevronRight,
  ArrowRight,
  Heart,
  HandHelping,
  Compass,
} from "lucide-react";

export function MinistryMap({ menuItems }) {
  // Extraemos las secciones clave de la configuración
  const involucrate = menuItems.find((item) => item.name === "Involúcrate");
  const rutaItem = involucrate?.subroutes.find((sub) => sub.name === "Ruta");
  const ministeriosItem = involucrate?.subroutes.find(
    (sub) => sub.name === "Ministerios"
  );
  const careSection = ministeriosItem?.subroutes.find(
    (sub) => sub.name === "Cuidado"
  );
  const serviceSection = ministeriosItem?.subroutes.find(
    (sub) => sub.name === "Servicio"
  );

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  // Renderiza el estilo único de tarjeta para todos los ministerios
  const renderCardLink = (item) => (
    <Link
      key={item.href || item.name}
      href={item.href || "#"}
      className="group flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md hover:border-[var(--puembo-green)]/20 transition-all duration-300 h-full"
    >
      <div className="flex flex-col grow pr-4">
        <span className="font-bold text-gray-900 group-hover:text-[var(--puembo-green)] transition-colors text-sm">
          {item.name}
        </span>
        {item.description && (
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium line-clamp-1 mt-0.5">
            {item.description}
          </span>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-[var(--puembo-green)] group-hover:translate-x-1 transition-all shrink-0" />
    </Link>
  );

  // Renderiza una categoría asegurando que siempre tenga título y sus hijos sean tarjetas
  const renderCategory = (category) => {
    return (
      <div key={category.name} className="space-y-6">
        {/* Encabezado de Columna/Categoría */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 group/title">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--puembo-green)]" />
          {category.href ? (
            <Link
              href={category.href}
              className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[var(--puembo-green)] transition-colors flex items-center gap-2"
            >
              {category.name}
              <ArrowRight className="w-3 h-3 opacity-0 group-hover/title:opacity-100 group-hover/title:translate-x-1 transition-all" />
            </Link>
          ) : (
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">
              {category.name}
            </h4>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {category.subroutes
            ? category.subroutes.map((sub) => {
                if (sub.subroutes) {
                  // Si tiene sub-sub-categorías (ej: Amor en Acción o MDA)
                  return (
                    <div key={sub.name} className="space-y-3 pt-2">
                      {sub.href ? (
                        <Link
                          href={sub.href}
                          className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--puembo-green)] opacity-50 px-2 hover:opacity-100 transition-opacity flex items-center gap-2 group/subtitle"
                        >
                          {sub.name}
                          <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover/subtitle:opacity-100 group-hover/subtitle:translate-x-1 transition-all" />
                        </Link>
                      ) : (
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--puembo-green)] opacity-50 px-2">
                          {sub.name}
                        </p>
                      )}
                      <div className="grid grid-cols-1 gap-2">
                        {sub.subroutes.map((leaf) => renderCardLink(leaf))}
                      </div>
                    </div>
                  );
                }
                // Link directo (ej: GP Familiares dentro de Grupos Pequeños)
                return renderCardLink(sub);
              })
            : // Si la categoría en sí es el link final (ej: Jóvenes, Puembo Kids, MAT)
              renderCardLink(category)}
        </div>
      </div>
    );
  };

  return (
    <section className="bg-gray-50/50 py-12 md:py-16 border-t border-gray-100 overflow-hidden">
      <div className={cn(contentSection, "max-w-7xl mx-auto space-y-16 md:space-y-32 px-4 md:px-12")}>
        {/* Sección de Ruta (Acceso Rápido) */}
        {rutaItem && (
          <motion.div
            {...fadeIn}
            className="bg-[var(--puembo-green)] rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 text-white shadow-2xl relative overflow-hidden group mx-2 md:mx-0"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <div className="space-y-3 md:space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/10">
                  <Compass className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                    Punto de Partida
                  </span>
                </div>
                <h2 className="text-2xl md:text-5xl font-serif font-bold tracking-tight leading-tight">
                  Descubre tu <span className="italic opacity-80">Ruta</span>
                </h2>
                <p className="text-green-50 max-w-xl text-base md:text-lg font-light leading-relaxed">
                  {rutaItem.description}. El camino diseñado para conocer
                  nuestra familia, crecer en fe y encontrar tu propósito.
                </p>
              </div>
              <Link
                href={rutaItem.href}
                className="bg-white text-[var(--puembo-green)] px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold shadow-xl hover:bg-green-50 transition-all flex items-center gap-2.5 md:gap-3 group/btn whitespace-nowrap text-sm md:text-base w-full md:w-auto justify-center"
              >
                Comenzar mi Ruta{" "}
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Cuidado Pastoral */}
        <motion.div {...fadeIn} className="space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 px-2 md:px-4">
            <div className="space-y-3 md:space-y-4 text-center md:text-left">
              <Link
                href={careSection?.href || "#"}
                className="flex items-center justify-center md:justify-start gap-2.5 md:gap-3 group/section"
              >
                <Heart className="w-5 h-5 md:w-6 md:h-6 text-[var(--puembo-green)] group-hover/section:scale-110 transition-transform" />
                <h2 className="text-2xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight group-hover/section:text-[var(--puembo-green)] transition-colors">
                  Cuidado{" "}
                  <span className="text-[var(--puembo-green)] italic">
                    Pastoral
                  </span>
                </h2>
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-[var(--puembo-green)] opacity-0 group-hover/section:opacity-100 group-hover/section:translate-x-2 transition-all" />
              </Link>
              <p className="text-gray-500 font-light max-w-xl text-sm md:text-lg leading-relaxed">
                Ministerios enfocados en acompañarte, fortalecer tu fe y
                brindarte comunidad en cada etapa.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12 px-2 md:px-0">
            {careSection?.subroutes.map((cat) => renderCategory(cat))}
          </div>
        </motion.div>

        {/* Separador Visual */}
        <div className="relative py-4">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-4 md:px-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-gray-300">
              Estructura Ministerial
            </span>
          </div>
        </div>

        {/* Servicio */}
        <motion.div {...fadeIn} className="space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 px-2 md:px-4">
            <div className="space-y-3 md:space-y-4 text-center md:text-left">
              <Link
                href={serviceSection?.href || "#"}
                className="flex items-center justify-center md:justify-start gap-2.5 md:gap-3 group/section"
              >
                <HandHelping className="w-5 h-5 md:w-6 md:h-6 text-[var(--puembo-green)] group-hover/section:scale-110 transition-transform" />
                <h2 className="text-2xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight group-hover/section:text-[var(--puembo-green)] transition-colors">
                  Manos al{" "}
                  <span className="text-[var(--puembo-green)] italic">
                    Servicio
                  </span>
                </h2>
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-[var(--puembo-green)] opacity-0 group-hover/section:opacity-100 group-hover/section:translate-x-2 transition-all" />
              </Link>
              <p className="text-gray-500 font-light max-w-xl text-sm md:text-lg leading-relaxed">
                Oportunidades para poner tus dones en acción y transformar vidas
                a través del servicio activo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12 md:gap-16 px-2 md:px-0">
            {serviceSection?.subroutes.map((cat) => renderCategory(cat))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
