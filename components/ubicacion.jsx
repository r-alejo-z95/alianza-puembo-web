import { Youtube } from "lucide-react";
import GoogleMapView from "./interactive-map";
import { cn } from "@/lib/utils";
import {
  sectionPx,
  secondaryTextSizes,
  subTitleSizes,
  secondSubTitleSizes,
} from "@/lib/styles";

export default function Ubicacion() {
  return (
    <section className={cn(sectionPx, "w-full h-[50%] py-16")}>
      <div className="mx-auto flex flex-col gap-8">
        <h2
          className={cn(
            subTitleSizes,
            "text-center font-merriweather font-bold"
          )}
        >
          ¡Queremos conocerte! Visítanos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-0 w-full mx-auto">
          <div className="overflow-scroll">
            <GoogleMapView />
          </div>
          <div className="flex flex-col gap-4 md:gap-8 justify-center items-center text-center">
            <div className="flex flex-col md:gap-4">
              <p
                className={cn(
                  secondSubTitleSizes,
                  "font-merriweather font-bold"
                )}
              >
                10:00 | 12:00
              </p>
              <p className={cn(secondaryTextSizes)}>Servicios dominicales</p>
            </div>
            <div className="flex flex-col md:gap-4">
              <p
                className={cn(
                  secondSubTitleSizes,
                  "font-merriweather font-bold"
                )}
              >
                10:00
              </p>
              <div className="flex items-center gap-2">
                <p className={cn(secondaryTextSizes)}>Servicio online</p>
                <a
                  href="https://www.youtube.com/c/IglesiaAlianzaPuembo"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Youtube channel"
                >
                  <Youtube className="size-7 text-red-500 hover:text-red-600 transition-colors" />
                </a>
              </div>
            </div>
            <div className="flex flex-col md:gap-2">
              <p className={cn(secondaryTextSizes)}>
                Julio Tobar Donoso y 24 de Mayo
              </p>
              <p className={cn(secondaryTextSizes)}>Puembo, Ecuador</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}