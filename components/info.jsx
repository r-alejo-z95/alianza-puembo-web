import { Button } from "./ui/button";
import { landingPageBtnStyles } from "@/lib/styles";
import Image from "next/image";

export default function Info() {
  return (
    <section className="w-full h-full flex flex-col items-left justify-center text-(--puembo-black) px-13 gap-8 my-8">
      <p className="text-2xl md:text-5xl lg:text-6xl">
        Somos una familia con convicciones firmes en Cristo, que comparte su Fe
        con otros.
      </p>
      <div className="flex flex-row gap-4">
        <div className="flex flex-col gap-4 justify-end">
          <p className="font-merriweather text-lg md:text-2xl lg:text-4xl font-bold">
            Somos una familia con convicciones firmes en Cristo, que comparte su
            Fe con otros.
          </p>
          <p className="text-sm md:text-lg lg:text-xl">
            Somos una familia con convicciones firmes en Cristo, que comparte su
            Fe con otros.
          </p>
          <div className="flex flex-col max-w-screen md:flex-row gap-4 lg:gap-8 mt-4">
            <Button className={landingPageBtnStyles}>Noticias</Button>
            <Button variant="outline" className={landingPageBtnStyles}>
              Calendario de eventos
            </Button>
          </div>
        </div>
        <div className="relative flex-shrink-0 w-0 md:w-[300px] lg:w-[480px] aspect-[3/2]">
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
