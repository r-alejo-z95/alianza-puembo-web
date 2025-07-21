
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Evento Legado (Varones)",
  description: "Un evento para varones que buscan forjar un legado de fe, liderazgo y propósito en sus vidas y familias.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/eventos/legado",
  },
};

export default function Legado() {
  const introSectionData = {
    title: "Legado: Hombres con Propósito",
    description: [
      "Legado es un evento diseñado para desafiar e inspirar a los varones a vivir una vida de propósito, integridad y liderazgo. Creemos que cada hombre tiene el potencial de dejar un impacto duradero en su familia, iglesia y comunidad.",
      "A través de conferencias, testimonios y actividades dinámicas, buscamos equipar a los hombres para que asuman su rol con valentía y sabiduría.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/eventos/legado/Legado.jpg",
    imageAlt: "Grupo de hombres en una conferencia",
    imagePosition: "right",
  };

  const eventDetails = {
    title: "¿Qué esperar de Legado?",
    items: [
      {
        type: "icon",
        iconType: "ShieldCheck",
        itemTitle: "Principios de Liderazgo",
        itemDescription: "Enseñanzas prácticas para liderar con sabiduría en todas las áreas de la vida.",
      },
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Comunidad Masculina",
        itemDescription: "Conecta con otros hombres que comparten tus valores y desafíos.",
      },
      {
        type: "icon",
        iconType: "BookOpen",
        itemTitle: "Visión y Propósito",
        itemDescription: "Descubre y afirma el propósito de Dios para tu vida y cómo dejar un legado significativo.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Evento Legado"
      description="Forjando hombres de fe, liderazgo y propósito."
      imageUrl="/involucrate/ministerios/servicio/conexion/eventos/legado/Legado.jpg"
      imageAlt="Evento Legado"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...eventDetails} />
    </PublicPageLayout>
  );
}
