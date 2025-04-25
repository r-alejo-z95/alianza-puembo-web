import { Youtube } from "lucide-react";
import InteractiveMap from "./interactive-map";

export default function Ubicacion() {
  return (
    <section className="w-full py-16 px-4 md:px-6 lg:px-8 text-(--puembo-black)">
      <div className="max-w-screen-xl mx-auto flex flex-col gap-8">
        <h2 className="text-center font-merriweather text-2xl md:text-4xl lg:text-5xl font-bold">
          ¡Queremos conocerte! Visítanos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-0 w-full md:max-w-4xl lg:max-w-5xl mx-auto">
          <div className="overflow-scroll">
            <InteractiveMap />
          </div>
          <div className="flex flex-col gap-4 justify-center items-center text-center">
            <div>
              <p className="font-merriweather text-xl md:text-2xl lg:text-3xl font-bold">
                10:00 | 12:00
              </p>
              <p className="text-base md:text-lg lg:text-xl">
                Servicios dominicales
              </p>
            </div>
            <div>
              <p className="font-merriweather text-xl md:text-2xl lg:text-3xl font-bold">
                10:00
              </p>
              <div className="flex items-center gap-2">
                <p className="text-base md:text-lg lg:text-xl">
                  Servicio online
                </p>
                <a
                  href="https://www.youtube.com/c/IglesiaAlianzaPuembo"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Youtube channel"
                >
                  <Youtube className="size-7 text-[#FF0000] hover:text-[#FF0000]/70 transition-colors" />
                </a>
              </div>
            </div>
            <div>
              <p className="text-base md:text-lg lg:text-xl">
                Julio Tobar Donoso y 24 de Mayo
              </p>
              <p>Puembo, Ecuador</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
