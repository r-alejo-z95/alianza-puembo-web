
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Evento Cautivante (Mujeres)",
  description: "Un encuentro para mujeres que buscan descubrir su belleza, valor y propósito en Dios, y vivir una vida plena y cautivante.",
  alternates: {
    canonical: "/ministerios/servicio/conexion/eventos/cautivante",
  },
};

export default function Cautivante() {
  const introSectionData = {
    title: "Cautivante: Descubre tu Valor",
    description: [
      "Cautivante es un evento diseñado para inspirar y empoderar a las mujeres. Es un espacio donde cada mujer puede descubrir su verdadera belleza, valor y propósito en Dios, liberándose de las ataduras y viviendo una vida plena y cautivante.",
      "A través de mensajes inspiradores, tiempos de adoración y compañerismo, buscamos que cada mujer se sienta amada, restaurada y fortalecida en su identidad en Cristo.",
    ],
    imageUrl: "/ministerios/servicio/conexion/eventos/cautivante/Cautivante.jpg",
    imageAlt: "Mujeres adorando en un evento",
    imagePosition: "right",
  };

  const eventDetails = {
    title: "¿Qué esperar de Cautivante?",
    items: [
      {
        type: "icon",
        iconType: "Sparkles",
        itemTitle: "Identidad y Propósito",
        itemDescription: "Afirma tu identidad como hija de Dios y el propósito único que Él tiene para ti.",
      },
      {
        type: "icon",
        iconType: "Heart",
        itemTitle: "Sanidad y Restauración",
        itemDescription: "Encuentra sanidad para heridas pasadas y restauración para tu corazón.",
      },
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Comunidad Femenina",
        itemDescription: "Conecta con otras mujeres que te inspirarán y apoyarán en tu caminar de fe.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Evento Cautivante"
      description="Descubre tu belleza, valor y propósito en Dios."
      imageUrl="/ministerios/servicio/conexion/eventos/cautivante/Cautivante.jpg"
      imageAlt="Evento Cautivante"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...eventDetails} />
    </PublicPageLayout>
  );
}
