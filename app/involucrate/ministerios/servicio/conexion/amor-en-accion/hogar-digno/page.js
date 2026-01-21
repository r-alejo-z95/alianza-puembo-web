
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Hogar Digno",
  description: "Apoyo para mejorar las condiciones de vivienda de familias necesitadas. Transformando espacios en hogares de esperanza.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/amor-en-accion/hogar-digno",
  },
};

export default function HogarDigno() {
  const introSectionData = {
    title: "Hogar Digno: Construyendo Esperanza",
    description: [
      "Hogar Digno es un proyecto que busca mejorar las condiciones de vivienda de familias en situación de vulnerabilidad. Creemos que un hogar seguro y digno es fundamental para el bienestar y el desarrollo de las personas.",
      "A través de reparaciones, adecuaciones y provisión de enseres básicos, transformamos espacios en hogares de esperanza, brindando un ambiente de paz y seguridad.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/hogar-digno/HogarDigno.jpg",
    imageAlt: "Voluntarios trabajando en la mejora de una vivienda",
    imagePosition: "right",
  };

  const projectDetailsData = {
    title: "¿Cómo puedes contribuir?",
    items: [
      {
        type: "icon",
        iconType: "Hammer",
        itemTitle: "Voluntariado en Construcción",
        itemDescription: "Ayúdanos con mano de obra en reparaciones y adecuaciones.",
      },
      {
        type: "icon",
        iconType: "Sofa",
        itemTitle: "Donando Enseres",
        itemDescription: "Muebles, electrodomésticos y artículos para el hogar en buen estado.",
      },
      {
        type: "icon",
        iconType: "DollarSign",
        itemTitle: "Aportes Económicos",
        itemDescription: "Tu donación nos permite comprar materiales y cubrir gastos de transporte.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Hogar Digno"
      description="Transformando espacios en hogares de esperanza."
      imageUrl="/involucrate/ministerios/servicio/conexion/amor-en-accion/hogar-digno/HogarDigno.jpg"
      imageAlt="Hogar Digno"
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
