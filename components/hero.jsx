import { Button } from "./ui/button";
import { landingPageBtnStyles } from "@/lib/styles";

export default function Hero() {
  return (
    <section
      className="relative w-full h-screen bg-cover bg-top bg-no-repeat z-0"
      style={{ backgroundImage: "url('/Hero.jpg')" }}
    >
      <div className="z-1 w-full h-full flex flex-col items-left justify-center text-white backdrop-brightness-80 backdrop-contrast-70 px-13 gap-4">
        <div className="flex flex-col gap-4 mb-4">
          <h2 className="text-sm md:text-xl lg:text-2xl">
            Experimenta la presencia de Dios en casa
          </h2>
          <h1 className="font-merriweather text-4xl md:text-7xl lg:text-8xl font-bold">
            Bienvenido
          </h1>
        </div>
        <div className="flex flex-col md:flex-row gap-4 lg:gap-8">
          <Button className={landingPageBtnStyles}>Visítanos</Button>
          <Button className={landingPageBtnStyles}>Servicio On-line</Button>
        </div>
      </div>
    </section>
  );
}
