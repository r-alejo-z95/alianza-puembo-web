"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

const blancIcons = [
  { src: "/the-four/The Four_Corazon_Blanco.png", alt: "Dios me ama" },
  { src: "/the-four/The Four_Division_Blanco.png", alt: "Vivo separado de Dios" },
  { src: "/the-four/The Four_Cruz_Blanco.png", alt: "Jesús murió por mí" },
  { src: "/the-four/The Four_Pregunta_Blanco.png", alt: "¿Elegiré seguir a Jesús?" },
];

const truths = [
  {
    verdeUrl: "/the-four/The Four_Corazon_Verde.png",
    blancoUrl: "/the-four/The Four_Corazon_Blanco.png",
    alt: "Dios me ama",
    title: "Dios me ama",
    description: "Dios te ama incondicionalmente. Te conoce y quiere estar cerca de ti.",
  },
  {
    verdeUrl: "/the-four/The Four_Division_Verde.png",
    blancoUrl: "/the-four/The Four_Division_Blanco.png",
    alt: "Vivo separado de Dios",
    title: "Vivo separado de Dios",
    description: "Por naturaleza nos alejamos de Dios, creando una separación que afecta nuestra vida.",
  },
  {
    verdeUrl: "/the-four/The Four_Cruz_Verde.png",
    blancoUrl: "/the-four/The Four_Cruz_Blanco.png",
    alt: "Jesús murió por mí",
    title: "Jesús murió por mí",
    description: "Jesucristo murió en la Cruz en nuestro lugar y resucitó, restaurando nuestra relación con Dios.",
  },
  {
    verdeUrl: "/the-four/The Four_Pregunta_Verde.png",
    blancoUrl: "/the-four/The Four_Pregunta_Blanco.png",
    alt: "¿Elegiré seguir a Jesús?",
    title: "¿Elegiré seguir a Jesús?",
    description: "A través de la fe podemos aceptar el regalo de Dios y comenzar una relación personal con Él.",
  },
];

export default function TheFourPage() {
  return (
    <main className="relative bg-black min-h-screen">
      {/* Hero: same icon layout as homepage TheFour section */}
      <div className="relative w-full h-[60vh] md:h-[80vh] flex flex-col overflow-hidden bg-[var(--puembo-green)]">
        {/* Desktop: 4 icons spanning full width */}
        <div className="absolute inset-0 hidden md:flex">
          {blancIcons.map((icon) => (
            <div key={icon.alt} className="relative flex-1 h-full">
              <Image
                src={icon.src}
                alt={icon.alt}
                fill
                className="object-contain p-8 lg:p-12 opacity-85"
              />
            </div>
          ))}
        </div>
        {/* Mobile: 2×2 grid */}
        <div className="absolute inset-0 md:hidden grid grid-cols-2">
          {blancIcons.map((icon) => (
            <div key={icon.alt} className="relative">
              <Image
                src={icon.src}
                alt={icon.alt}
                fill
                className="object-contain p-5 opacity-85"
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-10" />

        <div className="relative z-20 w-full h-full flex flex-col justify-center items-center px-5 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6 md:space-y-8 w-full max-w-5xl"
          >
            <div className="flex items-center justify-center gap-4 md:gap-6 mb-2">
              <div className="h-px w-8 md:w-16 bg-white opacity-40" />
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-white opacity-70">
                Alianza Puembo
              </span>
              <div className="h-px w-8 md:w-16 bg-white opacity-40" />
            </div>
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight tracking-tight drop-shadow-xl px-2">
              The Four
            </h1>
            <p className="text-base md:text-xl text-gray-100 font-light max-w-3xl mx-auto leading-relaxed italic opacity-90 px-4">
              Cuatro verdades para compartir tu fe.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content section */}
      <div className="relative z-20 bg-white shadow-[0_-50px_100px_rgba(0,0,0,0.15)] rounded-t-[2rem] md:rounded-t-[5rem]">
        <div className="pt-12 pb-20 md:pt-20 md:pb-32">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <MinistryNavigation
              hierarchy={[
                { name: "Servicio", href: "/ministerios/servicio" },
                { name: "Conexión", href: "/ministerios/conexion" },
                { name: "Redes de Amor", href: "/ministerios/redes-de-amor" },
                { name: "Pescadores", href: "/ministerios/pescadores" },
              ]}
              current="The Four"
              backLink="/ministerios/pescadores"
              backLabel="Volver a Pescadores"
            />

            {/* Section title */}
            <div className="flex items-center gap-4 md:gap-6 px-2 md:px-4 py-8 md:py-16">
              <h2 className="text-lg md:text-3xl font-serif font-bold text-gray-900 whitespace-nowrap">
                Las Cuatro Verdades
              </h2>
              <div className="h-1 bg-[var(--puembo-green)]/20 grow rounded-full" />
              <div className="h-1 w-8 md:w-10 bg-[var(--puembo-green)] rounded-full" />
            </div>

            {/* Truth items */}
            <div className="space-y-16 md:space-y-24">
              {truths.map((truth, index) => {
                const isReversed = index % 2 !== 0;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${isReversed ? "lg:flex-row-reverse" : ""}`}
                  >
                    {/* Icon with hover effect */}
                    <div className="w-full lg:w-[45%] relative group px-2 md:px-0">
                      <div className="relative aspect-square max-w-xs mx-auto lg:max-w-sm rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-xl z-10 bg-white">
                        <Image
                          src={truth.verdeUrl}
                          alt={truth.alt}
                          fill
                          sizes="(max-width: 1024px) 50vw, 30vw"
                          className="object-contain p-8 md:p-12 transition-transform duration-[400ms] group-hover:scale-110"
                        />
                      </div>
                    </div>

                    {/* Text */}
                    <div className={`w-full lg:w-[55%] space-y-4 md:space-y-6 px-4 md:px-0 ${isReversed ? "lg:text-right" : "lg:text-left"}`}>
                      <div className="space-y-2">
                        <div className={`flex items-center gap-3 ${isReversed ? "justify-end" : ""}`}>
                          <span className="text-[9px] font-black text-[var(--puembo-green)] tracking-[0.3em] md:tracking-[0.4em] opacity-50">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div className="h-px w-4 md:w-6 bg-[var(--puembo-green)]/20" />
                        </div>
                        <h3 className="text-xl md:text-3xl lg:text-4xl font-serif font-bold text-gray-900 leading-tight">
                          {truth.title}
                        </h3>
                      </div>
                      <p className="text-sm md:text-base lg:text-lg text-gray-500 leading-relaxed font-light max-w-xl">
                        {truth.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
