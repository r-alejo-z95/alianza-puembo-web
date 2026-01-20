"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { contentSection } from "@/lib/styles";
import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";

const ContactForm = dynamic(
  () => import("@/components/public/forms/ContactForm"),
  { ssr: false }
);

export function ContactClient() {
  const destinationLabel = "Iglesia Alianza Puembo";
  const encodedLabel = encodeURIComponent(destinationLabel);
  const fallbackWebUrl = `https://maps.app.goo.gl/nqvrncoX6JpGwAfN9`;

  const handleAddressClick = (e) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      e.preventDefault();
      const geoUrl = `geo:0,0?q=${encodedLabel}`;
      window.location.href = geoUrl;
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const contactInfo = [
    {
      title: "Correo Electrónico",
      value: "info@alianzapuembo.org",
      href: "mailto:info@alianzapuembo.org",
      icon: Mail,
    },
    {
      title: "Teléfono",
      value: "02 389 5952",
      href: "tel:023895952",
      icon: Phone,
    },
    {
      title: "Dirección",
      value: "Julio Tobar Donoso y 24 de Mayo, Puembo, Ecuador",
      href: fallbackWebUrl,
      icon: MapPin,
      onClick: handleAddressClick,
    },
  ];

  return (
    <div className={cn(contentSection, "bg-gray-50/50 pt-12 pb-24 space-y-24")}>
      {/* Tarjetas de Contacto */}
      <section className="max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-6 mb-16 px-4">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 whitespace-nowrap">
            Información de Contacto
          </h2>
          <div className="h-1.5 bg-[var(--puembo-green)]/20 grow rounded-full" />
          <div className="h-1.5 w-12 bg-[var(--puembo-green)] rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {contactInfo.map((item, index) => (
            <motion.div
              key={item.title}
              {...fadeIn}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-none shadow-lg bg-white hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden group">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-green-50 rounded-2xl text-[var(--puembo-green)] group-hover:bg-[var(--puembo-green)] group-hover:text-white transition-all duration-500">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    {item.title}
                  </h3>
                  <a
                    href={item.href}
                    onClick={item.onClick}
                    target={item.onClick ? "_blank" : undefined}
                    rel={item.onClick ? "noopener noreferrer" : undefined}
                    className="text-gray-600 font-medium hover:text-[var(--puembo-green)] transition-colors leading-relaxed"
                  >
                    {item.value}
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Formulario Section */}
      <section className="max-w-3xl mx-auto w-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="p-8 md:p-12 space-y-10">
            <div className="text-center space-y-4">
              <div className="inline-flex p-3 bg-green-50 rounded-2xl text-[var(--puembo-green)] mb-2">
                <Send className="w-6 h-6 fill-current" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
                Envíanos un Mensaje
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto text-base">
                ¿Tienes alguna duda o quieres saber más? Escríbenos y nuestro
                equipo te responderá lo antes posible.
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              <ContactForm />
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
