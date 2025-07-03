import { Card } from "@/components/ui/card";
import { BookOpenText } from "lucide-react";
import { pageSection, pageHeaderContainer, pageTitle, pageDescription, sectionTitle, subSectionTitle } from "@/lib/styles";

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
      image: "Salvador.png",
    },
    {
      name: "Cristo nuestro Santificador",
      detail:
        "Después de salvarnos, Cristo nos transforma por medio del Espíritu Santo, guiándonos a una vida santa y obediente.",
      verse:
        "Cristo nos hizo justos ante Dios; nos hizo puros y santos y nos liberó del pecado.",
      citation: "–1 Corintios 1:30",
      image: "Santificador.png",
    },
    {
      name: "Cristo nuestro Sanador",
      detail:
        "Creemos que Jesús también sana nuestras enfermedades conforme a su voluntad, como parte de su obra redentora.",
      verse:
        "Una oración ofrecida con fe sanará al enfermo, y el Señor hará que se recupere; y si ha cometido pecados, será perdonado.",
      citation: "–Santiago 5:15",
      image: "Sanador.png",
    },
    {
      name: "Cristo nuestro Rey que viene",
      detail:
        "Jesús volverá con poder y gloria. Su regreso es nuestra esperanza y nos llama a vivir con fe, propósito y urgencia.",
      verse:
        "Y ustedes verán al Hijo del Hombre sentado en el lugar de poder, a la derecha de Dios, y viniendo en las nubes del cielo.",
      citation: "–Marcos 14:62",
      image: "Rey.png",
    },
  ];

  return (
    <section className={pageSection}>
      <div className={pageHeaderContainer}>
        <h1 className={pageTitle}>
          Somos una Familia de familias
        </h1>
        <p className={pageDescription}>
          Dios nos dió una Misión y una Visión para Su Gloria.
        </p>
      </div>
      <div className="flex flex-col items-center gap-12">
        <div className="flex flex-col gap-6 flex-1">
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
                    <div className="text-sm md:text-base lg:text-lg mx-8 lg:mx-12 ">
                      {value.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-6 flex-1 items-center max-w-screen-xl mx-auto">
          <p className="text-base md:text-lg lg:text-xl mx-8 lg:mx-16 text-justify">
            Formamos parte de la Alianza Cristiana y Misionera, un movimiento
            enfocado en vivir y proclamar el evangelio de Jesucristo al mundo,
            con una vida centrada en Él y una misión clara hacia las naciones.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-5xl">
            {beleifs.map((beleif, index) => {
              return (
                <Card
                  key={index}
                  className="flex flex-col gap-4 max-w-md w-full mx-auto hover:scale-105 cursor-default transition-transform duration-700 ease-in-out relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 z-0 m-4"
                    style={{
                      backgroundImage: `url('/${beleif.image}')`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      opacity: 0.5,
                    }}
                  />

                  <div className="flex flex-col gap-2 mx-8 relative z-10">
                    <h3 className={sectionTitle}>
                      {beleif.name}
                    </h3>
                    <p className="text-xs md:text-sm lg:text-base text-justify">
                      {beleif.detail}
                    </p>
                    <p className="text-xs md:text-sm text-justify italic flex items-center gap-2 lg:gap-4">
                      <BookOpenText className="size-4 shrink-0" />
                      <span>&quot;{beleif.verse}&quot;</span>
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
