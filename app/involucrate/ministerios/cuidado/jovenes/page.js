import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Ministerio de Jóvenes",
  description: "Descubre un espacio dinámico para jóvenes donde pueden crecer en su fe, construir amistades sólidas y encontrar su propósito en Cristo.",
  alternates: {
    canonical: "/involucrate/ministerios/cuidado/jovenes",
  },
};

export default function Jovenes() {
  const introSectionData = {
    title: "Conéctate, Crece, Impacta",
    description: [
      "Nuestro Ministerio de Jóvenes es un espacio vibrante y dinámico diseñado para que los jóvenes exploren su fe, construyan relaciones significativas y descubran su propósito en Cristo. Creemos en el potencial de cada joven para transformar su entorno.",
      "Ofrecemos actividades, estudios bíblicos relevantes y eventos diseñados para inspirar y equipar a la próxima generación de líderes. ¡Únete a nuestra comunidad y sé parte de algo grande!",
    ],
    imageUrl: "/involucrate/ministerios/cuidado/jovenes/Jovenes.avif",
    imageAlt: "Jóvenes interactuando en un evento",
    imagePosition: "right",
  };

  const youthGroupsData = {
    title: "Nuestros Grupos",
    items: [
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/cuidado/jovenes/next-wave.avif",
        imageAlt: "Next Wave (12-14)",
        itemTitle: "Next Wave (12-14 años)",
        itemDescription: "El primer paso en la aventura de ser joven. Un espacio para preadolescentes lleno de energía, juegos y fundamentos de la fe.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/cuidado/jovenes/aftershock.avif",
        imageAlt: "Aftershock (15-18)",
        itemTitle: "Aftershock (15-18 años)",
        itemDescription: "Adolescentes que enfrentan los desafíos de la vida con una fe sólida. Un lugar para amistades verdaderas y crecimiento profundo.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/cuidado/jovenes/atmosphere.avif",
        imageAlt: "Atmosphere (19-23)",
        itemTitle: "Atmosphere (19-23 años)",
        itemDescription: "Jóvenes universitarios y profesionales que buscan vivir su fe de manera relevante en el mundo actual.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/cuidado/jovenes/outer.avif",
        imageAlt: "Outer (24-30)",
        itemTitle: "Outer (24-30 años)",
        itemDescription: "Jóvenes adultos que consolidan su propósito y liderazgo, listos para impactar todas las esferas de la sociedad.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Ministerio de Jóvenes"
      description="Un espacio para crecer en fe, amistad y propósito."
      imageUrl="/involucrate/ministerios/cuidado/jovenes/Header.avif"
      imageAlt="Jóvenes en un campamento"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        hierarchy={[{ name: "Cuidado Pastoral", href: "/ministerios/cuidado" }]}
        current="Jóvenes"
        backLink="/ministerios/cuidado" 
        backLabel="Volver a Cuidado Pastoral" 
      />
      <MinistryContentSection {...youthGroupsData} />
    </PublicPageLayout>
  );
}