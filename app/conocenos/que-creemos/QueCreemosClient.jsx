"use client";

import { motion } from "framer-motion";
import { sectionTitle, sectionText, contentSection } from "@/lib/styles";
import { cn } from "@/lib/utils.ts";
import { BeliefBlock } from "@/components/public/layout/pages/que-creemos/BeliefBlock";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, TrendingUp, Map } from "lucide-react";

const beliefs = [
  {
    name: "Cristo nuestro Salvador",
    detail:
      "Creemos que Jesús es el único camino a Dios. A través de su muerte y resurrección, Él ofrece el perdón de los pecados y el regalo de la vida eterna.",
    verse:
      "¡En ningún otro hay salvación! Dios no ha dado ningún otro nombre bajo el cielo, mediante el cual podamos ser salvos.",
    citation: "Hechos 4:12",
    image: "/conocenos/que-creemos/savior-tomb.png",
  },
  {
    name: "Cristo nuestro Santificador",
    detail:
      "Creemos que después de la salvación, Cristo nos guía a una vida de santidad y obediencia a través de la obra transformadora del Espíritu Santo.",
    verse:
      "Cristo nos hizo justos ante Dios; nos hizo puros y santos y nos liberó del pecado.",
    citation: "1 Corintios 1:30",
    image: "/conocenos/que-creemos/sanctifier-potter.png",
  },
  {
    name: "Cristo nuestro Sanador",
    detail:
      "Creemos que Jesús tiene el poder de sanar nuestros cuerpos y almas. Oramos por sanidad, confiando en su voluntad soberana y su compasión.",
    verse:
      "Una oración ofrecida con fe sanará al enfermo, y el Señor hará que se recupere; y si ha cometido pecados, será perdonado.",
    citation: "Santiago 5:15",
    image: "/conocenos/que-creemos/healer-prayer.png",
  },
  {
    name: "Cristo nuestro Rey que Viene",
    detail:
      "Creemos que Jesús regresará en poder y gloria para juzgar al mundo y consumar su reino eterno. Esta es nuestra bendita esperanza.",
    verse:
      "Y ustedes verán al Hijo del Hombre sentado en el lugar de poder, a la derecha de Dios, y viniendo en las nubes del cielo.",
    citation: "Marcos 14:62",
    image: "/conocenos/que-creemos/coming-king-sky.png",
  },
];

const missionVision = [
  {
    name: "Nuestra Misión",
    detail:
      "Ser una familia de convicciones firmes en Cristo que comparten su fe con otros.",
    index: "01",
  },
  {
    name: "Nuestra Visión",
    detail: [
      "Ser apasionados por Dios",
      "Vivir en una comunidad auténtica",
      "Ser discípulos que hacen discípulos",
      "Servir a otros con nuestros dones",
      "Proclamar el Evangelio con urgencia",
    ],
    index: "02",
  },
];

const coreValues = [
  {
    name: "Nuestros Valores",
    subtitle: "Esencia de familia",
    detail: [
      "Excelencia",
      "Amigables",
      "Enseñables",
      "Serviciales",
      "Relevantes y pertinentes",
    ],
    icon: Heart,
    index: "03",
  },
  {
    name: "Nuestros Medibles",
    subtitle: "Vidas transformadas",
    detail: [
      { text: "Ser Miembro", sub: "Que esté dispuesto" },
      { text: "Ser Ministro", sub: "Que sea comprometido" },
      {
        text: "Ser Misionero",
        sub: "Que proclama las buenas nuevas con su vocación",
      },
    ],
    icon: TrendingUp,
    index: "04",
  },
  {
    name: "Nuestra Estrategia",
    subtitle: "Pasos intencionales",
    detail: [
      { text: "Proclamar las Buenas Nuevas", sub: "Conexión" },
      { text: "Vivir y Crecer en Comunidad", sub: "Crecimiento" },
      { text: "Agradar a Dios en Todo", sub: "Compromiso" },
    ],
    icon: Map,
    index: "05",
  },
];

export function QueCreemosClient() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <div className={cn(contentSection, "bg-gray-50/50 pt-12 pb-24 space-y-20")}>
      {/* Misión y Visión Section */}
      <section className="max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-6 mb-16 px-4">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 whitespace-nowrap">
            Misión y Visión
          </h2>
          <div className="h-1.5 bg-[var(--puembo-green)]/20 grow rounded-full" />
          <div className="h-1.5 w-12 bg-[var(--puembo-green)] rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {missionVision.map((item, index) => (
            <motion.div
              key={item.name}
              {...fadeIn}
              transition={{ ...fadeIn.transition, delay: index * 0.2 }}
              className="relative group h-full"
            >
              <Card className="h-full border-none shadow-xl bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-xl">
                <CardContent className="p-10 relative">
                  {/* Número decorativo */}
                  <span className="absolute top-4 right-6 text-7xl font-black text-gray-50 select-none group-hover:text-green-50 transition-colors duration-500">
                    {item.index}
                  </span>

                  <div className="relative z-10">
                    <div className="h-1.5 w-10 bg-[var(--puembo-green)] mb-6 rounded-full" />
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8 tracking-tight">
                      {item.name}
                    </h2>

                    {Array.isArray(item.detail) ? (
                      <ul className="space-y-4">
                        {item.detail.map((li, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-4 group/item text-sm md:text-base"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-[var(--puembo-green)] group-hover/item:scale-150 transition-transform shrink-0" />
                            <span
                              className={cn(
                                sectionText,
                                "text-gray-600 font-medium"
                              )}
                            >
                              {li}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p
                        className={cn(
                          sectionText,
                          "text-lg text-gray-600 leading-relaxed italic"
                        )}
                      >
                        "{item.detail}"
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Valores, Medibles y Estrategia Section (KEEPING PREMIUM STYLE) */}
      <section className="max-w-7xl mx-auto w-full px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {coreValues.map((value, index) => (
            <motion.div
              key={value.name}
              {...fadeIn}
              transition={{ delay: index * 0.15 }}
              className="group relative"
            >
              <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] border border-gray-50 hover:border-[var(--puembo-green)]/20 transition-all duration-700 h-full flex flex-col space-y-8">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-[var(--puembo-green)] group-hover:bg-[var(--puembo-green)] group-hover:text-white transition-all duration-700">
                    <value.icon className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <span className="text-4xl font-black text-gray-50 group-hover:text-green-50 transition-colors duration-700 select-none">
                    {value.index}
                  </span>
                </div>

                <div className="space-y-4 grow">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--puembo-green)] opacity-70">
                      {value.subtitle}
                    </p>
                    <h3 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
                      {value.name}
                    </h3>
                  </div>
                  {Array.isArray(value.detail) ? (
                    <ul className="space-y-3">
                      {value.detail.map((li, i) => {
                        const isObject = typeof li === "object" && li !== null;
                        return (
                          <li
                            key={i}
                            className="flex items-start gap-3 group/item"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-[var(--puembo-green)] group-hover/item:scale-150 transition-transform shrink-0 mt-2.5" />
                            <div className="flex flex-col">
                              <span className="text-gray-500 text-base md:text-lg leading-relaxed font-light">
                                {isObject ? li.text : li}
                              </span>
                              {isObject && li.sub && (
                                <span className="text-xs md:text-sm text-gray-400 font-medium">
                                  {li.sub}
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-base md:text-lg leading-relaxed font-light">
                      {value.detail}
                    </p>
                  )}
                </div>

                <div className="h-1 w-10 bg-gray-100 group-hover:w-full group-hover:bg-[var(--puembo-green)]/20 transition-all duration-700 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Declaración Section (Full Width Accent inside container) */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-(--puembo-green) text-white overflow-hidden relative rounded-3xl shadow-2xl mx-auto max-w-6xl"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>
        <div className="container mx-auto px-8 py-16 text-center relative z-10">
          <motion.h2
            {...fadeIn}
            className={cn(sectionTitle, "mb-6 text-white text-2xl md:text-3xl")}
          >
            Parte de un Movimiento Mayor
          </motion.h2>
          <motion.p
            {...fadeIn}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg max-w-3xl mx-auto leading-relaxed text-green-50 font-medium italic"
          >
            "Formamos parte de la Alianza Cristiana y Misionera, un movimiento
            enfocado en vivir y proclamar el evangelio de Jesucristo al mundo,
            con una vida centrada en Él y una misión clara hacia las naciones."
          </motion.p>
        </div>
      </motion.section>

      {/* Lo que Creemos Section */}
      <section className="max-w-7xl mx-auto w-full">
        {/* Separador Visual idéntico al de Equipo */}
        <div className="flex items-center gap-6 mb-16 px-4">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 whitespace-nowrap">
            Lo que Creemos
          </h2>
          <div className="h-1.5 bg-[var(--puembo-green)]/20 grow rounded-full" />
          <div className="h-1.5 w-12 bg-[var(--puembo-green)] rounded-full" />
        </div>

        <div className="space-y-0">
          {beliefs.map((belief, index) => (
            <motion.div
              key={belief.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <BeliefBlock belief={belief} index={index} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
