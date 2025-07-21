
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

export const metadata = {
  title: "Ropero",
  description: "Donación y distribución de ropa, calzado y artículos de primera necesidad a familias y personas en situación de vulnerabilidad.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/amor-en-accion/ropero",
  },
};

export default function Ropero() {
  const introSectionData = {
    title: "Ropero: Vistiendo con Dignidad",
    description: [
      "El Ropero de Alianza Puembo es un proyecto de servicio que recolecta y distribuye ropa, calzado y artículos de primera necesidad a familias y personas en situación de vulnerabilidad. Creemos que vestir con dignidad es un paso importante para restaurar la autoestima y la esperanza.",
      "Tu donación puede hacer una gran diferencia en la vida de alguien. Únete a nosotros en esta labor de amor.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/ropero/Ropero.jpg",
    imageAlt: "Ropa organizada para donación",
    imagePosition: "right",
  };

  const projectDetailsData = {
    title: "¿Cómo puedes ayudar?",
    items: [
      {
        type: "icon",
        iconType: "Shirt",
        itemTitle: "Donando Ropa y Calzado",
        itemDescription: "Aceptamos ropa en buen estado para todas las edades y tallas.",
      },
      {
        type: "icon",
        iconType: "Baby",
        itemTitle: "Artículos para Bebés",
        itemDescription: "Pañales, ropa de bebé, juguetes y accesorios.",
      },
      {
        type: "icon",
        iconType: "Handshake",
        itemTitle: "Voluntariado",
        itemDescription: "Ayúdanos a clasificar, organizar y distribuir las donaciones.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Ropero"
      description="Donando ropa y dignidad a quienes lo necesitan."
      imageUrl="/involucrate/ministerios/servicio/conexion/amor-en-accion/ropero/Ropero.jpg"
      imageAlt="Ropero"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...projectDetailsData} />
    </PublicPageLayout>
  );
}
