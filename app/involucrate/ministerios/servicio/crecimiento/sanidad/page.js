
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

export const metadata = {
  title: "Encuentros de Sanidad para hombres y mujeres",
  description: "Espacios de restauración y plenitud para hombres y mujeres que buscan sanidad interior y liberación a través del amor de Dios.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/crecimiento/sanidad",
  },
};

export default function Sanidad() {
  const introSectionData = {
    title: "Encuentros de Sanidad para hombres y mujeres",
    description: [
      "Nuestros Encuentros de Sanidad son espacios seguros y confidenciales diseñados tanto para hombres como para mujeres que buscan restauración y plenitud.",
      "Creemos en el poder transformador de Dios para sanar las heridas del pasado, brindar libertad emocional y fortalecer nuestra identidad en Cristo.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/crecimiento/sanidad/Sanidad.jpg",
    imageAlt: "Encuentros de Sanidad",
    imagePosition: "right",
  };

  const programDetailsData = {
    title: "Nuestro Enfoque",
    items: [
      {
        type: "icon",
        iconType: "Heart",
        itemTitle: "Sanidad Interior",
        itemDescription: "Procesos guiados para encontrar sanidad en las áreas más profundas del corazón.",
      },
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Hombres y Mujeres",
        itemDescription: "Grupos segmentados para abordar las necesidades específicas de cada género.",
      },
      {
        type: "icon",
        iconType: "Sparkles",
        itemTitle: "Plenitud en Dios",
        itemDescription: "Buscamos que cada persona camine en la libertad y propósito que Dios le ha dado.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Encuentros de Sanidad para hombres y mujeres"
      description="Restaurando el corazón a través del amor de Dios."
      imageUrl="/involucrate/ministerios/servicio/crecimiento/sanidad/Sanidad.jpg"
      imageAlt="Encuentros de Sanidad"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...programDetailsData} />
    </PublicPageLayout>
  );
}
