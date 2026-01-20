"use client";
import { sectionPx, secondaryTextSizes } from "@/lib/styles.ts";
import { cn } from "@/lib/utils.ts";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Newspaper, Calendar } from "lucide-react";
import Link from "next/link";

export default function Info() {
  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden bg-white">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50 -skew-x-12 translate-x-1/2 pointer-events-none" />

      <div className={cn(sectionPx, "relative z-10 max-w-7xl mx-auto")}>
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          {/* Columna de Imagen con Estilo Editorial */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/2 relative group"
          >
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl z-10">
              <Image
                src="/homepage/Info-section.jpg"
                alt="Comunidad Iglesia Alianza Puembo"
                fill
                sizes="(max-width: 768px) 768px, (max-width: 1200px) 600px, 960px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
            </div>

            {/* Decoración detrás de la imagen */}
            <div className="absolute -top-6 -left-6 w-full h-full border-2 border-[var(--puembo-green)]/20 rounded-[3rem] -z-10" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[var(--puembo-green)]/10 rounded-full blur-3xl -z-10" />
          </motion.div>

          {/* Columna de Contenido */}
          <div className="w-full md:w-1/2 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="h-px w-8 bg-[var(--puembo-green)]" />
                <span className="text-xs font-black uppercase tracking-[0.4em] text-[var(--puembo-green)]">
                  Nuestra Esencia
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight">
                Somos una familia con <br />
                <span className="text-[var(--puembo-green)] italic">
                  convicciones firmes
                </span>
              </h2>

              <p
                className={cn(
                  secondaryTextSizes,
                  "text-gray-600 leading-relaxed max-w-xl"
                )}
              >
                Compartimos nuestra fe con amor y queremos que formes parte de
                nuestra casa. En Alianza Puembo, creemos en el poder de la
                comunidad y el crecimiento espiritual conjunto.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Link href="/noticias" className="group">
                <div className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-[var(--puembo-green)]/30 transition-all duration-300">
                  <Newspaper className="w-8 h-8 text-[var(--puembo-green)] mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">
                    Noticias
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Mantente al tanto de lo que sucede en nuestra comunidad.
                  </p>
                  <div className="flex items-center text-xs font-bold text-[var(--puembo-green)] uppercase tracking-wider group-hover:gap-2 transition-all">
                    Leer más <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              <Link href="/eventos/proximos-eventos" className="group">
                <div className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-[var(--puembo-green)]/30 transition-all duration-300">
                  <Calendar className="w-8 h-8 text-[var(--puembo-green)] mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">
                    Eventos
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Descubre nuestras próximas actividades y reuniones.
                  </p>
                  <div className="flex items-center text-xs font-bold text-[var(--puembo-green)] uppercase tracking-wider group-hover:gap-2 transition-all">
                    Ver calendario <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
