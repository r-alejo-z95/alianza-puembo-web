import { Button } from "./ui/button";
import {
  btnStyles,
  sectionPx,
  secondaryTextSizes,
  subTitleSizes,
} from "@/lib/styles";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Info() {
  return (
    <section
      className={cn(
        sectionPx,
        "w-full h-[50%] py-16 text-(--puembo-black) overflow-hidden"
      )}
    >
      <div className="flex flex-col-reverse md:flex-row items-center gap-8 lg:gap-12">
        <div className="flex flex-col gap-6 flex-1">
          <h2 className={cn(subTitleSizes, "font-merriweather font-bold")}>
            Somos una familia con convicciones firmes en Cristo
          </h2>
          <p className={cn(secondaryTextSizes)}>
            Compartimos nuestra fe con amor y queremos que formes parte de
            nuestra casa.
          </p>
          <div className="flex flex-col md:flex-row gap-4 lg:gap-6 2xl:gap-8 mt-4">
            <Button className={btnStyles}>Noticias</Button>
            <Button variant="outline" className={btnStyles}>
              Calendario de eventos
            </Button>
          </div>
        </div>
        <div className="relative max-w-full w-full md:w-[300px] lg:w-[500px] xl:w-[700px] 2xl:w-[900px] 3xl:w-[1100px] 4xl:w-[1300px] 5xl:w-[1500px] aspect-[3/2] rounded-lg overflow-hidden flex-shrink-0">
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
