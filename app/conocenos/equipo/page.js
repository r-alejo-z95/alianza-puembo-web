import { Button } from "./../../../components/ui/button";
import { landingPageBtnStyles } from "@/lib/styles";
import Image from "next/image";

export default function team() {
  const team = [
    {
      name: "Iván Echeverría",
      detail: "Descripción breve del líder 1.",
      image: "/familia-ivan.avif",
    },
    {
      name: "Anabel García",
      detail: "Descripción breve del líder 2.",
      image: "/familia-anabel.avif",
    },
    {
      name: "Fabiola Diaz",
      detail: "Descripción breve del líder 3.",
      image: "/familia-papo.avif",
    },
    {
      name: "Daniela Riofrío",
      detail: "Descripción breve del líder 4.",
      image: "/familia-dani-r.avif",
    },
    {
      name: "Daniela Andrade",
      detail: "Descripción breve del líder 5.",
      image: "/familia-dani-a.avif",
    },
  ];

  return (
    <section className="w-full py-16 px-4 md:px-6 lg:px-8 text-(--puembo-black)">
      <div className="flex flex-col items-center gap-8 max-w-screen-xl mx-auto">
        <div className="flex flex-col gap-4 flex-1 mb-4">
          <h2 className="font-merriweather text-2xl md:text-4xl lg:text-5xl font-bold mx-auto">
            Equipo Ministerial
          </h2>
          <p className="text-base md:text-lg lg:text-xl mx-auto">
            Conoce al equipo que lidera nuestra Iglesia
          </p>
        </div>
        <div className="flex flex-col gap-4 flex-1">
          <div className="relative w-full lg:w-[500px] aspect-[3/2] rounded-lg overflow-hidden flex-shrink-0 mx-auto">
            <Image
              src="/familia-gio.avif"
              alt="Familia pastoral"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <h3 className="font-merriweather text-lg md:text-2xl lg:text-3xl font-bold mx-auto">
              Pastor Principal: Gio Martinez
            </h3>
            <p className="text-xs md:text-sm lg:text-base mx-auto text-center">
              Ps. Gio Martinez, su esposa Cris Zapata, su hijo Josue, sus hijas
              Berni, Maka y Rena.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-6xl">
          {team.map((member, index) => {
            const isLast = index === team.length - 1;
            const isOdd = team.length % 2 !== 0;
            const shouldCenter = isLast && isOdd;

            return (
              <div
                key={index}
                className={`flex flex-col gap-4 max-w-md w-full mx-auto ${
                  shouldCenter ? "sm:col-span-2 justify-self-center" : ""
                }`}
              >
                <div className="relative w-full lg:w-[400px] aspect-[3/2] rounded-lg overflow-hidden flex-shrink-0 mx-auto">
                  <Image
                    src={member.image}
                    alt={`Foto de ${member.name}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col text-center gap-1">
                  <h3 className="font-merriweather text-lg md:text-xl lg:text-2xl font-bold">
                    {member.name}
                  </h3>
                  <p className="text-xs md:text-sm lg:text-base">
                    {member.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
