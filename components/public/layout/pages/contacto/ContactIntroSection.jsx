import { cn } from "@/lib/utils";
import { sectionTitle, sectionText } from "@/lib/styles";

export function ContactIntroSection() {
  return (
    <div className="bg-white text-gray-800 py-16 md:py-24">
      <div className="container mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-start md:items-start items-center md:justify-evenly gap-8 md:gap-4 lg:gap-0">
          <div className="flex-1 max-w-xl">
            <h2 className={cn(sectionTitle, "mb-4 text-sky-800 text-center")}>
              Conéctate con Nosotros
            </h2>
            <p className={sectionText}>
              Estamos aquí para escucharte y servirte. Ya sea que tengas preguntas, sugerencias o necesites apoyo, no dudes en contactarnos. Tu voz es importante para nosotros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}