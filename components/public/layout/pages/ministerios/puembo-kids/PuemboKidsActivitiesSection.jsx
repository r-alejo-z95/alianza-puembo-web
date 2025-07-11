import Image from "next/image";
import { cn } from "@/lib/utils";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";

export function PuemboKidsActivitiesSection() {
  return (
    <section className={cn(contentSection, "bg-gray-100 py-16 md:py-24")}>
      <h2 className={cn(sectionTitle, "text-center mb-12")}>
        Nuestras Actividades
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src="/placeholder/puembo-kids-activity-1.jpg"
              alt="Clases Bíblicas"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Clases Bíblicas</h3>
          <p className={sectionText}>Enseñanza de la Palabra de Dios adaptada a cada edad, con dinámicas y juegos.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src="/placeholder/puembo-kids-activity-2.jpg"
              alt="Juegos y Recreación"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Juegos y Recreación</h3>
          <p className={sectionText}>Actividades lúdicas que fomentan la amistad, el trabajo en equipo y el desarrollo integral.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src="/placeholder/puembo-kids-activity-3.jpg"
              alt="Eventos Especiales"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Eventos Especiales</h3>
          <p className={sectionText}>Celebraciones, campamentos y salidas diseñadas para crear recuerdos inolvidables.</p>
        </div>
      </div>
    </section>
  );
}