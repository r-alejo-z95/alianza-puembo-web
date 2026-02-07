
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Acompañamiento",
  description: "Presencia, empatía y consuelo en los momentos difíciles. Acompañamos a nuestra familia de fe en tiempos de pérdida y vulnerabilidad.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/compromiso/mda/visitacion-y-funerales",
  },
};

export default function Acompañamiento() {
  const introSectionData = {
    title: "Acompañamiento: Empatía en Cada Paso",
    description: [
      "El ministerio de Acompañamiento extiende el amor y la compasión de Cristo a aquellos que atraviesan momentos difíciles y de vulnerabilidad.",
      "Nuestra misión es brindar presencia, consuelo y apoyo espiritual en tiempos de duelo y pérdida, recordando que como familia de familias, nunca caminamos solos.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/compromiso/mda/visitacion-y-funerales/VisitacionYFunerales.avif",
    imageAlt: "Acompañamiento",
    imagePosition: "right",
  };

  const rolesData = {
    title: "Nuestra Labor",
    items: [
      {
        type: "icon",
        iconType: "Church",
        itemTitle: "Presencia Pastoral",
        itemDescription: "Acompañamos físicamente y en oración en los momentos de mayor necesidad.",
      },
      {
        type: "icon",
        iconType: "HeartCrack",
        itemTitle: "Consuelo en el Duelo",
        itemDescription: "Apoyo emocional y espiritual para quienes enfrentan la partida de un ser querido.",
      },
      {
        type: "icon",
        iconType: "HandHelping",
        itemTitle: "Empatía Activa",
        itemDescription: "Un hombro donde apoyarse y un corazón dispuesto a escuchar con amor.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Acompañamiento"
      description="Empatía y consuelo en momentos difíciles."
      imageUrl="/involucrate/ministerios/servicio/compromiso/mda/visitacion-y-funerales/header.avif"
      imageAlt="Acompañamiento"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        backLink="/ministerios/mda" 
        backLabel="Volver a MDA" 
      />
      <MinistryContentSection {...rolesData} />
    </PublicPageLayout>
  );
}
