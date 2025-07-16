import Image from "next/image";
import { cn } from "@/lib/utils.ts";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";

export function PuemboKidsIntroSection() {
  return (
    <section className={cn(contentSection, "bg-white flex flex-col md:flex-row items-center gap-8 md:gap-16")}>
      <div className="md:w-1/2">
        <h2 className={cn(sectionTitle, "text-center md:text-left mb-4")}>
          Diversión y Aprendizaje para los Más Pequeños
        </h2>
        <p className={cn(sectionText, "text-center md:text-left mb-6")}>
          Puembo Kids es un ministerio vibrante y seguro diseñado para que los niños de todas las edades aprendan sobre Jesús de una manera divertida y relevante. Creemos en la importancia de sembrar la semilla de la fe desde la infancia.
        </p>
        <p className={cn(sectionText, "text-center md:text-left")}>
          A través de juegos, historias bíblicas, música y actividades creativas, buscamos ayudarles a crecer en su relación con Dios y a desarrollar valores cristianos. ¡Tus hijos amarán ser parte de Puembo Kids!
        </p>
      </div>
      <div className="md:w-1/2 relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
        <Image
          src="/ministerios/puembo-kids/puembo-kids-intro.jpg"
          alt="Niños jugando y aprendiendo"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}