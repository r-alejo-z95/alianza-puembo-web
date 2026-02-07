
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Punto Conexión",
  description: "El puente diseñado para que las personas nuevas se integren, conozcan nuestra visión y se unan a nuestra familia de fe en Alianza Puembo.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/redes-de-amor/punto-de-conexion",
  },
};

export default function PuntoDeConexion() {
  const introSectionData = {
    title: "Punto Conexión: Tu Puerta a la Comunidad",
    description: [
      "Punto Conexión es el puente diseñado específicamente para que las personas nuevas se integren con facilidad a nuestra comunidad.",
      "Nuestra razón de ser es ayudarte a conocer nuestra visión, resolver tus dudas y facilitarte el camino para que te sientas parte de esta familia de familias desde el primer día.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/redes-de-amor/punto-de-conexion/PuntoDeConexion.avif",
    imageAlt: "Punto Conexión",
    imagePosition: "right",
  };

  const programDetailsData = {
    title: "Nuestra Labor",
    items: [
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Integración",
        itemDescription: "Facilitamos el proceso para que dejes de ser un visitante y te conviertas en parte de la familia.",
      },
      {
        type: "icon",
        iconType: "Compass",
        itemTitle: "Visión y Valores",
        itemDescription: "Te compartimos el corazón de nuestra iglesia y cómo caminamos juntos.",
      },
      {
        type: "icon",
        iconType: "Footprints",
        itemTitle: "Pasos Siguientes",
        itemDescription: "Te orientamos sobre los ministerios y actividades donde puedes comenzar tu crecimiento.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Punto Conexión"
      description="Conecta personas nuevas con la comunidad."
      imageUrl="/involucrate/ministerios/servicio/conexion/redes-de-amor/punto-de-conexion/header.avif"
      imageAlt="Punto Conexión"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        hierarchy={[
          { name: "Servicio", href: "/ministerios/servicio" },
          { name: "Conexión", href: "/ministerios/conexion" },
          { name: "Redes de Amor", href: "/ministerios/redes-de-amor" }
        ]}
        current="Punto Conexión"
        backLink="/ministerios/redes-de-amor" 
        backLabel="Volver a Redes de Amor" 
      />
      <MinistryContentSection {...programDetailsData} />
    </PublicPageLayout>
  );
}
