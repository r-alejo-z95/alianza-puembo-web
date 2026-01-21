
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Crecimiento",
  description: "Fomenta tu madurez espiritual en Alianza Puembo con la Academia Bíblica, Decisiones, Cultura Financiera y Encuentros de Sanidad.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/crecimiento",
  },
};

export default function Crecimiento() {
  const introSectionData = {
    title: "Herramientas para tu Crecimiento Espiritual",
    description: [
      "El crecimiento espiritual es un viaje continuo. Nuestros ministerios de Crecimiento están diseñados para equiparte con el conocimiento, las herramientas y el apoyo que necesitas para profundizar tu relación con Dios y vivir una vida plenamente transformada.",
      "Desde estudios bíblicos profundos hasta espacios de sanidad y restauración emocional, te ofrecemos un camino claro para tu desarrollo espiritual y personal.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/crecimiento/Crecimiento.jpg",
    imageAlt: "Persona estudiando la Biblia con atención",
    imagePosition: "right",
  };

  const growthMinistriesData = {
    title: "Áreas de Crecimiento",
    items: [
      {
        type: "link",
        href: "/ministerios/academia-biblica",
        itemTitle: "Academia Bíblica",
        itemDescription: "Cursos y seminarios para profundizar en el conocimiento de la Palabra de Dios.",
      },
      {
        type: "link",
        href: "/ministerios/decisiones",
        itemTitle: "Decisiones",
        itemDescription: "Un paso de fe para celebrar la recuperación y una nueva vida en Cristo.",
      },
      {
        type: "link",
        href: "/ministerios/cultura-financiera",
        itemTitle: "Cultura Financiera",
        itemDescription: "Principios bíblicos para administrar tus finanzas con sabiduría y propósito.",
      },
      {
        type: "link",
        href: "/ministerios/sanidad",
        itemTitle: "Encuentros de Sanidad",
        itemDescription: "Restauración y libertad interior para hombres y mujeres.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Crecimiento"
      description="Fomentando la madurez espiritual y el discipulado."
      imageUrl="/involucrate/ministerios/servicio/crecimiento/Crecimiento.jpg"
      imageAlt="Ministerios de Crecimiento"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        backLink="/ministerios/servicio" 
        backLabel="Volver a Servicio" 
      />
      <MinistryContentSection {...growthMinistriesData} />
    </PublicPageLayout>
  );
}
