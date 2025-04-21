import { Button } from "./ui/button";
import { landingPageBtnStyles } from "@/lib/styles";

export default function Grupos() {
  return (
    <section className="w-full h-screen flex flex-col text-white bg-(--puembo-black) px-13">
      <div className="relative w-[350px] h-[350px] md:w-[450px] md:h-[450px] lg:w-[600px] lg:h-[600px] mx-auto my-auto bg-[url('/info-section.jpg')] bg-cover bg-center rounded-full" />
      <div className="absolute h-full flex flex-col">
        <p className="font-merriweather text-xl md:text-3xl lg:text-5xl my-auto">
          Grupos Pequeños
        </p>
        <p className="text-3xl md:text-6xl lg:text-7xl my-auto">
          Hay un lugar para ti en nuestra casa
        </p>
        <div className="max-w-screen my-auto">
          <Button variant="outline" className={landingPageBtnStyles}>
            Conecta con un Grupo Pequeño
          </Button>
        </div>
      </div>
    </section>
  );
}
