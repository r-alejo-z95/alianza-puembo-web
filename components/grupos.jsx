import { Button } from "./ui/button";
import {
  btnStyles,
  sectionPx,
  mainTitleSizes,
  subTitleSizes,
} from "@/lib/styles";
import { cn } from "@/lib/utils";

export default function Grupos() {
  return (
    <section className="w-full h-screen flex flex-col text-white bg-primary">
      <div className="relative w-[90%] h-[90%] mx-auto my-auto bg-[url('/groups.jpg')] bg-cover bg-center rounded-md brightness-80 contrast-70" />
      <div
        className={cn(
          sectionPx,
          "absolute w-full h-full flex flex-col justify-around py-16"
        )}
      >
        <h2
          className={cn(
            subTitleSizes,
            "text-center font-merriweather font-bold mx-auto"
          )}
        >
          Grupos Pequeños
        </h2>
        <p className={cn(mainTitleSizes, "text-center mx-auto")}>
          Tenemos un lugar para ti
        </p>
        <div className="max-w-screen mx-auto">
          <Button variant="outline" className={btnStyles}>
            Conecta con un Grupo Pequeño
          </Button>
        </div>
      </div>
    </section>
  );
}
