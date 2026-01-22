"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils.ts";
import { contentSection, sectionText } from "@/lib/styles";

export function TerminosClient() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const sections = [
    {
      title: "1. Aceptación de los Términos",
      content:
        "Al acceder y utilizar el sitio web de la Iglesia Alianza Puembo, aceptas cumplir con estos términos de servicio. Si no estás de acuerdo con alguna parte de los mismos, te pedimos que no utilices nuestra plataforma.",
    },
    {
      title: "2. Uso del Sitio",
      content:
        "Este sitio web tiene como propósito proporcionar información sobre nuestras actividades, ministerios y recursos espirituales. El uso del contenido para fines ilícitos o no autorizados está estrictamente prohibido.",
    },
    {
      title: "3. Propiedad Intelectual",
      content:
        "Todo el contenido presente en este sitio, incluyendo textos, imágenes, logos y videos, es propiedad de la Iglesia Alianza Puembo o se utiliza con permiso. No se permite su reproducción sin consentimiento previo por escrito.",
    },
    {
      title: "4. Donaciones",
      content:
        "Las donaciones realizadas a través del sitio web son voluntarias y se destinan a apoyar los ministerios y la labor social de la iglesia. Las transacciones son procesadas a través de plataformas seguras.",
    },
    {
      title: "5. Enlaces a Terceros",
      content:
        "Nuestro sitio puede contener enlaces a sitios web de terceros. No somos responsables del contenido o las prácticas de privacidad de dichos sitios.",
    },
    {
      title: "6. Limitación de Responsabilidad",
      content:
        "La Iglesia Alianza Puembo no será responsable por daños directos o indirectos derivados del uso o la imposibilidad de uso de este sitio web.",
    },
  ];

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <motion.div {...fadeIn} className="space-y-16">
          <header className="space-y-4 border-b border-gray-100 pb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
              Términos de Servicio
            </h1>
            <p className="text-gray-500 font-light text-lg">
              Última actualización: 22 de enero de 2026
            </p>
          </header>

          <div className="space-y-12">
            {sections.map((section, index) => (
              <section key={index} className="space-y-4">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-gray-900 uppercase tracking-tight">
                  {section.title}
                </h2>
                <p className="text-gray-600 leading-relaxed font-light text-base md:text-lg">
                  {section.content}
                </p>
              </section>
            ))}
          </div>

          <footer className="pt-12 border-t border-gray-100 text-gray-400 text-sm italic">
            © {new Date().getFullYear()} Iglesia Alianza Puembo. Todos los derechos reservados.
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
