import Image from 'next/image';
import { cn } from '@/lib/utils';
import { sectionTitle, sectionText, contentSection, notAvailableText } from "@/lib/styles";

export function UpcomingEventsIntroSection() {
  return (
    <section className={cn(contentSection, "bg-white flex flex-col md:flex-row items-center gap-8 md:gap-16")}>
      <div className="md:w-1/2">
        <h2 className={cn(sectionTitle, "text-center md:text-left mb-4")}>
          No te Pierdas Nada
        </h2>
        <p className={cn(sectionText, "text-center md:text-left mb-6")}>
          Mantente al tanto de los próximos eventos y actividades especiales en Alianza Puembo. Aquí encontrarás información detallada sobre cada evento, incluyendo fechas, horarios y cómo participar.
        </p>
        <p className={cn(sectionText, "text-center md:text-left")}>
          Desde servicios especiales hasta reuniones de grupos pequeños y eventos comunitarios, nuestro calendario te ayudará a planificar tu participación y a no perderte ninguna oportunidad de crecimiento y comunión.
        </p>
      </div>
      <div className="md:w-1/2 relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
        <Image
          src="/placeholder/upcoming-events-intro.jpg"
          alt="Personas en un evento de la iglesia"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}