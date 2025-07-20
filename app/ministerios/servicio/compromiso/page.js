
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Compromiso",
  description: "Ministerios para creyentes comprometidos en Alianza Puembo. Sirve en áreas como MAT, Ministerios de Apoyo (MDA) y Oración.",
  alternates: {
    canonical: "/ministerios/servicio/compromiso",
  },
};

export default function Compromiso() {
  const introSectionData = {
    title: "Equipados para Servir con Excelencia",
    description: [
      "El compromiso con el servicio es una marca de madurez cristiana. Nuestros ministerios de Compromiso están diseñados para equipar, apoyar y coordinar a todos aquellos que han decidido dar un paso al frente y servir activamente en la iglesia.",
      "Si ya estás sirviendo o deseas hacerlo, aquí encontrarás los recursos y la comunidad que necesitas para hacerlo con excelencia y pasión.",
    ],
    imageUrl: "/ministerios/servicio/compromiso/Compromiso.jpg",
    imageAlt: "Equipo de voluntarios orando juntos antes de un servicio",
    imagePosition: "right",
  };

  const commitmentMinistries = {
    title: "Áreas de Compromiso",
    items: [
      {
        type: "link",
        href: "/ministerios/servicio/compromiso/mat",
        itemTitle: "MAT (Música, Artes y Tecnología)",
        itemDescription: "Adoración, creatividad y excelencia técnica al servicio de Dios.",
      },
      {
        type: "link",
        href: "/ministerios/servicio/compromiso/mda",
        itemTitle: "MDA (Ministerios de Apoyo)",
        itemDescription: "Equipos que hacen posible el funcionamiento de nuestros servicios y eventos.",
      },
      {
        type: "link",
        href: "/ministerios/servicio/compromiso/oracion",
        itemTitle: "Oración",
        itemDescription: "El motor espiritual de nuestra iglesia, intercediendo y buscando a Dios.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Compromiso"
      description="Equipando y apoyando a quienes sirven en la iglesia."
      imageUrl="/ministerios/servicio/compromiso/Compromiso.jpg"
      imageAlt="Ministerios de Compromiso"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...commitmentMinistries} />
    </PublicPageLayout>
  );
}
