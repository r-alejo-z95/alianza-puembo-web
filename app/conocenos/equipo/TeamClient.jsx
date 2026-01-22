"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { sectionTitle, contentSection } from "@/lib/styles";
import { cn } from "@/lib/utils.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TEAM_MEMBERS = [
  {
    name: "Ps. Leandro Gaitán",
    detail: "Co-Pastor",
    image: "/conocenos/equipo/familia-leandro.avif",
    bio: "El Pastor Leandro Gaitán, junto a su esposa Cris, son los encargados de abrazar a la Iglesia a través del área de Cuidado Pastoral, donde están todos nuestros niños, jóvenes y adultos.",
  },
  {
    name: "Iván Echeverría",
    detail: "Administrador",
    image: "/conocenos/equipo/familia-ivan.avif",
    bio: "Iván se encarga las operaciones administrativas y financieras de nuestra Iglesia, asegurando que todo funcione sin problemas para apoyar nuestra misión y visión.",
  },
  {
    name: "Anabel García",
    detail: "Coordinadora Ministerial Conexión",
    image: "/conocenos/equipo/familia-anabel.avif",
    bio: "Anabel coordina los Ministerios de Conexión, construyendo un puente entre la Iglesia y la comunidad a través de iniciativas de servicio, ayuda social y evangelismo.",
  },
  {
    name: "Fabiola Diaz",
    detail: "Coordinadora Ministerios de Apoyo (MDA)",
    image: "/conocenos/equipo/familia-papo.avif",
    bio: "Fabiola (Papo) es la sonrisa y el abrazo de nuestra Iglesia. Ella coordina los Ministerios de Apoyo, asegurando que cada miembro y visitante se sienta cómodo y bienvenido.",
  },
  {
    name: "Daniela Riofrío",
    detail: "Coordinadora Ministerial Jóvenes",
    image: "/conocenos/equipo/familia-dani-r.avif",
    bio: "Daniela y Cristian lideran a la nueva generación, inspirándoles a vivir una fe auténtica y equipándoles para impactar su entorno.",
  },
  {
    name: "Daniela Andrade",
    detail: "Coordinadora Ministerial Puembo Kids",
    image: "/conocenos/equipo/familia-dani-a.avif",
    bio: "Daniela, junto a su equipo, guían y enseñan a los niños los principios bíblicos de una manera divertida, creativa y relevante.",
  },
  {
    name: "Mateo Olivo",
    detail: "Coordinador Ministerios MAT",
    image: "/conocenos/equipo/familia-mate.jpg",
    bio: "Mateo lidera los Ministerios de Música, Artes y Tecnología, apoyado de un gran equipo que guía a la congregación a tener un encuentro con Dios a través del arte y la cultura.",
  },
  {
    name: "Alejandro Zambrano",
    detail: "Coordinador MAT Tecnología",
    image: "/conocenos/equipo/familia-alejo.jpg",
    bio: "Alejandro coordina los Ministerios de Sonido, Multimedia, Iluminación, Transmisión y Producción, utilizando la tecnología como herramienta para el Evangelio.",
  },
  {
    name: "Andrea Quiroga",
    detail: "Coordinadora de Comunicaciones",
    image: "/conocenos/equipo/familia-andre.jpg",
    bio: "Andrea gestiona la comunicación y diseño, asegurando que el mensaje de la Iglesia Alianza Puembo llegue de manera clara y creativa.",
  },
];

const MemberCard = ({ member, index, prominent = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -5 }}
    className="h-full"
  >
    <Card
      className={cn(
        "flex flex-col h-full transition-all duration-300 hover:shadow-2xl border-none bg-white overflow-hidden group rounded-xl",
        prominent
          ? "max-w-2xl mx-auto ring-1 ring-black/5 shadow-xl"
          : "max-w-md mx-auto shadow-lg"
      )}
    >
      <div className={cn("relative w-full aspect-[3/2] overflow-hidden")}>
        <Image
          src={member.image}
          alt={member.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority={prominent}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <CardContent className="flex flex-col gap-2 p-6 text-center grow bg-white">
        <div>
          <CardTitle
            className={cn(
              sectionTitle,
              "text-gray-900",
              prominent ? "text-2xl md:text-3xl" : "text-xl"
            )}
          >
            {member.name}
          </CardTitle>
          <CardDescription className="text-[var(--puembo-green)] font-semibold tracking-wide uppercase text-xs mt-1">
            {member.detail}
          </CardDescription>
        </div>
        <p
          className={cn(
            "text-gray-600 mt-2 leading-relaxed italic",
            prominent ? "text-base md:text-lg" : "text-sm"
          )}
        >
          "{member.bio}"
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

export function TeamClient() {
  const leadPastor = {
    name: "Ps. Gio Martinez",
    detail: "Pastor Principal",
    image: "/conocenos/equipo/familia-gio.avif",
    bio: "El Pastor Gio Martinez, junto a su esposa Cris, lideran con pasión el ministerio de la Iglesia Alianza Puembo, guiándola a ser una familia de familias que crece con bases sólidas en la Palabra de Dios, guiados por el Espíritu Santo, y caminando hacia una Iglesia que comparte su Fe con otros.",
  };

  return (
    <div className={cn(contentSection, "bg-gray-50/50 pt-12 pb-24 space-y-20")}>
      {/* Pastor Principal */}
      <div className="w-full">
        <MemberCard member={leadPastor} index={0} prominent={true} />
      </div>

      {/* Equipo Section */}
      <section className="max-w-7xl mx-auto w-full">
        {/* Separador Visual */}
        <div className="flex items-center gap-6 mb-16 px-4">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 whitespace-nowrap">
            Equipo Ministerial
          </h2>
          <div className="h-1.5 bg-[var(--puembo-green)]/20 grow rounded-full" />
          <div className="h-1.5 w-12 bg-[var(--puembo-green)] rounded-full" />
        </div>

        {/* Grid de Equipo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full mx-auto px-4">
          {TEAM_MEMBERS.map((member, index) => (
            <MemberCard key={member.name} member={member} index={index + 1} />
          ))}
        </div>
      </section>
    </div>
  );
}
