import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Ministerio de Jóvenes",
  description: "Descubre un espacio dinámico para jóvenes donde pueden crecer en su fe, construir amistades sólidas y encontrar su propósito en Cristo.",
  alternates: {
    canonical: "/ministerios/jovenes",
  },
};

export default function Jovenes() {
  const introSectionData = {
    title: "Conéctate, Crece, Impacta",
    description: [
      "Nuestro Ministerio de Jóvenes es un espacio vibrante y dinámico diseñado para que los jóvenes exploren su fe, construyan relaciones significativas y descubran su propósito en Cristo. Creemos en el potencial de cada joven para transformar su entorno.",
      "Ofrecemos actividades, estudios bíblicos relevantes y eventos diseñados para inspirar y equipar a la próxima generación de líderes. ¡Únete a nuestra comunidad y sé parte de algo grande!",
    ],
    imageUrl: "/ministerios/jovenes/youth-intro.jpg",
    imageAlt: "Jóvenes interactuando en un evento",
    imagePosition: "right",
  };

  const activitiesData = {
    title: "Actividades y Eventos",
    items: [
      {
        type: "image",
        imageUrl: "/ministerios/jovenes/youth-activity-1.jpg",
        imageAlt: "Estudio Bíblico",
        itemTitle: "Estudios Bíblicos",
        itemDescription: "Profundizamos en la Palabra de Dios de manera interactiva y relevante para tu vida diaria.",
      },
      {
        type: "image",
        imageUrl: "/ministerios/jovenes/youth-activity-2.jpg",
        imageAlt: "Noches de Adoración",
        itemTitle: "Noches de Adoración",
        itemDescription: "Momentos especiales para conectar con Dios a través de la música y la alabanza.",
      },
      {
        type: "image",
        imageUrl: "/ministerios/jovenes/youth-activity-3.jpg",
        imageAlt: "Eventos Sociales",
        itemTitle: "Eventos Sociales",
        itemDescription: "Actividades divertidas y recreativas para fortalecer la amistad y la comunidad.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Ministerio de Jóvenes"
      description="Un espacio para crecer en fe, amistad y propósito."
      imageUrl="/ministerios/jovenes/Jovenes.jpg"
      imageAlt="Jóvenes en un campamento"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...activitiesData} />
    </PublicPageLayout>
  );
}
