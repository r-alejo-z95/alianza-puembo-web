
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Navidad Digna",
  description: "Nuestra celebración especial de generosidad que ocurre una vez al año para bendecir a otros y compartir el amor de Cristo.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/amor-en-accion/navidad-digna",
  },
};

export default function NavidadDigna() {
  const introSectionData = {
    title: "Navidad Digna: Compartiendo la Alegría",
    description: [
      "Navidad Digna es nuestra celebración especial de generosidad que une a la iglesia una vez al año para bendecir a otros.",
      "Es un proyecto de amor donde buscamos llevar el verdadero significado de la Navidad a niños y familias en situación de vulnerabilidad, demostrando que en Cristo siempre hay esperanza.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/navidad-digna/NavidadDigna.avif",
    imageAlt: "Navidad Digna",
    imagePosition: "right",
  };

  const projectDetailsData = {
    title: "Nuestro Impacto",
    items: [
      {
        type: "icon",
        iconType: "Calendar",
        itemTitle: "Una Vez al Año",
        itemDescription: "Nos unimos en la temporada navideña para un impacto masivo de amor y servicio.",
      },
      {
        type: "icon",
        iconType: "Gift",
        itemTitle: "Dignidad y Amor",
        itemDescription: "Cada regalo y actividad está diseñada para honrar y dignificar a quienes reciben.",
      },
      {
        type: "icon",
        iconType: "Heart",
        itemTitle: "Impacto Comunitario",
        itemDescription: "Llegamos a sectores vulnerables con el mensaje de esperanza del Evangelio.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Navidad Digna"
      description="Ocurre una vez al año."
      imageUrl="/involucrate/ministerios/servicio/conexion/amor-en-accion/navidad-digna/header.avif"
      imageAlt="Navidad Digna"
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
