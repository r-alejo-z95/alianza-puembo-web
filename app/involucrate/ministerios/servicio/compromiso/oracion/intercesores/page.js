
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Intercesores",
  description: "Equipo dedicado a la intercesión profética por la iglesia, sus líderes y las necesidades de la comunidad en Alianza Puembo.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/compromiso/oracion/intercesores",
  },
};

export default function Intercesores() {
  const introSectionData = {
    title: "Intercesores: Clamando por el Reino",
    description: [
      "El ministerio de Intercesores es un equipo de creyentes dedicados a la intercesión profética por la iglesia, sus líderes, las familias y las necesidades de la comunidad. Creemos que la intercesión es una herramienta poderosa para desatar el poder de Dios y ver su voluntad manifestada en la tierra.",
      "Nos reunimos regularmente para orar con pasión y fe, creyendo que nuestras oraciones hacen una diferencia. Si tienes un corazón para la intercesión, te invitamos a unirte a este ejército de oración.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/compromiso/oracion/intercesores/Intercesores.avif",
    imageAlt: "Grupo de intercesores orando con fervor",
    imagePosition: "right",
  };

  const focusAreasData = {
    title: "Nuestra Labor",
    items: [
      {
        type: "icon",
        iconType: "Church",
        itemTitle: "Oración por la Iglesia",
        itemDescription: "Intercedemos por el crecimiento, la unidad y la visión de Alianza Puembo.",
      },
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Oración por los Líderes",
        itemDescription: "Clamamos por sabiduría, protección y dirección para nuestros pastores y líderes.",
      },
      {
        type: "icon",
        iconType: "Globe",
        itemTitle: "Oración por la Comunidad",
        itemDescription: "Intercedemos por nuestra ciudad, nación y las necesidades globales.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Intercesores"
      description="Clamando por el Reino de Dios."
      imageUrl="/involucrate/ministerios/servicio/compromiso/oracion/intercesores/header.avif"
      imageAlt="Intercesores"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        backLink="/ministerios/oracion" 
        backLabel="Volver a Oración" 
      />
      <MinistryContentSection {...focusAreasData} />
    </PublicPageLayout>
  );
}
