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
    bio: "El Pastor Leandro Gaitán, junto a su esposa, lidera con pasión el ministerio de Alianza Puembo, enfocándose en la enseñanza bíblica y el discipulado.",
  },
  {
    name: "Iván Echeverría",
    detail: "Administrador",
    image: "/conocenos/equipo/familia-ivan.avif",
    bio: "Iván es el pilar administrativo de la iglesia, asegurando que todos los recursos se gestionen eficientemente para el cumplimiento de la misión.",
  },
  {
    name: "Anabel García",
    detail: "Coordinadora Ministerial Puentes",
    image: "/conocenos/equipo/familia-anabel.avif",
    bio: "Anabel coordina el Ministerio Puentes, conectando a la iglesia con la comunidad a través de iniciativas de servicio y evangelismo.",
  },
  {
    name: "Fabiola Diaz",
    detail: "Coordinadora Ministerios de Apoyo",
    image: "/conocenos/equipo/familia-papo.avif",
    bio: "Fabiola supervisa los Ministerios de Apoyo, asegurando que cada miembro de la iglesia encuentre un lugar para servir y crecer.",
  },
  {
    name: "Daniela Riofrío",
    detail: "Coordinadora Ministerial Jóvenes",
    image: "/conocenos/equipo/familia-dani-r.avif",
    bio: "Daniela lidera a la nueva generación, inspirándoles a vivir una fe auténtica y equipándoles para impactar su entorno.",
  },
  {
    name: "Daniela Andrade",
    detail: "Coordinadora Ministerial Puembo Kids",
    image: "/conocenos/equipo/familia-dani-a.avif",
    bio: "Daniela dedica su energía a enseñar a los niños los principios bíblicos de una manera divertida, creativa y relevante.",
  },
  {
    name: "Mateo Olivo",
    detail: "Coordinador de MAT",
    image: "/conocenos/equipo/familia-mate.jpg",
    bio: "Mateo lidera Música, Artes y Tecnología, coordinando la adoración para guiar a la iglesia a una experiencia profunda con Dios.",
  },
  {
    name: "Alejandro Zambrano",
    detail: "Coordinador MAT - Tecnología",
    image: "/conocenos/equipo/familia-alejo.jpg",
    bio: "Alejandro supervisa Sonido, Iluminación, Transmisión y Producción, utilizando la tecnología como herramienta para el Evangelio.",
  },
  {
    name: "Andrea Quiroga",
    detail: "Coordinadora de Comunicaciones",
    image: "/conocenos/equipo/familia-andre.jpg",
    bio: "Andrea gestiona la comunicación y diseño, asegurando que el mensaje de Alianza Puembo llegue de manera clara y creativa.",
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
        "flex flex-col h-full transition-all duration-300 hover:shadow-2xl border-none bg-white overflow-hidden group",
        prominent ? "max-w-2xl mx-auto ring-1 ring-black/5" : "max-w-md mx-auto"
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
              prominent && "text-2xl md:text-3xl"
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
    bio: "El Pastor Gio Martinez, junto a su esposa, lidera con pasión el ministerio de Alianza Puembo, enfocándose en la enseñanza bíblica y el discipulado. Su visión es edificar una comunidad fuerte en la fe y el servicio.",
  };

  return (
    <div className={cn(contentSection, "bg-gray-50/50 pt-12 pb-24")}>
      {/* Pastor Principal */}
      <div className="mb-20">
        <MemberCard member={leadPastor} index={0} prominent={true} />
      </div>

      {/* Separador Visual */}
      <div className="flex items-center gap-6 mb-16 max-w-7xl px-4">
        <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 whitespace-nowrap">
          Equipo Ministerial
        </h2>
        <div className="w-full border-b border-(--puembo-green)" />
      </div>

      {/* Grid de Equipo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-7xl mx-auto px-4">
        {TEAM_MEMBERS.map((member, index) => (
          <MemberCard key={member.name} member={member} index={index + 1} />
        ))}
      </div>
    </div>
  );
}
