
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

export const metadata = {
  title: "Evento Eje (Jóvenes)",
  description: "El evento juvenil del año en Alianza Puembo. Un espacio lleno de energía, adoración y un mensaje que marca vidas para la nueva generación.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/eventos/eje",
  },
};

export default function Eje() {
  const introSectionData = {
    title: "Eje: El Punto de Encuentro de la Nueva Generación",
    description: [
      "Eje es el evento juvenil más esperado del año. Es un espacio diseñado para que los jóvenes experimenten la presencia de Dios de una manera poderosa, se conecten con otros jóvenes y sean desafiados a vivir una vida con propósito.",
      "Con música en vivo, oradores inspiradores y un ambiente lleno de energía, Eje es el lugar donde la fe cobra vida para la nueva generación.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/eventos/eje/Eje.jpg",
    imageAlt: "Jóvenes en un concierto de adoración",
    imagePosition: "right",
  };

  const eventDetailsData = {
    title: "¿Qué esperar de Eje?",
    items: [
      {
        type: "icon",
        iconType: "MusicIcon",
        itemTitle: "Adoración Poderosa",
        itemDescription: "Momentos de alabanza y adoración que te conectarán con el corazón de Dios.",
      },
      {
        type: "icon",
        iconType: "Lightbulb",
        itemTitle: "Mensajes Inspiradores",
        itemDescription: "Oradores que desafiarán tu fe y te guiarán a vivir una vida con propósito.",
      },
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Conexión y Amistad",
        itemDescription: "Un ambiente vibrante para conocer nuevos amigos y fortalecer tu comunidad.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Evento Eje"
      description="El evento juvenil del año."
      imageUrl="/involucrate/ministerios/servicio/conexion/eventos/eje/Eje.jpg"
      imageAlt="Evento Eje"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...eventDetailsData} />
    </PublicPageLayout>
  );
}
