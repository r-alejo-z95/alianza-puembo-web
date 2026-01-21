
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Punto de Información",
  description: "Tu centro de ayuda y guía en Alianza Puembo. Encuentra respuestas, recursos y conoce más sobre nuestra familia de fe.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/compromiso/mda/mesa-de-informacion",
  },
};

export default function MesaDeInformacion() {
  const introSectionData = {
    title: "Punto de Información: Tu Centro de Ayuda",
    description: [
      "El Punto de Información es el centro neurálgico para resolver dudas, obtener recursos y conocer de cerca las actividades de Alianza Puembo.",
      "Nuestro equipo está listo para brindarte la orientación que necesitas con eficacia, claridad y una cálida bienvenida, asegurando que tu experiencia en la iglesia sea fluida y enriquecedora.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/compromiso/mda/mesa-de-informacion/MesaDeInformacion.jpg",
    imageAlt: "Punto de Información",
    imagePosition: "right",
  };

  const servicesData = {
    title: "Nuestros Servicios",
    items: [
      {
        type: "icon",
        iconType: "Smile",
        itemTitle: "Atención Eficaz",
        itemDescription: "Resolvemos tus inquietudes de manera rápida y amable.",
      },
      {
        type: "icon",
        iconType: "BookOpen",
        itemTitle: "Recursos y Guía",
        itemDescription: "Obtén materiales, formularios e información sobre nuestros ministerios.",
      },
      {
        type: "icon",
        iconType: "LinkIcon",
        itemTitle: "Conexión Inmediata",
        itemDescription: "Te ayudamos a dar el siguiente paso en tu integración con la comunidad.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Punto de Información"
      description="Eficacia y claridad en cada consulta."
      imageUrl="/involucrate/ministerios/servicio/compromiso/mda/mesa-de-informacion/MesaDeInformacion.jpg"
      imageAlt="Punto de Información"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        backLink="/ministerios/servicio" 
        backLabel="Volver a Compromiso" 
      />
      <MinistryContentSection {...servicesData} />
    </PublicPageLayout>
  );
}
