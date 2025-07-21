
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "MDA (Ministerios de Apoyo)",
  description: "Equipos que hacen posible el funcionamiento de nuestros servicios y eventos en Alianza Puembo. Incluye anfitriones, mesa de información, santa cena, bautizos y visitación.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/compromiso/mda",
  },
};

export default function MDA() {
  const introSectionData = {
    title: "MDA: El Corazón del Servicio",
    description: [
      "Los Ministerios de Apoyo (MDA) son el motor que hace posible cada servicio, evento y actividad en Alianza Puembo. Son equipos de voluntarios dedicados que sirven detrás de escena, asegurando que todo funcione sin problemas y que cada persona se sienta bienvenida y atendida.",
      "Si tienes un corazón de servicio y deseas usar tus dones para apoyar la obra de Dios, te invitamos a unirte a uno de nuestros equipos de MDA.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/compromiso/mda/MDA.jpg",
    imageAlt: "Voluntarios de apoyo en un evento de la iglesia",
    imagePosition: "right",
  };

  const mdaTeams = {
    title: "Nuestros Equipos de Apoyo",
    items: [
      {
        type: "link",
        href: "/involucrate/ministerios/servicio/compromiso/mda/anfitriones",
        itemTitle: "Anfitriones",
        itemDescription: "Recibiendo y dando la bienvenida a cada persona que llega a la iglesia.",
      },
      {
        type: "link",
        href: "/involucrate/ministerios/servicio/compromiso/mda/mesa-de-informacion",
        itemTitle: "Mesa de Información",
        itemDescription: "Proporcionando información y orientación a los visitantes y miembros.",
      },
      {
        type: "link",
        href: "/involucrate/ministerios/servicio/compromiso/mda/santa-cena",
        itemTitle: "Santa Cena",
        itemDescription: "Preparando y sirviendo en la celebración de la Santa Cena.",
      },
      {
        type: "link",
        href: "/involucrate/ministerios/servicio/compromiso/mda/bautizos",
        itemTitle: "Bautizos",
        itemDescription: "Apoyando en la organización y desarrollo de las ceremonias de bautismo.",
      },
      {
        type: "link",
        href: "/involucrate/ministerios/servicio/compromiso/mda/visitacion-y-funerales",
        itemTitle: "Visitación y Funerales",
        itemDescription: "Brindando apoyo y consuelo a familias en momentos de necesidad.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="MDA (Ministerios de Apoyo)"
      description="Equipos que hacen posible el funcionamiento de nuestros servicios y eventos."
      imageUrl="/involucrate/ministerios/servicio/compromiso/mda/MDA.jpg"
      imageAlt="MDA (Ministerios de Apoyo)"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...mdaTeams} />
    </PublicPageLayout>
  );
}
