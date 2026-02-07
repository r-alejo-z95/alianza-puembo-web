import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Ministerio de Música, Artes y Tecnología",
  description: "Un ministerio dedicado a la adoración y el servicio a través de la música y las artes.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/compromiso/mat",
  },
};

export default function Mat() {
  const introSectionData = {
    title: "Adoración, Arte y Tecnología",
    description: [
      "El Ministerio de Música, Artes y Tecnología (MAT) es un espacio donde la creatividad se une a la fe para glorificar a Dios. Creemos que el arte y la tecnología son herramientas poderosas para expresar nuestra adoración y comunicar el mensaje del evangelio.",
      "Si tienes talentos en música, canto, teatro, producción audiovisual, sonido, iluminación o cualquier otra forma de expresión artística, te invitamos a unirte a nuestro equipo y servir con excelencia.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/compromiso/mat/Mat.avif",
    imageAlt: "Personas adorando",
    imagePosition: "right",
  };

  const activitiesData = {
    title: "Áreas de Servicio",
    items: [
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/servicio/compromiso/mat/mat-activity-1.avif",
        imageAlt: "Música y Canto",
        itemTitle: "Música y Canto",
        itemDescription: "Equipos de alabanza que lideran la congregación en la adoración a través de la música.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/servicio/compromiso/mat/mat-activity-2.avif",
        imageAlt: "Producción Audiovisual",
        itemTitle: "Producción Audiovisual",
        itemDescription: "Creación de contenido visual, videos y transmisiones en vivo para alcanzar a más personas.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/servicio/compromiso/mat/mat-activity-3.avif",
        imageAlt: "Teatro",
        itemTitle: "Teatro",
        itemDescription: "Producción de obras de teatro para eventos especiales en la iglesia.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Ministerio de Música, Artes y Tecnología"
      description="Un ministerio dedicado a la adoración y el servicio a través de la música y las artes."
      imageUrl="/involucrate/ministerios/servicio/compromiso/mat/Mat.avif"
      imageAlt="Cantantes adorando"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        hierarchy={[
          { name: "Servicio", href: "/ministerios/servicio" },
          { name: "Compromiso", href: "/ministerios/compromiso" }
        ]}
        current="MAT"
        backLink="/ministerios/compromiso" 
        backLabel="Volver a Compromiso" 
      />
      <MinistryContentSection {...activitiesData} />
    </PublicPageLayout>
  );
}
