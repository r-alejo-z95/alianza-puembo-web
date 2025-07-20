
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "GP Legado (Varones)",
  description: "Grupos Pequeños para varones en Alianza Puembo. Un espacio para forjar un legado de fe, integridad y liderazgo.",
  alternates: {
    canonical: "/ministerios/cuidado/grupos-pequenos/legado",
  },
};

export default function GPLegado() {
  const introSectionData = {
    title: "GP Legado: Forjando Hombres de Valor",
    description: [
      "Legado es nuestro ministerio de grupos pequeños para varones. Es un espacio de confianza y camaradería donde los hombres son desafiados a crecer en su fe, liderar a sus familias y dejar un legado de integridad.",
      "Nos reunimos para estudiar la Palabra, orar unos por otros y animarnos a vivir como hombres conforme al corazón de Dios.",
    ],
    imageUrl: "/ministerios/cuidado/grupos-pequenos/legado/Legado.jpg",
    imageAlt: "Hombres orando juntos",
    imagePosition: "right",
  };

  const focusAreas = {
    title: "Áreas de Enfoque",
    items: [
      {
        type: "icon",
        iconType: "ShieldCheck",
        itemTitle: "Identidad en Cristo",
        itemDescription: "Afirmamos nuestra identidad como hijos de Dios y el propósito que Él tiene para nuestras vidas.",
      },
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Liderazgo y Familia",
        itemDescription: "Aprendemos a ser líderes servidores en nuestros hogares, trabajos y comunidad.",
      },
      {
        type: "icon",
        iconType: "BookOpen",
        itemTitle: "Integridad y Santidad",
        itemDescription: "Nos desafiamos a vivir con integridad, pureza y pasión por Dios en un mundo que necesita luz.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="GP Legado (Varones)"
      description="Forjando un legado de fe, integridad y liderazgo."
      imageUrl="/ministerios/cuidado/grupos-pequenos/legado/Legado.jpg"
      imageAlt="GP Legado"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...focusAreas} />
    </PublicPageLayout>
  );
}
