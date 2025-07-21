
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

export const metadata = {
  title: "Canasta de Amor",
  description: "Entrega de alimentos y víveres a familias en situación de necesidad. Un gesto de amor que alimenta el cuerpo y el alma.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/amor-en-accion/canasta-de-amor",
  },
};

export default function CanastaDeAmor() {
  const introSectionData = {
    title: "Canasta de Amor: Alimentando la Esperanza",
    description: [
      "El proyecto Canasta de Amor se enfoca en la recolección y distribución regular de alimentos y víveres de primera necesidad a familias que enfrentan inseguridad alimentaria. Creemos que nadie debería pasar hambre y que un plato de comida es un acto de amor.",
      "Tu contribución, por pequeña que sea, puede asegurar que una familia tenga alimento en su mesa. Únete a nosotros para llevar sustento y esperanza.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/canasta-de-amor/CanastaDeAmor.jpg",
    imageAlt: "Voluntarios entregando canastas de alimentos",
    imagePosition: "right",
  };

  const projectDetailsData = {
    title: "¿Cómo puedes apoyar?",
    items: [
      {
        type: "icon",
        iconType: "Soup",
        itemTitle: "Donando Alimentos",
        itemDescription: "Alimentos no perecederos como arroz, fideos, enlatados, aceite, etc.",
      },
      {
        type: "icon",
        iconType: "DollarSign",
        itemTitle: "Aportes Económicos",
        itemDescription: "Tu donación nos permite comprar alimentos al por mayor y cubrir necesidades específicas.",
      },
      {
        type: "icon",
        iconType: "Handshake",
        itemTitle: "Voluntariado",
        itemDescription: "Ayúdanos a armar y distribuir las canastas de amor.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Canasta de Amor"
      description="Alimentando la esperanza a través de la Canasta de Amor."
      imageUrl="/involucrate/ministerios/servicio/conexion/amor-en-accion/canasta-de-amor/CanastaDeAmor.jpg"
      imageAlt="Canasta de Amor"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...projectDetailsData} />
    </PublicPageLayout>
  );
}
