import Image from "next/image";
import { cn } from "@/lib/utils";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";

export function MissionDignityProjectsSection() {
  return (
    <section className={cn(contentSection, "bg-gray-100 py-16 md:py-24")}>
      <h2 className={cn(sectionTitle, "text-center mb-12")}>
        Nuestros Proyectos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src="/placeholder/mission-dignity-project-1.jpg"
              alt="Comedores Comunitarios"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Comedores Comunitarios</h3>
          <p className={sectionText}>Proporcionamos alimentos nutritivos a familias y personas en situación de vulnerabilidad.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src="/placeholder/mission-dignity-project-2.jpg"
              alt="Donación de Ropa y Artículos"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Donación de Ropa y Artículos</h3>
          <p className={sectionText}>Recolección y distribución de ropa, calzado y artículos de primera necesidad.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src="/placeholder/mission-dignity-project-3.jpg"
              alt="Apoyo Educativo"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">Apoyo Educativo</h3>
          <p className={sectionText}>Programas de tutorías y entrega de útiles escolares para niños y jóvenes.</p>
        </div>
      </div>
    </section>
  );
}