import Image from "next/image";
import { cn } from "@/lib/utils.ts";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";

export function MatIntroSection() {
  return (
    <section className={cn(contentSection, "bg-white flex flex-col md:flex-row items-center gap-8 md:gap-16")}>
      <div className="md:w-1/2">
        <h2 className={cn(sectionTitle, "text-center md:text-left mb-4")}>
          Adoración, Arte y Tecnología
        </h2>
        <p className={cn(sectionText, "text-center md:text-left mb-6")}>
          El Ministerio de Música, Artes y Tecnología (MAT) es un espacio donde la creatividad se une a la fe para glorificar a Dios. Creemos que el arte y la tecnología son herramientas poderosas para expresar nuestra adoración y comunicar el mensaje del evangelio.
        </p>
        <p className={cn(sectionText, "text-center md:text-left")}>
          Si tienes talentos en música, canto, teatro, producción audiovisual, sonido, iluminación o cualquier otra forma de expresión artística, te invitamos a unirte a nuestro equipo y servir con excelencia.
        </p>
      </div>
      <div className="md:w-1/2 relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
        <Image
          src="/ministerios/mat/mat-intro.jpg"
          alt="Personas adorando"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}