
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Decisiones",
  description: "Un espacio de fe y restauración enfocado en el paso de fe necesario para una vida transformada en Cristo.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/crecimiento/celebra",
  },
};

export default function Decisiones() {
  const introSectionData = {
    title: "Decisiones: Restauración y Nueva Vida",
    description: [
      "Decisiones es un ministerio enfocado en el paso de fe más importante: elegir la libertad que solo Cristo ofrece.",
      "Es un espacio diseñado para aquellos que buscan restaurar su vida de adicciones, hábitos destructivos o heridas emocionales, tomando la decisión valiente de caminar hacia una plenitud espiritual.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/crecimiento/celebra/Celebra.jpg",
    imageAlt: "Decisiones",
    imagePosition: "right",
  };

  const programDetailsData = {
    title: "Nuestro Proceso",
    items: [
      {
        type: "icon",
        iconType: "Footprints",
        itemTitle: "Paso de Fe",
        itemDescription: "Todo cambio real comienza con una decisión intencional de seguir a Jesús.",
      },
      {
        type: "icon",
        iconType: "Sparkles",
        itemTitle: "Restauración",
        itemDescription: "Procesos bíblicos para sanar heridas y romper patrones de hábitos destructivos.",
      },
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Comunidad de Apoyo",
        itemDescription: "Un entorno seguro donde caminar junto a otros en la misma ruta de libertad.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Decisiones"
      description="El paso de fe para una vida restaurada."
      imageUrl="/involucrate/ministerios/servicio/crecimiento/celebra/Celebra.jpg"
      imageAlt="Decisiones"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        backLink="/ministerios/servicio" 
        backLabel="Volver a Crecimiento" 
      />
      <MinistryContentSection {...programDetailsData} />
    </PublicPageLayout>
  );
}
