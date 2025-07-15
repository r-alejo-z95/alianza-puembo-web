import Image from "next/image";
import { cn } from "@/lib/utils.ts";
import { contentSection, sectionTitle, sectionText, notAvailableText } from "@/lib/styles";

export function NewsIntroSection() {
  return (
    <section className={cn(contentSection, "bg-white flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16")}>
      <div className="md:w-1/2">
        <h2 className={cn(sectionTitle, "text-center md:text-left mb-4")}>
          Mantente Informado
        </h2>
        <p className={cn(sectionText, "text-center md:text-left mb-6")}>
          Aquí encontrarás las últimas noticias, anuncios importantes y eventos destacados de Alianza Puembo. Nuestro objetivo es mantenerte conectado con todo lo que sucede en nuestra comunidad de fe.
        </p>
        <p className={cn(sectionText, "text-center md:text-left")}>
          Desde testimonios inspiradores hasta actualizaciones de proyectos y oportunidades de servicio, esta sección es tu fuente principal para estar al día. ¡No te pierdas nada!
        </p>
      </div>
      <div className="md:w-1/2 relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
        <Image
          src="/placeholder/news-intro.jpg"
          alt="Personas leyendo noticias"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}