
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Anfitriones",
  description: "Recibiendo y dando la bienvenida a cada persona que llega a la iglesia. El primer rostro de Alianza Puembo.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/compromiso/mda/anfitriones",
  },
};

export default function Anfitriones() {
  const introSectionData = {
    title: "Anfitriones: La Primera Impresión",
    description: [
      "El equipo de Anfitriones es el primer rostro de Alianza Puembo. Son quienes reciben con una sonrisa y una palabra de bienvenida a cada persona que llega a nuestros servicios y eventos. Su calidez y disposición hacen que todos se sientan en casa desde el primer momento.",
      "Si te gusta interactuar con la gente, tienes una actitud de servicio y deseas hacer que cada visitante se sienta amado y valorado, este es tu lugar.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/compromiso/mda/anfitriones/Anfitriones.jpg",
    imageAlt: "Anfitriones dando la bienvenida a la iglesia",
    imagePosition: "right",
  };

  const rolesData = {
    title: "Nuestras Funciones",
    items: [
      {
        type: "icon",
        iconType: "Smile",
        itemTitle: "Bienvenida y Orientación",
        itemDescription: "Recibir a los asistentes, orientarlos a sus asientos y responder preguntas básicas.",
      },
      {
        type: "icon",
        iconType: "Handshake",
        itemTitle: "Asistencia General",
        itemDescription: "Ayudar a personas con necesidades especiales y mantener el orden en el auditorio.",
      },
      {
        type: "icon",
        iconType: "Heart",
        itemTitle: "Crear un Ambiente Cálido",
        itemDescription: "Asegurar que cada persona se sienta amada, valorada y parte de la familia.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Anfitriones"
      description="La primera impresión de Alianza Puembo."
      imageUrl="/involucrate/ministerios/servicio/compromiso/mda/anfitriones/Anfitriones.jpg"
      imageAlt="Anfitriones"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        backLink="/ministerios/mda" 
        backLabel="Volver a MDA" 
      />
      <MinistryContentSection {...rolesData} />
    </PublicPageLayout>
  );
}
