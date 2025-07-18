import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Puembo Kids",
  description: "Puembo Kids es nuestro ministerio para niños, un lugar lleno de diversión, seguridad y enseñanza bíblica para que los más pequeños conozcan a Jesús.",
  alternates: {
    canonical: "/ministerios/puembo-kids",
  },
};

export default function PuemboKids() {
  const introSectionData = {
    title: "Diversión y Aprendizaje para los Más Pequeños",
    description: [
      "Puembo Kids es un ministerio vibrante y seguro diseñado para que los niños de todas las edades aprendan sobre Jesús de una manera divertida y relevante. Creemos en la importancia de sembrar la semilla de la fe desde la infancia.",
      "A través de juegos, historias bíblicas, música y actividades creativas, buscamos ayudarles a crecer en su relación con Dios y a desarrollar valores cristianos. ¡Tus hijos amarán ser parte de Puembo Kids!",
    ],
    imageUrl: "/ministerios/puembo-kids/puembo-kids-intro.jpg",
    imageAlt: "Niños jugando y aprendiendo",
    imagePosition: "right",
  };

  const activitiesData = {
    title: "Nuestras Actividades",
    items: [
      {
        type: "image",
        imageUrl: "/ministerios/puembo-kids/puembo-kids-activity-1.jpg",
        imageAlt: "Clases Bíblicas",
        itemTitle: "Clases Bíblicas",
        itemDescription: "Enseñanza de la Palabra de Dios adaptada a cada edad, con dinámicas y juegos.",
      },
      {
        type: "image",
        imageUrl: "/ministerios/puembo-kids/puembo-kids-activity-2.jpg",
        imageAlt: "Juegos y Recreación",
        itemTitle: "Juegos y Recreación",
        itemDescription: "Actividades lúdicas que fomentan la amistad, el trabajo en equipo y el desarrollo integral.",
      },
      {
        type: "image",
        imageUrl: "/ministerios/puembo-kids/puembo-kids-activity-3.jpg",
        imageAlt: "Eventos Especiales",
        itemTitle: "Eventos Especiales",
        itemDescription: "Celebraciones, campamentos y salidas diseñadas para crear recuerdos inolvidables.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Puembo Kids"
      description="Un espacio divertido y seguro para que los más pequeños aprendan de Jesús."
      imageUrl="/ministerios/puembo-kids/Puembo-kids.jpg"
      imageAlt="Celebración de Puembo Kids"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...activitiesData} />
    </PublicPageLayout>
  );
}
