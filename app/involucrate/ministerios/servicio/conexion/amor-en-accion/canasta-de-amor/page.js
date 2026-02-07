
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Canasta de Amor",
  description: "Un programa de apoyo solidario y provisión de alimentos, dedicado exclusivamente a los miembros de nuestra familia de fe en Alianza Puembo.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/amor-en-accion/canasta-de-amor",
  },
};

export default function CanastaDeAmor() {
  const introSectionData = {
    title: "Canasta de Amor: Solidaridad en Familia",
    description: [
      "La Canasta de Amor es un programa de apoyo solidario y provisión, dedicado exclusivamente a los miembros de nuestra familia de fe.",
      "Como comunidad, nos cuidamos unos a otros, asegurando que ninguna familia de nuestra iglesia carezca de lo esencial para su sustento diario.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/canasta-de-amor/CanastaDeAmor.avif",
    imageAlt: "Canasta de Amor",
    imagePosition: "right",
  };

  const projectDetailsData = {
    title: "Nuestro Compromiso",
    items: [
      {
        type: "icon",
        iconType: "ShieldCheck",
        itemTitle: "Exclusivo para Miembros",
        itemDescription: "Un beneficio directo para quienes forman parte de nuestra familia de fe activa.",
      },
      {
        type: "icon",
        iconType: "HeartHandshake",
        itemTitle: "Apoyo en Familia",
        itemDescription: "Damos por gracia lo que recibimos, cuidando la provisión de cada hermano.",
      },
      {
        type: "icon",
        iconType: "Soup",
        itemTitle: "Sustento Diario",
        itemDescription: "Recolección y distribución de víveres esenciales para familias con necesidades temporales.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Canasta de Amor"
      description="Exclusivo para miembros de la iglesia."
      imageUrl="/involucrate/ministerios/servicio/conexion/amor-en-accion/canasta-de-amor/header.avif"
      imageAlt="Canasta de Amor"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        hierarchy={[
          { name: "Servicio", href: "/ministerios/servicio" },
          { name: "Conexión", href: "/ministerios/conexion" },
          { name: "Amor en Acción", href: "/ministerios/amor-en-accion" }
        ]}
        current="Canasta de Amor"
        backLink="/ministerios/amor-en-accion" 
        backLabel="Volver a Amor en Acción" 
      />
      <MinistryContentSection {...projectDetailsData} />
    </PublicPageLayout>
  );
}
