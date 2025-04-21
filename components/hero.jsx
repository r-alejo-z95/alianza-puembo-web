import { Button } from "./ui/button";
import { landingPageBtnStyles } from "@/lib/styles";

export default function Hero() {
  return (
    <section
      className="relative w-full h-screen bg-cover bg-top bg-no-repeat"
      style={{ backgroundImage: "url('/Hero.jpg')" }}
    >
      <div className="w-full h-full flex flex-col justify-center items-start text-white backdrop-brightness-80 backdrop-contrast-70 px-4 md:px-6 lg:px-8 gap-6">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-base md:text-xl lg:text-2xl">
            Experimenta la presencia de Dios en casa
          </h2>
          <h1 className="font-merriweather text-4xl md:text-7xl lg:text-8xl font-bold">
            Bienvenido
          </h1>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <Button className={landingPageBtnStyles}>Visítanos</Button>
          <Button className={landingPageBtnStyles}>Servicio On-line</Button>
        </div>
      </div>
    </section>
  );
}
