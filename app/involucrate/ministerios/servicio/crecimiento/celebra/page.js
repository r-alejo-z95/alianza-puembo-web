
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

export const metadata = {
  title: "Celebra",
  description: "Un espacio para celebrar la recuperación de adicciones y una nueva vida en Cristo en Alianza Puembo. Encuentra apoyo, esperanza y libertad.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/crecimiento/celebra",
  },
};

export default function Celebra() {
  const introSectionData = {
    title: "Celebra: Restauración y Nueva Vida",
    description: [
      "Celebra es un ministerio de recuperación basado en principios bíblicos, diseñado para aquellos que luchan con adicciones, heridas emocionales o cualquier hábito destructivo. Creemos que la verdadera libertad se encuentra en Cristo y en el poder de su amor.",
      "Ofrecemos un ambiente seguro y confidencial donde puedes encontrar apoyo, esperanza y las herramientas necesarias para experimentar una recuperación duradera y una nueva vida en abundancia.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/crecimiento/celebra/Celebra.jpg",
    imageAlt: "Grupo de personas en una sesión de apoyo",
    imagePosition: "right",
  };

  const programDetailsData = {
    title: "Nuestro Programa",
    items: [
      {
        type: "icon",
        iconType: "Handshake",
        itemTitle: "Grupos de Apoyo",
        itemDescription: "Sesiones semanales donde compartimos experiencias y nos apoyamos mutuamente.",
      },
      {
        type: "icon",
        iconType: "BookOpen",
        itemTitle: "Principios Bíblicos",
        itemDescription: "Estudio de los 8 principios de recuperación basados en las Bienaventuranzas.",
      },
      {
        type: "icon",
        iconType: "Sparkles",
        itemTitle: "Testimonios de Vida",
        itemDescription: "Historias reales de transformación que inspiran y dan esperanza.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Celebra"
      description="Restauración y nueva vida en Cristo."
      imageUrl="/involucrate/ministerios/servicio/crecimiento/celebra/Celebra.jpg"
      imageAlt="Celebra"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...programDetailsData} />
    </PublicPageLayout>
  );
}
