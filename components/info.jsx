import { Button } from "./ui/button";
import { landingPageBtnStyles } from "@/lib/styles";
import Image from "next/image";

export default function Info() {
  return (
    <section className="w-full h-full flex flex-col items-left justify-center text-(--puembo-black) px-13 gap-8 my-4">
      <p className="text-2xl md:text-5xl lg:text-6xl">
        Somos una familia con convicciones firmes en Cristo, que comparte su Fe
        con otros.
      </p>
      <div className="flex flex-row gap-4">
        <div className="flex flex-col gap-4">
          <p className="font-merriweather text-lg md:text-2xl lg:text-4xl font-bold">
            Somos una familia con convicciones firmes en Cristo, que comparte su
            Fe con otros.
          </p>
          <p className="text-sm md:text-lg lg:text-xl">
            Somos una familia con convicciones firmes en Cristo, que comparte su
            Fe con otros.
          </p>
        </div>
        <Image
          src="/info-section.jpg"
          alt="Mujer abrazando a otra"
          width={3600}
          height={2403}
          className="flex-shrink-0 w-0 md:w-[360px] lg:w-[480px] rounded-md"
        />
      </div>
      <div className="flex flex-col max-w-screen md:flex-row gap-4 lg:gap-8">
        <Button className={landingPageBtnStyles}>Noticias</Button>
        <Button variant="outline" className={landingPageBtnStyles}>
          Calendario de eventos
        </Button>
      </div>
    </section>
  );
}
