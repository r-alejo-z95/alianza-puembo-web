
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Boutique de Moda Circular",
  description: "Un enfoque digno y sostenible para vestir a nuestra comunidad, promoviendo la generosidad y el cuidado del medio ambiente.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/amor-en-accion/ropero",
  },
};

export default function BoutiqueModaCircular() {
  const introSectionData = {
    title: "Boutique de Moda Circular: Vistiendo con Dignidad",
    description: [
      "Nuestra Boutique de Moda Circular es mucho más que un lugar de donación; es un espacio diseñado para honrar a las personas.",
      "Bajo un enfoque de sostenibilidad y dignidad, recolectamos y distribuimos prendas de vestir de alta calidad, promoviendo la generosidad y el cuidado de los recursos que Dios nos ha dado.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/ropero/Ropero.avif",
    imageAlt: "Boutique de Moda Circular",
    imagePosition: "right",
  };

  const projectDetailsData = {
    title: "Nuestro Enfoque",
    items: [
      {
        type: "icon",
        iconType: "Sparkles",
        itemTitle: "Moda Circular",
        itemDescription: "Damos una segunda vida a prendas en excelente estado, cuidando nuestro entorno.",
      },
      {
        type: "icon",
        iconType: "Shirt",
        itemTitle: "Dignidad Humana",
        itemDescription: "Seleccionamos lo mejor para que cada persona se sienta valorada y respetada.",
      },
      {
        type: "icon",
        iconType: "Handshake",
        itemTitle: "Generosidad",
        itemDescription: "Un puente entre quienes desean dar y quienes necesitan recibir con amor.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Boutique de Moda Circular"
      description="Vistiendo con dignidad y sostenibilidad."
      imageUrl="/involucrate/ministerios/servicio/conexion/amor-en-accion/ropero/header.avif"
      imageAlt="Boutique de Moda Circular"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        backLink="/ministerios/amor-en-accion" 
        backLabel="Volver a Amor en Acción" 
      />
      <MinistryContentSection {...projectDetailsData} />
    </PublicPageLayout>
  );
}
