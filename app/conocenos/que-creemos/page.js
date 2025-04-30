import { Card } from "@/components/ui/card";
import { BookOpenText } from "lucide-react";

export default function QueCreemos() {
  const values = [
    {
      name: "Misión",
      detail:
        "Ser una familia con convicciones firmes en Cristo que comparten su fe con otros.",
    },
    {
      name: "Visión",
      detail: (
        <>
          <ul className="list-disc list-inside">
            <li>Somos apasionados por Dios</li>
            <li>Vivimos en Comunidad</li>
            <li>Somos discípulos</li>
            <li>Servimos</li>
            <li>Proclamamos el Evangelio</li>
          </ul>
        </>
      ),
    },
  ];

  const beleifs = [
    {
      name: "Cristo nuestro Salvador",
      detail:
        "Jesús es el único camino hacia Dios. A través de su muerte y resurrección, ofrece perdón y vida eterna a todos los que creen.",
      verse:
        "... porque no hay otro nombre bajo el cielo, dado a los hombres, en que podamos ser salvos.",
      citation: "–Hechos 4:12",
    },
    {
      name: "Cristo nuestro Santificador",
      detail:
        "Después de salvarnos, Cristo nos transforma por medio del Espíritu Santo, guiándonos a una vida santa y obediente.",
      verse: "Porque esta es la voluntad de Dios: vuestra santificación...",
      citation: "–1 Tesalonicenses 4:3",
    },
    {
      name: "Cristo nuestro Sanador",
      detail:
        "Creemos que Jesús también sana nuestras enfermedades conforme a su voluntad, como parte de su obra redentora.",
      verse: "Por sus heridas fuimos nosotros sanados.",
      citation: "–Isaías 53:5",
    },
    {
      name: "Cristo nuestro Rey que viene",
      detail:
        "Jesús volverá con poder y gloria. Su regreso es nuestra esperanza y nos llama a vivir con fe, propósito y urgencia.",
      verse: "Este mismo Jesús... vendrá así como le habéis visto ir al cielo.",
      citation: "–Hechos 1:11",
    },
  ];

  return (
    <section className="w-full h-full bg-[url('/familia-de-familias.jpg')] bg-fixed bg-cover bg-top bg-no-repeat">
      <div className="flex flex-col items-center gap-12 py-16 px-4 md:px-6 lg:px-8 mx-auto backdrop-brightness-80 backdrop-contrast-70">
        <div className="flex flex-col gap-8 flex-1 text-white">
          <h2 className="font-merriweather text-2xl md:text-4xl lg:text-5xl font-bold mx-auto">
            Somos una Familia de familias
          </h2>
          <div className="flex flex-col gap-6 flex-1">
            <p className="text-base md:text-lg lg:text-xl mx-8 lg:mx-16 text-center">
              Dios nos dió una Misión y una Visión para Su Gloria.
            </p>
            <div className="flex">
              {values.map((value, index) => {
                return (
                  <div
                    key={index}
                    className="flex flex-row gap-4 max-w-md w-full mx-auto"
                  >
                    <div className="flex flex-col gap-2 mx-4">
                      <h3 className="font-merriweather text-xl md:text-3xl lg:text-4xl font-bold mx-auto text-center">
                        {value.name}
                      </h3>
                      <div className="text-sm md:text-base lg:text-lg mx-8 lg:mx-12 text-justify">
                        {value.detail}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 flex-1 items-center max-w-screen-xl mx-auto">
          <p className="text-base md:text-lg lg:text-xl mx-8 lg:mx-16 text-justify text-white">
            Formamos parte de la Alianza Cristiana y Misionera, un movimiento
            enfocado en vivir y proclamar el evangelio de Jesucristo al mundo,
            con una vida centrada en Él y una misión clara hacia las naciones.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-5xl text-(--puembo-black)">
            {beleifs.map((beleif, index) => {
              return (
                <Card
                  key={index}
                  className="flex flex-col gap-4 max-w-md w-full mx-auto"
                >
                  <div className="flex flex-col gap-2 mx-8">
                    <h3 className="font-merriweather text-lg md:text-xl lg:text-2xl font-bold text-center">
                      {beleif.name}
                    </h3>
                    <p className="text-xs md:text-sm lg:text-base text-justify">
                      {beleif.detail}
                    </p>
                    <p className="text-xs md:text-sm text-justify italic flex items-center gap-2 lg:gap-4">
                      <BookOpenText className="size-4 shrink-0" />
                      <span>"{beleif.verse}"</span>
                    </p>
                    <p className="text-xs md:text-sm lg:text-base text-justify font-semibold">
                      {beleif.citation}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
