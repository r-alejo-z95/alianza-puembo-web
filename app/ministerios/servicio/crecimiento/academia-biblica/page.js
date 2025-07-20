
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Academia Bíblica",
  description: "Cursos y seminarios para profundizar en el conocimiento de la Palabra de Dios en Alianza Puembo. Crece en tu fe y discipulado.",
  alternates: {
    canonical: "/ministerios/servicio/crecimiento/academia-biblica",
  },
};

export default function AcademiaBiblica() {
  const introSectionData = {
    title: "Academia Bíblica: Profundizando en la Palabra",
    description: [
      "La Academia Bíblica de Alianza Puembo es un espacio dedicado al estudio sistemático y profundo de la Palabra de Dios. Creemos que el conocimiento de las Escrituras es fundamental para el crecimiento espiritual y la formación de discípulos maduros.",
      "Ofrecemos una variedad de cursos y seminarios diseñados para equiparte con herramientas de interpretación bíblica, teología y aplicación práctica para tu vida diaria.",
    ],
    imageUrl: "/ministerios/servicio/crecimiento/academia-biblica/AcademiaBiblica.jpg",
    imageAlt: "Estudiantes en un aula de estudio bíblico",
    imagePosition: "right",
  };

  const courseDetails = {
    title: "Nuestra Oferta Educativa",
    items: [
      {
        type: "icon",
        iconType: "BookOpen",
        itemTitle: "Cursos Fundamentales",
        itemDescription: "Introducción a la Biblia, Teología Sistemática, Hermenéutica y más.",
      },
      {
        type: "icon",
        iconType: "GraduationCap",
        itemTitle: "Seminarios Especializados",
        itemDescription: "Temas específicos como Liderazgo Cristiano, Finanzas Bíblicas, Historia de la Iglesia.",
      },
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Discipulado Personalizado",
        itemDescription: "Oportunidades de mentoría y grupos de estudio para un crecimiento más profundo.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Academia Bíblica"
      description="Cursos y seminarios para profundizar en la Palabra de Dios."
      imageUrl="/ministerios/servicio/crecimiento/academia-biblica/AcademiaBiblica.jpg"
      imageAlt="Academia Bíblica"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...courseDetails} />
    </PublicPageLayout>
  );
}
