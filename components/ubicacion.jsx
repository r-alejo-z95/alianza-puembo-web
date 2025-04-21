import { Youtube } from "lucide-react";

export default function Ubicacion() {
  return (
    <section className="w-full py-16 px-4 md:px-6 lg:px-8 text-(--puembo-black)">
      <div className="max-w-screen-xl mx-auto flex flex-col gap-8">
        <h2 className="text-center font-merriweather text-2xl md:text-4xl lg:text-5xl font-bold">
          ¡Queremos conocerte! Visítanos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-lg overflow-hidden shadow-md shadow-black/30">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7956119194896!2d-78.3638005!3d-0.19331020000000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d593c7c8324e13%3A0xe079bee6c92c5318!2sIglesia%20Alianza%20Puembo!5e0!3m2!1sen!2sec!4v1744856239000!5m2!1sen!2sec"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full aspect-[3/2]"
            ></iframe>
          </div>
          <div className="flex flex-col gap-4 justify-center items-center text-center">
            <p className="font-merriweather text-xl md:text-2xl lg:text-3xl font-bold">
              10:00 / 12:00
            </p>
            <p className="text-base md:text-lg lg:text-xl">
              Servicios dominicales
            </p>
            <p className="font-merriweather text-xl md:text-2xl lg:text-3xl font-bold">
              10:00
            </p>
            <div className="flex items-center gap-2">
              <p className="text-base md:text-lg lg:text-xl">Servicio online</p>
              <a
                href="https://www.youtube.com/c/IglesiaAlianzaPuembo"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Youtube channel"
              >
                <Youtube className="size-7 text-[#FF0000] hover:text-[#FF0000]/70 transition-colors" />
              </a>
            </div>
            <p className="text-base md:text-lg lg:text-xl">
              Julio Tobar Donoso y 24 de Mayo
              <br />
              Puembo, Ecuador
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
