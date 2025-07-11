import { cn } from "@/lib/utils";
import { contentSection, sectionTitle, sectionText } from "@/lib/styles";

export function DonationIntroSection() {
  return (
    <section className={cn(contentSection, "bg-yellow-100 py-16 md:py-24 text-center")}>
      <h2 className={cn(sectionTitle, "mb-8")}>
        Apoya Nuestra Misión
      </h2>
      <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
        Tu generosidad es fundamental para que podamos seguir extendiendo el mensaje de esperanza y amor. Cada ofrenda y diezmo nos permite continuar con nuestra labor en la comunidad y más allá.
      </p>
    </section>
  );
}