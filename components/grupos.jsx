import { Button } from "./ui/button";
import { landingPageBtnStyles } from "@/lib/styles";

export default function Grupos() {
  return (
    <section className="w-full h-screen flex flex-col text-white bg-(--puembo-black) md:px-6 lg:px-8">
      <div className="relative w-full h-full md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] mx-auto my-auto bg-[url('/groups.jpg')] bg-cover bg-center md:rounded-full brightness-80 contrast-70" />
      <div className="absolute h-full flex flex-col">
        <h2 className="text-center font-merriweather text-2xl md:text-4xl lg:text-5xl font-bold my-auto">
          Grupos Pequeños
        </h2>
        <p className="text-center text-4xl md:text-7xl lg:text-8xl my-auto">
          Hay un lugar para ti en nuestra casa
        </p>
        <div className="max-w-screen my-auto mx-auto">
          <Button variant="outline" className={landingPageBtnStyles}>
            Conecta con un Grupo Pequeño
          </Button>
        </div>
      </div>
    </section>
  );
}
