import Image from "next/image";
import { cn } from "@/lib/utils.ts";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";

export function YouthActivitiesSection() {
  return (
    <section className={cn(contentSection, "bg-gray-100 py-16 md:py-24")}>
      <h2 className={cn(sectionTitle, "text-center text-white mb-12")}>
        Actividades y Eventos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src="/placeholder/youth-activity-1.jpg"
              alt="Estudio Bíblico"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Estudios Bíblicos</h3>
          <p className={sectionText}>Profundizamos en la Palabra de Dios de manera interactiva y relevante para tu vida diaria.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src="/placeholder/youth-activity-2.jpg"
              alt="Noches de Adoración"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Noches de Adoración</h3>
          <p className={sectionText}>Momentos especiales para conectar con Dios a través de la música y la alabanza.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src="/placeholder/youth-activity-3.jpg"
              alt="Eventos Sociales"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Eventos Sociales</h3>
          <p className={sectionText}>Actividades divertidas y recreativas para fortalecer la amistad y la comunidad.</p>
        </div>
      </div>
    </section>
  );
}