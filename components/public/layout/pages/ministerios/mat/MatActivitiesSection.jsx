import Image from "next/image";
import { cn } from "@/lib/utils.ts";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";

export function MatActivitiesSection() {
  return (
    <section className={cn(contentSection, "bg-gray-100 py-16 md:py-24")}>
      <h2 className={cn(sectionTitle, "text-center mb-12")}>
        Áreas de Servicio
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src="/ministerios/mat/mat-activity-1.jpg"
              alt="Música y Canto"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Música y Canto</h3>
          <p className={sectionText}>Equipos de alabanza que lideran la congregación en la adoración a través de la música.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src="/ministerios/mat/mat-activity-2.jpg"
              alt="Producción Audiovisual"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Producción Audiovisual</h3>
          <p className={sectionText}>Creación de contenido visual, videos y transmisiones en vivo para alcanzar a más personas.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src="/ministerios/mat/mat-activity-3.jpg"
              alt="Teatro"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Teatro</h3>
          <p className={sectionText}>Producción de obras de teatro para eventos especiales en la iglesia.</p>
        </div>
      </div>
    </section>
  );
}