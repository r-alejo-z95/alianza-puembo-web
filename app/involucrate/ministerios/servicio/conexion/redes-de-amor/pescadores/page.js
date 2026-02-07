
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Pescadores",
  description: "Grupos de evangelismo personal y relacional en Alianza Puembo. Capacitación y práctica para compartir el evangelio de manera efectiva.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/redes-de-amor/pescadores",
  },
};

export default function Pescadores() {
  const introSectionData = {
    title: "Pescadores: Sembrando la Palabra",
    description: [
      "Pescadores es un ministerio dedicado a equipar a los creyentes para el evangelismo personal y relacional. Creemos que cada cristiano es llamado a ser un pescador de hombres, compartiendo el amor de Cristo en su esfera de influencia.",
      "Ofrecemos capacitación práctica, herramientas y acompañamiento para que te sientas seguro y efectivo al compartir tu fe con amigos, familiares y colegas.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/redes-de-amor/pescadores/Pescadores.avif",
    imageAlt: "Persona compartiendo el evangelio uno a uno",
    imagePosition: "right",
  };

  const focusAreasData = {
    title: "Nuestro Enfoque",
    items: [
      {
        type: "icon",
        iconType: "BookOpen",
        itemTitle: "Capacitación Bíblica",
        itemDescription: "Estudio de principios bíblicos para el evangelismo y la apologética.",
      },
      {
        type: "icon",
        iconType: "MessageSquare",
        itemTitle: "Habilidades de Comunicación",
        itemDescription: "Desarrollo de técnicas para iniciar conversaciones espirituales y presentar el evangelio.",
      },
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Práctica y Acompañamiento",
        itemDescription: "Salidas prácticas y mentoría para aplicar lo aprendido en situaciones reales.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Pescadores"
      description="Equipando para el evangelismo personal y relacional."
      imageUrl="/involucrate/ministerios/servicio/conexion/redes-de-amor/pescadores/header.avif"
      imageAlt="Pescadores"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        backLink="/ministerios/redes-de-amor" 
        backLabel="Volver a Redes de Amor" 
      />
      <MinistryContentSection {...focusAreasData} />
    </PublicPageLayout>
  );
}
