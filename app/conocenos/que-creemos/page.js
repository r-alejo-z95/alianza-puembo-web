import { Card } from "@/components/ui/card";
import { BookOpenText } from "lucide-react";
import Image from "next/image";
import { textShadow, dropShadow } from "@/lib/styles";
import { pageSection, pageHeaderContainer, imageHeaderContainer, pageTitle, pageDescription, sectionTitle } from "@/lib/styles";

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
        "¡En ningún otro hay salvación! Dios no ha dado ningún otro nombre bajo el cielo, mediante el cual podamos ser salvos.",
      citation: "–Hechos 4:12",
      image: "/conocenos/que-creemos/Salvador.png",
    },
    {
      name: "Cristo nuestro Santificador",
      detail:
        "Después de salvarnos, Cristo nos transforma por medio del Espíritu Santo, guiándonos a una vida santa y obediente.",
      verse:
        "Cristo nos hizo justos ante Dios; nos hizo puros y santos y nos liberó del pecado.",
      citation: "–1 Corintios 1:30",
      image: "/conocenos/que-creemos/Santificador.png",
    },
    {
      name: "Cristo nuestro Sanador",
      detail:
        "Creemos que Jesús también sana nuestras enfermedades conforme a su voluntad, como parte de su obra redentora.",
      verse:
        "Una oración ofrecida con fe sanará al enfermo, y el Señor hará que se recupere; y si ha cometido pecados, será perdonado.",
      citation: "–Santiago 5:15",
      image: "/conocenos/que-creemos/Sanador.png",
    },
    {
      name: "Cristo nuestro Rey que viene",
      detail:
        "Jesús volverá con poder y gloria. Su regreso es nuestra esperanza y nos llama a vivir con fe, propósito y urgencia.",
      verse:
        "Y ustedes verán al Hijo del Hombre sentado en el lugar de poder, a la derecha de Dios, y viniendo en las nubes del cielo.",
      citation: "–Marcos 14:62",
      image: "/conocenos/que-creemos/Rey.png",
    },
  ];

  return (
    <section>
      <div className={imageHeaderContainer}>
        <Image
          src="/conocenos/que-creemos/Que-creemos.webp"
          alt="Silueta de manos levantadas"
          fill
          priority
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/50 z-10" />

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className={pageTitle + textShadow}>
            Somos una Familia de familias
          </h1>
          <p className={pageDescription + textShadow}>
            Dios nos dió una Misión y una Visión para Su Gloria.
          </p>
        </div>
      </div>



      <div className="flex flex-col items-center gap-12">
        <div className={"container mx-auto px-4 pt-12 flex flex-col gap-6 flex-1"}>
          <div className="flex flex-row w-full items-start justify-center flex-wrap">
            {values.map((value, index) => {
              return (
                <div
                  key={index}
                  className="flex flex-row gap-4 max-w-md flex-wrap items-center justify-center"
                >
                  <div className="flex flex-col gap-2 mx-4">
                    <h3 className="font-merriweather text-xl md:text-3xl lg:text-4xl font-bold mx-auto text-center">
                      {value.name}
                    </h3>
                    <div className="text-sm md:text-base lg:text-lg mx-4 lg:mx-12 ">
                      {value.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        <div className={"container mx-auto px-4 pb-12 flex flex-col gap-6 flex-1 items-center max-w-screen-xl"}>
          <p className={textShadow + " pb-4 text-base md:text-lg lg:text-xl mx-8 lg:mx-16 text-justify text-white"}>
            Formamos parte de la Alianza Cristiana y Misionera, un movimiento
            enfocado en vivir y proclamar el evangelio de Jesucristo al mundo,
            con una vida centrada en Él y una misión clara hacia las naciones.
          </p>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-5xl mx-auto px-4">
            {beleifs.map((beleif, index) => {
              return (
                <Card
                  key={index}
                  className={dropShadow + " flex flex-col gap-4 max-w-md w-full mx-auto cursor-default relative overflow-hidden border-0 bg-white/10"}
                >
                  <div className="flex flex-col gap-2 mx-8 relative z-10">
                    <h3 className={sectionTitle + textShadow + " flex items-center gap-2 text-white"}>
                      {beleif.name}
                    </h3>
                    <p className={textShadow + " text-xs md:text-sm lg:text-base text-left text-gray-300"}>
                      {beleif.detail}
                    </p>
                    <p className={textShadow + " text-sm md:text-base text-justify italic flex items-center gap-2 lg:gap-4 text-gray-400"}>
                      <BookOpenText className="size-4 shrink-0" />
                      <span>&quot;{beleif.verse}&quot;</span>
                    </p>
                    <p className={textShadow + " text-sm text-justify font-semibold text-gray-400"}>
                      {beleif.citation}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="pb-6" />

      </div>
    </section>
  );
}
