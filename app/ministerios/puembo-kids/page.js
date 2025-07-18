import { PuemboKidsActivitiesSection } from "@/components/public/layout/pages/ministerios/puembo-kids/PuemboKidsActivitiesSection";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";

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

  return (
    <PublicPageLayout
      title="Puembo Kids"
      description="Un espacio divertido y seguro para que los más pequeños aprendan de Jesús."
      imageUrl="/ministerios/puembo-kids/Puembo-kids.jpg"
      imageAlt="Celebración de Puembo Kids"
      introSectionData={introSectionData}
    >
      <PuemboKidsActivitiesSection />
    </PublicPageLayout>
  );
}
