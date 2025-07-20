
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Ministerio de Oración",
  description: "El motor espiritual de Alianza Puembo. Únete a nuestros Círculos de Oración, Intercesores y Miércoles de Oración para buscar a Dios juntos.",
  alternates: {
    canonical: "/ministerios/servicio/compromiso/oracion",
  },
};

export default function Oracion() {
  const introSectionData = {
    title: "Oración: El Motor de la Iglesia",
    description: [
      "El Ministerio de Oración es el corazón y el motor espiritual de Alianza Puembo. Creemos firmemente en el poder transformador de la oración y en la importancia de buscar a Dios en todo tiempo. Es a través de la oración que vemos milagros, vidas transformadas y el Reino de Dios avanzando.",
      "Te invitamos a unirte a nuestros diferentes espacios de oración, donde juntos clamamos por nuestra iglesia, nuestra ciudad y el mundo.",
    ],
    imageUrl: "/ministerios/servicio/compromiso/oracion/Oracion.jpg",
    imageAlt: "Grupo de personas orando juntas",
    imagePosition: "right",
  };

  const prayerMinistries = {
    title: "Nuestros Espacios de Oración",
    items: [
      {
        type: "link",
        href: "/ministerios/servicio/compromiso/oracion/circulos-de-oracion",
        itemTitle: "Círculos de Oración",
        itemDescription: "Grupos rotativos basados en el devocional 'El Hacedor de Círculos'.",
      },
      {
        type: "link",
        href: "/ministerios/servicio/compromiso/oracion/intercesores",
        itemTitle: "Intercesores",
        itemDescription: "Equipo dedicado a la intercesión profética por la iglesia y sus necesidades.",
      },
      {
        type: "link",
        href: "/ministerios/servicio/compromiso/oracion/miercoles-de-oracion",
        itemTitle: "Miércoles de Oración",
        itemDescription: "Servicio semanal dedicado exclusivamente a la oración y la búsqueda de Dios.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Ministerio de Oración"
      description="El motor espiritual de Alianza Puembo."
      imageUrl="/ministerios/servicio/compromiso/oracion/Oracion.jpg"
      imageAlt="Ministerio de Oración"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...prayerMinistries} />
    </PublicPageLayout>
  );
}
