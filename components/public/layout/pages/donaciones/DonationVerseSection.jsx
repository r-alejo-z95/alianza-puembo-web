import { cn } from "@/lib/utils";
import { contentSection, sectionText } from "@/lib/styles";

export function DonationVerseSection() {
  return (
    <section className={cn(contentSection, "bg-white py-16 md:py-24 text-center")}>
      <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
        Tu generosidad es fundamental para que podamos seguir extendiendo el Reino de Dios y sirviendo a nuestra comunidad. Cada ofrenda y diezmo nos permite sostener nuestros ministerios, proyectos sociales y la obra de la iglesia.
      </p>
      <div className="relative w-full max-w-4xl aspect-[16/9] rounded-lg overflow-hidden mb-12 mx-auto shadow-lg">
        <img src="/placeholder/donations-intro.jpg" alt="Personas dando donaciones" className="object-cover w-full h-full" />
      </div>
      <p className={cn(sectionText, "italic max-w-3xl mx-auto")}>
        &quot;Traigan íntegro el diezmo para los fondos del templo, y así habrá alimento en mi casa. Pruébenme en esto —dice el Señor Todopoderoso—, y vean si no abro las compuertas del cielo y derramo sobre ustedes bendición hasta que sobreabunde.&rdquo;
        <br />
        <span className="font-semibold">Malaquías 3:10</span>
      </p>
    </section>
  );
}