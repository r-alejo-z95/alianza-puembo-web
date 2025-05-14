import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  btnStyles,
  sectionPx,
  mainTitleSizes,
  secondaryTextSizes,
} from "@/lib/styles";

export default function Hero() {
  return (
    <section className="relative w-full h-screen bg-[url('/Hero.gif')] bg-cover bg-top bg-no-repeat">
      <div
        className={cn(
          sectionPx,
          "w-full h-full flex flex-col justify-center items-start text-primary-foreground backdrop-brightness-80 backdrop-contrast-70 gap-4"
        )}
      >
        <div className="flex flex-col gap-2 mb-4">
          <h2 className={cn(secondaryTextSizes)}>
            Experimenta la presencia de Dios en casa
          </h2>
          <h1 className={cn(mainTitleSizes, "font-merriweather font-bold")}>
            Bienvenido
          </h1>
        </div>
        <div className="flex flex-col md:flex-row gap-4 lg:gap-6 2xl:gap-8">
          <Button className={btnStyles}>Visítanos</Button>
          <Button className={btnStyles}>Servicio On-line</Button>
        </div>
      </div>
    </section>
  );
}
