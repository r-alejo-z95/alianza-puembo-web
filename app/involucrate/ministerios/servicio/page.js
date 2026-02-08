
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Servicio",
  description: "Oportunidades de servicio en Alianza Puembo. Únete a nuestros equipos de Conexión, Crecimiento y Compromiso para servir a Dios y a los demás.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio",
  },
};

export default function Servicio() {
  const introSectionData = {
    title: "Manos al Servicio: Tu Lugar de Impacto",
    description: [
      "En Alianza Puembo, el servicio es la expresión de nuestra gratitud. Tenemos diversas áreas donde puedes poner tus dones y talentos al servicio de los demás, impactando nuestra ciudad y extendiendo el Reino de Dios.",
      "Explora nuestras áreas de Conexión, Crecimiento y Compromiso para encontrar el equipo que mejor se alinee con tu corazón y pasión.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/Servicio.avif",
    imageAlt: "Personas sirviendo juntas",
    imagePosition: "right",
  };

  const serviceAreasData = {
    title: "Áreas de Servicio",
    items: [
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/servicio/conexion/header.avif",
        href: "/ministerios/conexion",
        itemTitle: "Conexión",
        itemDescription: "Alcanzando a nuestra comunidad a través de eventos, proyectos sociales y evangelismo.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/servicio/crecimiento/header.avif",
        href: "/ministerios/crecimiento",
        itemTitle: "Crecimiento",
        itemDescription: "Fomentando la madurez espiritual, el discipulado y la sanidad interior.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/servicio/compromiso/header.avif",
        href: "/ministerios/compromiso",
        itemTitle: "Compromiso",
        itemDescription: "Equipos dedicados a la adoración, el apoyo logístico y el motor de la oración.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Servicio"
      description="Manos que transforman vidas."
      imageUrl="/involucrate/ministerios/servicio/header.avif"
      imageAlt="Ministerios de Servicio"
      introSectionData={introSectionData}
    >
      <MinistryNavigation current="Servicio" />
      <MinistryContentSection {...serviceAreasData} />
    </PublicPageLayout>
  );
}
