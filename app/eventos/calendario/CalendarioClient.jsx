"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils.ts";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";
import { UserCalendar } from "@/components/shared/CalendarOrigin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { eventColors } from "@/components/public/calendar/event-calendar/utils";

export function CalendarioClient() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <div className={cn(contentSection, "bg-gray-50/50 pt-12 pb-24")}>
      <section className="max-w-7xl mx-auto w-full">
        {/* Separador Visual Estándar */}
        <div className="flex items-center gap-6 mb-12 px-4">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 whitespace-nowrap">
            Calendario de Actividades
          </h2>
          <div className="h-1.5 bg-[var(--puembo-green)]/20 grow rounded-full" />
          <div className="h-1.5 w-12 bg-[var(--puembo-green)] rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Columna Principal: Calendario */}
          <motion.div {...fadeIn} className="lg:col-span-3">
            <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-2xl ring-1 ring-black/5">
              <CardContent className="p-2 sm:p-6">
                <UserCalendar />
              </CardContent>
            </Card>

            <p className="mt-6 text-sm text-gray-400 italic px-2">
              * Haz clic en los eventos para ver un resumen rápido y detalles
              completos.
            </p>
          </motion.div>

          {/* Columna Lateral: Leyenda y Contexto */}
          <aside className="space-y-8">
            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
              <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                  <CardTitle className="text-lg font-serif font-bold text-gray-900">
                    Categorías
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {Object.entries(eventColors).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3 group">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full shrink-0 transition-transform group-hover:scale-125",
                            value.bgForm
                          )}
                        />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                          {value.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              {...fadeIn}
              transition={{ delay: 0.3 }}
              className="p-8 bg-[var(--puembo-green)] rounded-2xl shadow-xl text-white relative overflow-hidden group"
            >
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-xl font-serif font-bold mb-3 relative z-10">
                ¿Eres nuevo?
              </h3>
              <p className="text-sm text-green-50 leading-relaxed mb-4 relative z-10">
                Todos nuestros eventos están abiertos a la comunidad. <br></br>
                ¡Te esperamos!
              </p>
              <a
                href="/conocenos/equipo"
                className="text-xs font-bold uppercase tracking-wider underline underline-offset-4 hover:text-white transition-colors relative z-10"
              >
                Conoce a nuestro Equipo
              </a>
            </motion.div>
          </aside>
        </div>
      </section>
    </div>
  );
}
