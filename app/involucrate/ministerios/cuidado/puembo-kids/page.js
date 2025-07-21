import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

export const metadata = {
  title: "Puembo Kids",
  description: "Puembo Kids es nuestro ministerio para niños, un lugar lleno de diversión, seguridad y enseñanza bíblica para que los más pequeños conozcan a Jesús.",
  alternates: {
    canonical: "/involucrate/ministerios/cuidado/puembo-kids",
  },
};

export default function PuemboKids() {
  const introSectionData = {
    title: "Diversión y Aprendizaje para los Más Pequeños",
    description: [
      "Puembo Kids es un ministerio vibrante y seguro diseñado para que los niños de todas las edades aprendan sobre Jesús de una manera divertida y relevante. Creemos en la importancia de sembrar la semilla de la fe desde la infancia.",
      "A través de juegos, historias bíblicas, música y actividades creativas, buscamos ayudarles a crecer en su relación con Dios y a desarrollar valores cristianos. ¡Tus hijos amarán ser parte de Puembo Kids!",
    ],
    imageUrl: "/involucrate/ministerios/puembo-kids/puembo-kids-intro.jpg",
    imageAlt: "Niños jugando y aprendiendo",
    imagePosition: "right",
  };

  const kidsGroupsData = {
    title: "Nuestras Clases por Edades",
    items: [
      {
        type: "icon",
        iconType: "Baby",
        itemTitle: "Sala Cuna (0-3 años)",
        itemDescription: "Un ambiente seguro y lleno de amor para los más pequeños.",
      },
      {
        type: "icon",
        iconType: "Palette",
        itemTitle: "Mini Kids (3-5 años)",
        itemDescription: "Aprendizaje a través del juego, canciones y manualidades.",
      },
      {
        type: "icon",
        iconType: "Footprints",
        itemTitle: "Caminantes (5-7 años)",
        itemDescription: "Dando sus primeros pasos en la fe y el conocimiento de la Biblia.",
      },
      {
        type: "icon",
        iconType: "Search",
        itemTitle: "Indagadores (7-9 años)",
        itemDescription: "Explorando las grandes historias de la Biblia y haciendo preguntas.",
      },
      {
        type: "icon",
        iconType: "Compass",
        itemTitle: "Exploradores (9-11 años)",
        itemDescription: "Descubriendo su identidad en Cristo y cómo vivir su fe.",
      },
      {
        type: "icon",
        iconType: "LinkIcon",
        itemTitle: "Conecta2 (11-12 años)",
        itemDescription: "Un puente hacia la adolescencia, conectando la fe con sus vidas.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Puembo Kids"
      description="Un espacio divertido y seguro para que los más pequeños aprendan de Jesús."
      imageUrl="/involucrate/ministerios/puembo-kids/Puembo-kids.jpg"
      imageAlt="Celebración de Puembo Kids"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...kidsGroupsData} />
    </PublicPageLayout>
  );
}