import { Youtube } from "lucide-react";

export default function Ubicacion() {
  return (
    <section className="w-full h-full flex flex-col items-left justify-center text-(--puembo-black) px-13 gap-8 my-8">
      <p className="text-2xl md:text-5xl lg:text-6xl">
        Queremos conocerte! Visítanos!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mapa */}
        <div className="flex-shrink-0">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7956119194896!2d-78.3638005!3d-0.19331020000000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d593c7c8324e13%3A0xe079bee6c92c5318!2sIglesia%20Alianza%20Puembo!5e0!3m2!1sen!2sec!4v1744856239000!5m2!1sen!2sec"
            fill="true"
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full aspect-[3/2] shadow-sm shadow-black/30"
          ></iframe>
        </div>

        {/* Información de horarios */}
        <div className="flex flex-col gap-4 justify-center items-center">
          <p className="font-merriweather text-lg md:text-2xl lg:text-3xl font-bold">
            10:00 / 12:00
          </p>
          <p className="text-sm md:text-lg lg:text-xl">Servicios dominicales</p>
          <p className="font-merriweather text-lg md:text-2xl lg:text-3xl font-bold">
            10:00
          </p>
          <div className="flex flex-row gap-2 items-center">
            <p className="text-sm md:text-lg lg:text-xl">Servicio online</p>
            <a
              href="https://www.youtube.com/c/IglesiaAlianzaPuembo"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Youtube channel"
            >
              <Youtube className="size-7 text-red-500 hover:text-red-300 transition-colors" />
            </a>
          </div>
          {/* Dirección */}
          <div className="flex items-center">
            <p className="text-sm md:text-lg lg:text-xl text-center mx-auto">
              Julio Tobar Donoso y 24 de Mayo - Puembo, Ecuador
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
