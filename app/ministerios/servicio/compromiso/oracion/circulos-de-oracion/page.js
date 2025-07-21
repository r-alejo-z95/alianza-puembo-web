
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Círculos de Oración",
  description: "Grupos rotativos de oración basados en el devocional 'El Hacedor de Círculos'. Un espacio para orar con propósito y ver la mano de Dios.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/compromiso/oracion/circulos-de-oracion",
  },
};

export default function CirculosDeOracion() {
  const introSectionData = {
    title: "Círculos de Oración: Orando con Propósito",
    description: [
      "Los Círculos de Oración son grupos pequeños y rotativos que se reúnen para orar con un propósito específico, inspirados en el devocional 'El Hacedor de Círculos'. Creemos que la oración ferviente y persistente tiene el poder de mover la mano de Dios y transformar circunstancias.",
      "Cada grupo se compromete a orar por un período de 40 días, enfocándose en áreas específicas de la vida personal, familiar, de la iglesia y de la comunidad. Es una oportunidad para experimentar el poder de la oración colectiva.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/compromiso/oracion/circulos-de-oracion/CirculosDeOracion.jpg",
    imageAlt: "Personas formando un círculo de oración",
    imagePosition: "right",
  };

  const programDetails = {
    title: "¿Cómo funcionan?",
    items: [
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Grupos Pequeños",
        itemDescription: "Conformados por un número reducido de personas para una oración más íntima y enfocada.",
      },
      {
        type: "icon",
        iconType: "Calendar",
        itemTitle: "Compromiso de 40 Días",
        itemDescription: "Cada ciclo dura 40 días, con un enfoque temático para la oración.",
      },
      {
        type: "icon",
        iconType: "BookOpen",
        itemTitle: "Basado en el Devocional",
        itemDescription: "Utilizamos 'El Hacedor de Círculos' como guía para nuestras oraciones.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Círculos de Oración"
      description="Orando con propósito y viendo la mano de Dios."
      imageUrl="/involucrate/ministerios/servicio/compromiso/oracion/circulos-de-oracion/CirculosDeOracion.jpg"
      imageAlt="Círculos de Oración"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...programDetails} />
    </PublicPageLayout>
  );
}
