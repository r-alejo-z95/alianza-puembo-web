import Image from "next/image";
import { cn } from "@/lib/utils.ts";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";

export function YouthIntroSection() {
  return (
    <section className={cn(contentSection, "bg-white flex flex-col md:flex-row items-center gap-8 md:gap-16")}>
      <div className="md:w-1/2">
        <h2 className={cn(sectionTitle, "text-center md:text-left mb-4")}>
          Conéctate, Crece, Impacta
        </h2>
        <p className={cn(sectionText, "text-center md:text-left mb-6")}>
          Nuestro Ministerio de Jóvenes es un espacio vibrante y dinámico diseñado para que los jóvenes exploren su fe, construyan relaciones significativas y descubran su propósito en Cristo. Creemos en el potencial de cada joven para transformar su entorno.
        </p>
        <p className={cn(sectionText, "text-center md:text-left")}>
          Ofrecemos actividades, estudios bíblicos relevantes y eventos diseñados para inspirar y equipar a la próxima generación de líderes. ¡Únete a nuestra comunidad y sé parte de algo grande!
        </p>
      </div>
      <div className="md:w-1/2 relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
        <Image
          src="/ministerios/jovenes/youth-intro.jpg"
          alt="Jóvenes interactuando en un evento"
          fill
          sizes="(max-width: 768px) 768px, (max-width: 1200px) 600px, 960px"
          className="object-cover"
        />
      </div>
    </section>
  );
}