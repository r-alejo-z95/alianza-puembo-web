import { Button } from "./ui/button";
import { landingPageBtnStyles } from "@/lib/styles";
import Image from "next/image";

export default function Info() {
  return (
    <section className="w-full py-16 px-4 md:px-6 lg:px-8 text-(--puembo-black)">
      <div className="flex flex-col-reverse md:flex-row items-center gap-8 max-w-screen-xl mx-auto">
        <div className="flex flex-col gap-4 flex-1">
          <h2 className="font-merriweather text-2xl md:text-4xl lg:text-5xl font-bold">
            Somos una familia con convicciones firmes en Cristo
          </h2>
          <p className="text-base md:text-lg lg:text-xl">
            Compartimos nuestra fe con amor y queremos que formes parte de ella.
          </p>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Button className={landingPageBtnStyles}>Noticias</Button>
            <Button variant="outline" className={landingPageBtnStyles}>
              Calendario de eventos
            </Button>
          </div>
        </div>
        <div className="relative w-full md:w-[300px] lg:w-[480px] aspect-[3/2] rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src="/info-section.jpg"
            alt="Mujer abrazando a otra"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
