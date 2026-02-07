
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "GP Familiares",
  description: "Grupos Pequeños Familiares en Alianza Puembo. Conéctate, crece y comprométete en comunidad.",
  alternates: {
    canonical: "/involucrate/ministerios/cuidado/grupos-pequenos/familiar",
  },
};

export default function GPFamiliares() {
  const introSectionData = {
    title: "GP Familiares: Creciendo Juntos",
    description: [
      "Los Grupos Pequeños Familiares son el corazón de nuestra iglesia. Son espacios donde las familias y personas de todas las edades se reúnen para compartir la vida, estudiar la Palabra y apoyarse mutuamente.",
      "Creemos en un modelo de crecimiento integral que abarca tres áreas clave: Conexión, Crecimiento y Compromiso.",
    ],
    imageUrl: "/involucrate/ministerios/cuidado/grupos-pequenos/familiar/Familiar.avif",
    imageAlt: "Familias compartiendo en un grupo pequeño",
    imagePosition: "right",
  };

  const sectionsData = {
    title: "Nuestro Enfoque",
    items: [
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Conexión",
        itemDescription: "Fomentamos relaciones auténticas y un ambiente de confianza donde todos son bienvenidos. Es el primer paso para integrarte a la familia de la fe.",
      },
      {
        type: "icon",
        iconType: "BookOpen",
        itemTitle: "Crecimiento",
        itemDescription: "Profundizamos en el estudio de la Biblia, aplicando sus verdades a nuestra vida diaria para crecer en nuestra relación con Dios.",
      },
      {
        type: "icon",
        iconType: "HeartHandshake",
        itemTitle: "Compromiso",
        itemDescription: "Animamos a cada miembro a usar sus dones para servir a otros, tanto dentro del grupo como en la comunidad, multiplicando el amor de Cristo.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="GP Familiares"
      description="Conéctate, crece y comprométete en comunidad."
      imageUrl="/involucrate/ministerios/cuidado/grupos-pequenos/familiar/header.avif"
      imageAlt="Grupos Pequeños Familiares"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        backLink="/ministerios/grupos-pequenos" 
        backLabel="Volver a Grupos Pequeños" 
      />
      <MinistryContentSection {...sectionsData} />
    </PublicPageLayout>
  );
}
