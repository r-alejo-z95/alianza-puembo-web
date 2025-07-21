
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

export const metadata = {
  title: "GP Ministeriales",
  description: "Grupos Pequeños para líderes y servidores en Alianza Puembo. Un espacio para el cuidado, la formación y el fortalecimiento del equipo.",
  alternates: {
    canonical: "/involucrate/ministerios/cuidado/grupos-pequenos/ministeriales",
  },
};

export default function GPMinisteriales() {
  const introSectionData = {
    title: "GP Ministeriales: Cuidando a los que Cuidan",
    description: [
      "Los Grupos Pequeños Ministeriales están diseñados específicamente para aquellos que sirven activamente en los diferentes ministerios de la iglesia. Entendemos que para dar, primero hay que recibir.",
      "Estos grupos son un espacio vital de recarga espiritual, cuidado pastoral, formación y compañerismo entre líderes y servidores, para que puedan continuar su labor con pasión y fortaleza.",
    ],
    imageUrl: "/involucrate/ministerios/cuidado/grupos-pequenos/ministeriales/Ministeriales.jpg",
    imageAlt: "Líderes de ministerio reunidos en oración y planificación",
    imagePosition: "right",
  };

  const focusAreas = {
    title: "Propósitos del Grupo",
    items: [
      {
        type: "icon",
        iconType: "HeartHandshake",
        itemTitle: "Cuidado y Rendición de Cuentas",
        itemDescription: "Un lugar seguro para compartir cargas, recibir oración y animarnos mutuamente en el servicio.",
      },
      {
        type: "icon",
        iconType: "BookUp",
        itemTitle: "Formación y Equipamiento",
        itemDescription: "Recibimos enseñanza y herramientas prácticas para crecer en nuestro liderazgo y habilidades ministeriales.",
      },
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Unidad y Sinergia",
        itemDescription: "Fortalecemos la visión y la unidad del equipo, colaborando juntos para el avance del Reino.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="GP Ministeriales"
      description="Cuidando, formando y fortaleciendo a los que sirven."
      imageUrl="/involucrate/ministerios/cuidado/grupos-pequenos/ministeriales/Ministeriales.jpg"
      imageAlt="GP Ministeriales"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...focusAreas} />
    </PublicPageLayout>
  );
}
