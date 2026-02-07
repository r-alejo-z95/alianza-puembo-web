
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "GP Juntas (Mujeres)",
  description: "Grupos Pequeños para mujeres en Alianza Puembo. Un espacio para crecer juntas en fe, amistad y propósito.",
  alternates: {
    canonical: "/involucrate/ministerios/cuidado/grupos-pequenos/juntas",
  },
};

export default function GPJuntas() {
  const introSectionData = {
    title: "GP Juntas: Creciendo en Comunidad",
    description: [
      "Juntas es nuestro ministerio de grupos pequeños para mujeres. Ofrecemos un ambiente cálido y de apoyo donde las mujeres pueden conectar, compartir sus vidas, y crecer en su relación con Dios y entre ellas.",
      "Creemos que juntas somos más fuertes. Te invitamos a ser parte de esta comunidad de mujeres que se aman, se animan y sirven a Dios con pasión.",
    ],
    imageUrl: "/involucrate/ministerios/cuidado/grupos-pequenos/juntas/Juntas.avif",
    imageAlt: "Mujeres compartiendo y riendo juntas",
    imagePosition: "right",
  };

  const focusAreas = {
    title: "Áreas de Enfoque",
    items: [
      {
        type: "icon",
        iconType: "Heart",
        itemTitle: "Amistad y Apoyo",
        itemDescription: "Construimos relaciones significativas y nos apoyamos en las diferentes temporadas de la vida.",
      },
      {
        type: "icon",
        iconType: "Sparkles",
        itemTitle: "Identidad y Propósito",
        itemDescription: "Descubrimos nuestro valor en Cristo y el propósito único que Dios tiene para cada una.",
      },
      {
        type: "icon",
        iconType: "BookOpen",
        itemTitle: "Crecimiento Espiritual",
        itemDescription: "Estudiamos la Palabra de Dios juntas, aplicándola a nuestros corazones y vidas.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="GP Juntas (Mujeres)"
      description="Creciendo juntas en fe, amistad y propósito."
      imageUrl="/involucrate/ministerios/cuidado/grupos-pequenos/juntas/header.avif"
      imageAlt="GP Juntas"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        backLink="/ministerios/grupos-pequenos" 
        backLabel="Volver a Grupos Pequeños" 
      />
      <MinistryContentSection {...focusAreas} />
    </PublicPageLayout>
  );
}
