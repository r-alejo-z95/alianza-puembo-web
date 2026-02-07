
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Evento Alma (Matrimonios)",
  description: "Fortalece tu matrimonio en nuestro evento Alma. Un tiempo para reconectar, crecer y avivar la llama del amor.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/eventos/alma",
  },
};

export default function Alma() {
  const introSectionData = {
    title: "Alma: Uniendo Corazones",
    description: [
      "Alma es nuestro evento anual para matrimonios. Es un tiempo especial, lejos de la rutina, para que las parejas puedan reconectar, fortalecer su relación y recibir herramientas prácticas para construir un matrimonio sólido y duradero.",
      "A través de conferencias, talleres y tiempos de calidad, buscamos equipar a los matrimonios para que reflejen el amor de Cristo.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/eventos/alma/Alma.avif",
    imageAlt: "Pareja de esposos abrazados y sonriendo",
    imagePosition: "right",
  };

  const eventDetailsData = {
    title: "¿Qué esperar de Alma?",
    items: [
      {
        type: "icon",
        iconType: "Heart",
        itemTitle: "Renovación y Conexión",
        itemDescription: "Tiempo de calidad para enfocarse el uno en el otro y fortalecer la intimidad.",
      },
      {
        type: "icon",
        iconType: "BookOpen",
        itemTitle: "Enseñanza Práctica",
        itemDescription: "Principios bíblicos y herramientas prácticas para los desafíos del matrimonio.",
      },
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Comunidad",
        itemDescription: "Comparte con otras parejas que también buscan honrar a Dios con su matrimonio.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Evento Alma"
      description="Fortaleciendo matrimonios para la gloria de Dios."
      imageUrl="/involucrate/ministerios/servicio/conexion/eventos/alma/header.avif"
      imageAlt="Evento Alma"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        backLink="/ministerios/eventos-conexion" 
        backLabel="Volver a Eventos" 
      />
      <MinistryContentSection {...eventDetailsData} />
    </PublicPageLayout>
  );
}
