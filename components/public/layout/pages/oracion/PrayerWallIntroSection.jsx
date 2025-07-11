import { cn } from "@/lib/utils";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";

export function PrayerWallIntroSection() {
  return (
    <section className={cn(contentSection, "bg-white py-16 md:py-24 text-center")}>
      <h2 className={cn(sectionTitle, "mb-8")}>
        Unidos en Oración
      </h2>
      <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
        En nuestro Muro de Oración, puedes compartir tus peticiones y unirte a la comunidad para orar por las necesidades de otros. Creemos firmemente en el poder transformador de la oración y en la importancia de apoyarnos mutuamente en fe.
      </p>
      <div className="relative w-full max-w-4xl aspect-[16/9] rounded-lg overflow-hidden mb-12 mx-auto shadow-lg">
        <img src="/placeholder/prayer-wall-intro.jpg" alt="Muro de Oración" className="object-cover w-full h-full" />
      </div>
    </section>
  );
}