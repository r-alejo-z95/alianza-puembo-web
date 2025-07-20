
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Sanidad",
  description: "Encuentros de sanidad interior y liberación en Alianza Puembo. Un espacio seguro para hombres y mujeres que buscan restauración y plenitud.",
  alternates: {
    canonical: "/ministerios/servicio/crecimiento/sanidad",
  },
};

export default function Sanidad() {
  const introSectionData = {
    title: "Sanidad: Restaurando el Corazón",
    description: [
      "El ministerio de Sanidad ofrece un espacio seguro y confidencial para aquellos que buscan sanidad interior y liberación de heridas del pasado. Creemos en el poder restaurador de Dios para traer plenitud a cada área de nuestras vidas.",
      "A través de encuentros específicos para hombres y mujeres, y el acompañamiento de líderes capacitados, te guiamos en un proceso de perdón, liberación y restauración.",
    ],
    imageUrl: "/ministerios/servicio/crecimiento/sanidad/Sanidad.jpg",
    imageAlt: "Personas orando por sanidad",
    imagePosition: "right",
  };

  const programDetails = {
    title: "Nuestro Enfoque",
    items: [
      {
        type: "icon",
        iconType: "Heart",
        itemTitle: "Sanidad Interior",
        itemDescription: "Abordamos heridas emocionales, traumas y patrones negativos del pasado.",
      },
      {
        type: "icon",
        iconType: "Sparkles",
        itemTitle: "Liberación",
        itemDescription: "Ayudamos a romper ataduras espirituales y a vivir en la libertad de Cristo.",
      },
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Grupos de Apoyo",
        itemDescription: "Espacios de confidencialidad y apoyo mutuo para el proceso de sanidad.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Sanidad"
      description="Restaurando el corazón y viviendo en plenitud."
      imageUrl="/ministerios/servicio/crecimiento/sanidad/Sanidad.jpg"
      imageAlt="Sanidad"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...programDetails} />
    </PublicPageLayout>
  );
}
