
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Santa Cena",
  description: "Preparando y sirviendo en la celebración de la Santa Cena en Alianza Puembo. Un ministerio de reverencia y servicio.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/compromiso/mda/santa-cena",
  },
};

export default function SantaCena() {
  const introSectionData = {
    title: "Santa Cena: Un Servicio de Reverencia",
    description: [
      "El ministerio de Santa Cena tiene el privilegio de preparar y servir en uno de los momentos más sagrados de nuestra fe: la conmemoración del sacrificio de Jesús. Con reverencia y dedicación, nos aseguramos de que cada elemento esté listo para que la congregación pueda participar plenamente de este acto de recuerdo y comunión.",
      "Si tienes un corazón sensible y deseas servir en un ambiente de profunda significancia espiritual, te invitamos a unirte a este equipo.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/compromiso/mda/santa-cena/SantaCena.jpg",
    imageAlt: "Elementos de la Santa Cena sobre una mesa",
    imagePosition: "right",
  };

  const rolesData = {
    title: "Nuestras Tareas",
    items: [
      {
        type: "icon",
        iconType: "Grape",
        itemTitle: "Preparación de Elementos",
        itemDescription: "Asegurar que el pan y el jugo estén listos y dispuestos para la celebración.",
      },
      {
        type: "icon",
        iconType: "Handshake",
        itemTitle: "Servicio a la Congregación",
        itemDescription: "Distribuir los elementos a los asistentes de manera ordenada y respetuosa.",
      },
      {
        type: "icon",
        iconType: "HandHelping",
        itemTitle: "Mantenimiento y Limpieza",
        itemDescription: "Cuidar los utensilios y el área de la Santa Cena con diligencia.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Santa Cena"
      description="Un servicio de reverencia y comunión."
      imageUrl="/involucrate/ministerios/servicio/compromiso/mda/santa-cena/SantaCena.jpg"
      imageAlt="Santa Cena"
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
