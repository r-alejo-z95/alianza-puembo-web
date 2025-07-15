import Image from "next/image";
import { cn } from "@/lib/utils.ts";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";

export function MissionDignityIntroSection() {
  return (
    <section className={cn(contentSection, "bg-white flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16")}>
      <div className="md:w-1/2">
        <h2 className={cn(sectionTitle, "text-center md:text-left mb-4")}>
          Amor en Acción, Esperanza en Comunidad
        </h2>
        <p className={cn(sectionText, "text-center md:text-left mb-6")}>
          Misión Dignidad es el brazo social de Alianza Puembo, dedicado a extender el amor de Cristo a los más necesitados. Creemos que la fe se demuestra a través de obras de servicio y compasión, impactando positivamente a nuestra comunidad.
        </p>
        <p className={cn(sectionText, "text-center md:text-left")}>
          Trabajamos en proyectos que abordan diversas necesidades, desde la alimentación y el vestuario hasta el apoyo educativo y emocional. ¡Únete a nosotros y sé parte de la transformación!
        </p>
      </div>
      <div className="md:w-1/2 relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
        <Image
          src="/placeholder/mission-dignity-intro.jpg"
          alt="Personas ayudando en un comedor social"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}