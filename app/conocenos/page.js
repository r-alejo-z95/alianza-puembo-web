import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

export const metadata = {
  title: "Conócenos",
  description: "Conoce más sobre la Iglesia Alianza Puembo, nuestro equipo y en lo que creemos.",
  alternates: {
    canonical: "/conocenos",
  },
};

export default function Conocenos() {
  const portalData = {
    title: "Nuestra Identidad",
    items: [
      {
        type: "link",
        href: "/conocenos/equipo",
        itemTitle: "Nuestro Equipo",
        itemDescription: "Pastores y líderes que te acompañan en tu caminar de fe.",
      },
      {
        type: "link",
        href: "/conocenos/que-creemos",
        itemTitle: "¿En qué creemos?",
        itemDescription: "Nuestras creencias fundamentales y pilares espirituales.",
      },
    ],
  };

  const introSectionData = {
    title: "Una Familia de Familias",
    description: [
      "La Iglesia Alianza Puembo es una comunidad apasionada por Jesús, dedicada a amar a Dios y servir a las personas en Puembo y sus alrededores.",
      "Te invitamos a descubrir quiénes somos, nuestro equipo ministerial y los fundamentos de nuestra fe que guían cada uno de nuestros pasos.",
    ],
    imageUrl: "/conocenos/equipo/Equipo.avif",
    imageAlt: "Familia de Alianza Puembo",
    imagePosition: "right",
  };

  return (
    <PublicPageLayout
      title="Conócenos"
      description="Descubre nuestro corazón y nuestra misión."
      imageUrl="/conocenos/equipo/Equipo.avif"
      imageAlt="Conócenos"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...portalData} />
    </PublicPageLayout>
  );
}