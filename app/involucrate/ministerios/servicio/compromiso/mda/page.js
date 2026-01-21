
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

export const metadata = {
  title: "MDA (Ministerios de Apoyo)",
  description: "Equipos que hacen posible el funcionamiento de nuestros servicios y eventos en Alianza Puembo. Incluye anfitriones, punto de información, santa cena, bautizos y acompañamiento.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/compromiso/mda",
  },
};

export default function MDA() {
  const introSectionData = {
    title: "MDA: El Corazón del Servicio",
    description: [
      "Los Ministerios de Apoyo (MDA) son el motor que hace posible cada servicio, evento y actividad en Alianza Puembo. Son equipos de voluntarios dedicados que sirven detrás de escena, asegurando que todo funcione con excelencia y que cada persona se sienta bienvenida y atendida.",
      "Si tienes un corazón de servicio y deseas usar tus dones para apoyar la obra de Dios con eficacia y alegría, te invitamos a unirte a uno de nuestros equipos de MDA.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/compromiso/mda/MDA.jpg",
    imageAlt: "Voluntarios de apoyo en un evento de la iglesia",
    imagePosition: "right",
  };

  const mdaTeamsData = {
    title: "Nuestros Equipos de Apoyo",
    items: [
      {
        type: "link",
        href: "/involucrate/ministerios/servicio/compromiso/mda/anfitriones",
        itemTitle: "Anfitriones",
        itemDescription: "Recibiendo y dando la bienvenida con amor a nuestra familia.",
      },
      {
        type: "link",
        href: "/involucrate/ministerios/servicio/compromiso/mda/mesa-de-informacion",
        itemTitle: "Punto de Información",
        itemDescription: "Tu centro de ayuda y guía para todo lo que sucede en la iglesia.",
      },
      {
        type: "link",
        href: "/involucrate/ministerios/servicio/compromiso/mda/santa-cena",
        itemTitle: "Santa Cena",
        itemDescription: "Preparando y sirviendo en este acto de adoración y reverencia.",
      },
      {
        type: "link",
        href: "/involucrate/ministerios/servicio/compromiso/mda/bautizos",
        itemTitle: "Bautizos",
        itemDescription: "Apoyando en la celebración de las nuevas decisiones de fe.",
      },
      {
        type: "link",
        href: "/involucrate/ministerios/servicio/compromiso/mda/visitacion-y-funerales",
        itemTitle: "Acompañamiento",
        itemDescription: "Brindando presencia, empatía y consuelo en momentos de pérdida.",
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
      <MinistryContentSection {...mdaTeamsData} />
    </PublicPageLayout>
  );
}
