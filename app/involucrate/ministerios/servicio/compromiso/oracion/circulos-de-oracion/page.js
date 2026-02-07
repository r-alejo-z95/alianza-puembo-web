
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Círculos de Oración",
  description: "Únete a nuestros grupos de intercesión comunitaria vía Zoom. Un espacio para clamar juntos por necesidades específicas y ver la mano de Dios obrar.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/compromiso/oracion/circulos-de-oracion",
  },
};

export default function CirculosDeOracion() {
  const introSectionData = {
    title: "Círculos de Oración: Intercesión Comunitaria",
    description: [
      "Los Círculos de Oración tienen como espíritu la intercesión comunitaria. Son grupos donde nos unimos para clamar con fe, creyendo que la oración persistente transforma vidas y circunstancias.",
      "Nuestras reuniones se realizan de manera virtual vía Zoom, permitiendo que todos se sumen desde donde estén para unir nuestras peticiones en un solo clamor.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/compromiso/oracion/circulos-de-oracion/CirculosDeOracion.avif",
    imageAlt: "Círculos de Oración",
    imagePosition: "right",
  };

  const programDetailsData = {
    title: "Propósito y Modalidad",
    items: [
      {
        type: "icon",
        iconType: "Globe",
        itemTitle: "Vía Zoom",
        itemDescription: "Nos conectamos digitalmente para que la distancia no sea un obstáculo para la oración unida.",
      },
      {
        type: "icon",
        iconType: "Target",
        itemTitle: "Propósitos Específicos",
        itemDescription: "Oramos por peticiones concretas de nuestra comunidad, ciudad y naciones.",
      },
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Comunidad de Fe",
        itemDescription: "Fortalecemos nuestra fe al compartir testimonios y ver respuestas a nuestras oraciones.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Círculos de Oración"
      description="Intercesión comunitaria vía Zoom."
      imageUrl="/involucrate/ministerios/servicio/compromiso/oracion/circulos-de-oracion/header.avif"
      imageAlt="Círculos de Oración"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        hierarchy={[
          { name: "Servicio", href: "/ministerios/servicio" },
          { name: "Compromiso", href: "/ministerios/compromiso" },
          { name: "Oración", href: "/ministerios/oracion" }
        ]}
        current="Círculos de Oración"
        backLink="/ministerios/oracion" 
        backLabel="Volver a Oración" 
      />
      <MinistryContentSection {...programDetailsData} />
    </PublicPageLayout>
  );
}
