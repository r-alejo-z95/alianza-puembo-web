import { Card } from "@/components/ui/card";
import { BookOpenText } from "lucide-react";

export default function QueCreemos() {
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
    <section className="w-full py-16 px-4 md:px-6 lg:px-8 text-(--puembo-black)">
      <div className="flex flex-col items-center gap-8 max-w-screen-xl mx-auto">
        <div className="flex flex-col gap-4 flex-1 mb-4">
          <h2 className="font-merriweather text-2xl md:text-4xl lg:text-5xl font-bold mx-auto">
            ¿En qué creemos?
          </h2>
          <p className="text-base md:text-lg lg:text-xl mx-8 lg:mx-16 text-justify">
            Somos una iglesia que forma parte de la Alianza Cristiana y
            Misionera, un movimiento enfocado en vivir y proclamar el evangelio
            de Jesucristo al mundo, con una vida centrada en Él y una misión
            clara hacia las naciones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-5xl">
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
    </section>
  );
}
