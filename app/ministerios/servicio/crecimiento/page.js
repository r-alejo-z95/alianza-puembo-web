
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Crecimiento",
  description: "Fomenta tu madurez espiritual en Alianza Puembo con la Academia Bíblica, Celebra, Cultura Financiera y ministerios de Sanidad.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/crecimiento",
  },
};

export default function Crecimiento() {
  const introSectionData = {
    title: "Herramientas para tu Crecimiento Espiritual",
    description: [
      "El crecimiento espiritual es un viaje continuo. Nuestros ministerios de Crecimiento están diseñados para equiparte con el conocimiento, las herramientas y el apoyo que necesitas para profundizar tu relación con Dios y vivir una vida transformada.",
      "Desde estudios bíblicos profundos hasta programas de sanidad y restauración, te ofrecemos un camino claro para tu desarrollo espiritual.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/crecimiento/Crecimiento.jpg",
    imageAlt: "Persona estudiando la Biblia con atención",
    imagePosition: "right",
  };

  const growthMinistries = {
    title: "Áreas de Crecimiento",
    items: [
      {
        type: "link",
        href: "/ministerios/servicio/crecimiento/academia-biblica",
        itemTitle: "Academia Bíblica",
        itemDescription: "Cursos y seminarios para profundizar en el conocimiento de la Palabra de Dios.",
      },
      {
        type: "link",
        href: "/ministerios/servicio/crecimiento/celebra",
        itemTitle: "Celebra",
        itemDescription: "Un espacio para celebrar la recuperación de adicciones y una nueva vida en Cristo.",
      },
      {
        type: "link",
        href: "/ministerios/servicio/crecimiento/cultura-financiera",
        itemTitle: "Cultura Financiera",
        itemDescription: "Principios bíblicos para administrar tus finanzas con sabiduría y propósito.",
      },
      {
        type: "link",
        href: "/ministerios/servicio/crecimiento/sanidad",
        itemTitle: "Sanidad",
        itemDescription: "Encuentros de sanidad interior y liberación para hombres y mujeres.",
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
      <MinistryContentSection {...growthMinistries} />
    </PublicPageLayout>
  );
}
