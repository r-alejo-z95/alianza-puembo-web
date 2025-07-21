
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Cuidado",
  description: "Ministerios de Cuidado en Alianza Puembo. Ofrecemos apoyo y comunidad a través de Grupos Pequeños, Jóvenes y Puembo Kids.",
  alternates: {
    canonical: "/involucrate/ministerios/cuidado",
  },
};

export default function Cuidado() {
  const introSectionData = {
    title: "Cuidado y Comunidad para Cada Etapa",
    description: [
      "Nuestros ministerios de Cuidado están diseñados para acompañarte y fortalecerte en cada etapa de tu vida. Desde los más pequeños hasta los adultos, ofrecemos espacios de contención, crecimiento y comunidad.",
      "Descubre cómo nuestros Grupos Pequeños, el ministerio de Jóvenes y Puembo Kids pueden ser una bendición para ti y tu familia.",
    ],
    imageUrl: "/involucrate/ministerios/cuidado/Cuidado.jpg",
    imageAlt: "Personas abrazándose en señal de apoyo",
    imagePosition: "right",
  };

  const careMinistries = {
    title: "Ministerios de Cuidado",
    items: [
      {
        type: "link",
        href: "/involucrate/ministerios/cuidado/grupos-pequenos",
        itemTitle: "Grupos Pequeños",
        itemDescription: "Conecta, crece y comparte en comunidad.",
      },
      {
        type: "link",
        href: "/involucrate/ministerios/cuidado/jovenes",
        itemTitle: "Jóvenes",
        itemDescription: "Un espacio dinámico para la nueva generación.",
      },
      {
        type: "link",
        href: "/involucrate/ministerios/cuidado/puembo-kids",
        itemTitle: "Puembo Kids",
        itemDescription: "Formando a los más pequeños en el amor de Jesús.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Cuidado"
      description="Ministerios enfocados en el cuidado y la comunidad."
      imageUrl="/involucrate/ministerios/cuidado/Cuidado.jpg"
      imageAlt="Ministerios de Cuidado"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...careMinistries} />
    </PublicPageLayout>
  );
}
