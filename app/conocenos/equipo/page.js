import Image from "next/image";
import { sectionTitle, contentSection } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";

export const metadata = {
  title: "Equipo Ministerial",
  description: "Conoce a los pastores y líderes que sirven a nuestra comunidad en Alianza Puembo. Descubre quiénes somos y nuestra misión.",
  alternates: {
    canonical: "/conocenos/equipo",
  },
};

export default function Equipo() {
  const team = [
    {
      name: "Ps. Leandro Gaitán",
      detail: "Co-Pastor",
      image: "/conocenos/equipo/familia-leandro.avif",
      bio: "El Pastor Leandro Gaitán, junto a su esposa, lidera con pasión el ministerio de Alianza Puembo, enfocándose en la enseñanza bíblica y el discipulado. Su visión es edificar una comunidad fuerte en la fe y el servicio."
    },
    {
      name: "Iván Echeverría",
      detail: "Administrador",
      image: "/conocenos/equipo/familia-ivan.avif",
      bio: "Iván Echeverría es el pilar administrativo de la iglesia, asegurando que todos los recursos se gestionen eficientemente para el cumplimiento de la misión. Su dedicación garantiza el buen funcionamiento de cada área."
    },
    {
      name: "Anabel García",
      detail: "Coordinadora Ministerial Puentes",
      image: "/conocenos/equipo/familia-anabel.avif",
      bio: "Anabel García coordina el Ministerio Puentes, conectando a la iglesia con la comunidad a través de iniciativas de servicio y evangelismo. Su corazón está en construir relaciones significativas y llevar esperanza."
    },
    {
      name: "Fabiola Diaz",
      detail: "Coordinadora Ministerios de Apoyo",
      image: "/conocenos/equipo/familia-papo.avif",
      bio: "Fabiola Díaz supervisa los Ministerios de Apoyo, asegurando que cada miembro de la iglesia encuentre un lugar para servir y crecer. Su liderazgo fomenta un ambiente de colaboración y cuidado mutuo."
    },
    {
      name: "Daniela Riofrío",
      detail: "Coordinadora Ministerial Jóvenes",
      image: "/conocenos/equipo/familia-dani-r.avif",
      bio: "Daniela Riofrío lidera el Ministerio de Jóvenes, inspirando a la nueva generación a vivir una fe auténtica y relevante. Su enfoque es equipar a los jóvenes para impactar su entorno con los valores del Reino."
    },
    {
      name: "Daniela Andrade",
      detail: "Coordinadora Ministerial Puembo Kids",
      image: "/conocenos/equipo/familia-dani-a.avif",
      bio: "Daniela Andrade es la coordinadora de Puembo Kids, dedicando su energía a enseñar a los niños los principios bíblicos de una manera divertida y creativa. Su pasión es ver a los más pequeños crecer en su fe."
    },
  ];

  return (
    <PublicPageLayout
      title="Equipo Ministerial"
      description="Conoce al equipo que lidera nuestra Iglesia"
      imageUrl="/conocenos/equipo/Equipo.jpg"
      imageAlt="Equipo ministerial en el aniversario de la iglesia"
    >
      <div className={contentSection}>
        <Card className="flex flex-col gap-4 flex-1 w-full max-w-[600px] mx-auto">
          <CardHeader>
            <div className="relative w-full aspect-[3/2] rounded-md overflow-hidden flex-shrink-0 mx-auto">
              <Image
                src="/conocenos/equipo/familia-gio.avif"
                alt="Familia pastoral"
                fill
                sizes="(max-width: 1023px) 100vw, 500px"
                className="object-cover"
                unoptimized
              />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-center">
            <CardTitle className={cn(sectionTitle, "mx-auto text-center text-lg md:text-2xl lg:text-3xl font-bold")}>
              Ps. Gio Martinez
            </CardTitle>
            <CardDescription className="text-xs md:text-sm lg:text-base mx-auto text-center">
              Pastor Principal
            </CardDescription>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 mt-2">
              El Pastor Gio Martinez, junto a su esposa, lidera con pasión el ministerio de Alianza Puembo, enfocándose en la enseñanza bíblica y el discipulado. Su visión es edificar una comunidad fuerte en la fe y el servicio.
            </p>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
          {team.map((member, index) => {
            const isLast = index === team.length - 1;
            const isOdd = team.length % 2 !== 0;
            const shouldCenter = isLast && isOdd;

            return (
              <Card
                key={index}
                className={cn("flex flex-col gap-4 max-w-md w-full mx-auto",
                  shouldCenter ? "sm:col-span-2 justify-self-center" : ""
                )}
              >
                <CardHeader>
                  <div className="relative w-full aspect-[3/2] rounded-md overflow-hidden flex-shrink-0 mx-auto">
                    <Image
                      src={member.image}
                      alt={`Foto de ${member.name}`}
                      fill
                      sizes="(max-width: 1023px) 100vw, 400px"
                      className="object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col text-center gap-1">
                  <CardTitle className={sectionTitle}>
                    {member.name}
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm lg:text-base">
                    {member.detail}
                  </CardDescription>
                  <p className="text-sm md:text-base lg:text-lg text-gray-600 mt-2">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PublicPageLayout>
  );
}
