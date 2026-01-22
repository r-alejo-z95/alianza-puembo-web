"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils.ts";
import { contentSection, sectionText } from "@/lib/styles";

export function PrivacidadClient() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const sections = [
    {
      title: "1. Introducción",
      content:
        "En la Iglesia Alianza Puembo, valoramos tu privacidad y nos comprometemos a proteger tus datos personales. Esta política explica cómo recopilamos, usamos y protegemos la información que nos proporcionas a través de nuestro sitio web.",
    },
    {
      title: "2. Recopilación de Datos",
      content:
        "Recopilamos información cuando te registras en eventos, solicitas oración, realizas donaciones o te pones en contacto con nosotros. Los datos pueden incluir tu nombre, correo electrónico, número de teléfono y cualquier otra información que decidas compartir.",
    },
    {
      title: "3. Uso de la Información",
      content:
        "Utilizamos tu información para gestionar tu participación en actividades de la iglesia, responder a tus solicitudes, enviarte comunicaciones importantes y procesar donaciones de manera segura.",
    },
    {
      title: "4. Protección de Datos",
      content:
        "Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos contra acceso no autorizado, alteración o pérdida. Tus datos no son compartidos con terceros con fines comerciales.",
    },
    {
      title: "5. Tus Derechos",
      content:
        "Tienes derecho a acceder, corregir o solicitar la eliminación de tus datos personales en cualquier momento. Para ejercer estos derechos, puedes contactarnos a través de nuestra página de contacto.",
    },
    {
      title: "6. Cambios en esta Política",
      content:
        "Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. Te recomendamos revisarla periódicamente para estar informado sobre cómo protegemos tu información.",
    },
  ];

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <motion.div {...fadeIn} className="space-y-16">
          <header className="space-y-4 border-b border-gray-100 pb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
              Política de Privacidad
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
