
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Compromiso",
  description: "Ministerios para creyentes comprometidos en Alianza Puembo. Sirve en áreas como MAT, Ministerios de Apoyo (MDA) y Oración.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/compromiso",
  },
};

export default function Compromiso() {
  const introSectionData = {
    title: "Equipados para Servir con Excelencia",
    description: [
      "El compromiso con el servicio es una marca de madurez cristiana. Nuestros ministerios de Compromiso están diseñados para equipar, apoyar y coordinar a todos aquellos que han decidido dar un paso al frente y servir activamente en la iglesia.",
      "Si ya estás sirviendo o deseas hacerlo, aquí encontrarás los recursos y la comunidad que necesitas para hacerlo con excelencia y pasión.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/compromiso/Compromiso.avif",
    imageAlt: "Equipo de voluntarios orando juntos antes de un servicio",
    imagePosition: "right",
  };

  const commitmentMinistriesData = {
    title: "Áreas de Compromiso",
    items: [
      {
        type: "link",
        href: "/ministerios/mat",
        itemTitle: "MAT (Música, Artes y Tecnología)",
        itemDescription: "Adoración, creatividad y excelencia técnica al servicio de Dios.",
      },
      {
        type: "link",
        href: "/ministerios/mda",
        itemTitle: "MDA (Ministerios de Apoyo)",
        itemDescription: "Equipos que hacen posible el funcionamiento de nuestros servicios y eventos.",
      },
      {
        type: "link",
        href: "/ministerios/oracion",
        itemTitle: "Oración",
        itemDescription: "El motor espiritual de nuestra iglesia, intercediendo y buscando a Dios.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Compromiso"
      description="Equipando y apoyando a quienes sirven en la iglesia."
      imageUrl="/involucrate/ministerios/servicio/compromiso/header.avif"
      imageAlt="Ministerios de Compromiso"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        backLink="/ministerios/servicio" 
        backLabel="Volver a Servicio" 
      />
      <MinistryContentSection {...commitmentMinistriesData} />
    </PublicPageLayout>
  );
}
