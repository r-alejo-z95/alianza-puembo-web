
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Punto de Conexión",
  description: "Eventos y actividades diseñadas para crear oportunidades de evangelismo en Alianza Puembo. Alcanzando a la comunidad de manera creativa.",
  alternates: {
    canonical: "/ministerios/servicio/conexion/redes-de-amor/punto-de-conexion",
  },
};

export default function PuntoDeConexion() {
  const introSectionData = {
    title: "Punto de Conexión: Creando Oportunidades",
    description: [
      "Punto de Conexión es un ministerio que organiza eventos y actividades creativas para generar oportunidades de evangelismo en nuestra comunidad. Creemos que el evangelio puede ser compartido de muchas maneras, adaptándonos a las necesidades y contextos de las personas.",
      "Desde eventos deportivos hasta ferias de salud, buscamos ser un puente para que las personas conozcan el amor de Dios en un ambiente relajado y amigable.",
    ],
    imageUrl: "/ministerios/servicio/conexion/redes-de-amor/punto-de-conexion/PuntoDeConexion.jpg",
    imageAlt: "Evento comunitario con personas interactuando",
    imagePosition: "right",
  };

  const focusAreas = {
    title: "Nuestras Iniciativas",
    items: [
      {
        type: "icon",
        iconType: "Calendar",
        itemTitle: "Eventos Comunitarios",
        itemDescription: "Organización de ferias, conciertos, actividades deportivas y culturales.",
      },
      {
        type: "icon",
        iconType: "MessageSquare",
        itemTitle: "Charlas y Talleres",
        itemDescription: "Espacios para abordar temas relevantes desde una perspectiva cristiana.",
      },
      {
        type: "icon",
        iconType: "Handshake",
        itemTitle: "Colaboración con Organizaciones",
        itemDescription: "Alianzas con entidades locales para ampliar nuestro alcance y impacto.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Punto de Conexión"
      description="Creando oportunidades para compartir el evangelio."
      imageUrl="/ministerios/servicio/conexion/redes-de-amor/punto-de-conexion/PuntoDeConexion.jpg"
      imageAlt="Punto de Conexión"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...focusAreas} />
    </PublicPageLayout>
  );
}
