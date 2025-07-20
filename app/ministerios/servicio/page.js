
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Servicio",
  description: "Descubre oportunidades para servir en Alianza Puembo. Únete a nuestros ministerios de Conexión, Crecimiento y Compromiso para hacer una diferencia.",
  alternates: {
    canonical: "/ministerios/servicio",
  },
};

export default function Servicio() {
  const introSectionData = {
    title: "Usa tus Dones para Servir a Otros",
    description: [
      "El servicio es una parte fundamental de la vida cristiana. En Alianza Puembo, te ofrecemos múltiples oportunidades para que uses tus dones y talentos al servicio de Dios y de la comunidad.",
      "Explora nuestros ministerios de Servicio, diseñados para alcanzar a nuevas personas (Conexión), fortalecer a los creyentes (Crecimiento) y equipar a nuestros líderes (Compromiso).",
    ],
    imageUrl: "/ministerios/servicio/Servicio.jpg",
    imageAlt: "Voluntarios trabajando juntos en un proyecto comunitario",
    imagePosition: "right",
  };

  const serviceMinistries = {
    title: "Ministerios de Servicio",
    items: [
      {
        type: "link",
        href: "/ministerios/servicio/conexion",
        itemTitle: "Conexión",
        itemDescription: "Alcanzando a nuestra comunidad y conectando a las personas con Cristo.",
      },
      {
        type: "link",
        href: "/ministerios/servicio/crecimiento",
        itemTitle: "Crecimiento",
        itemDescription: "Fomentando la madurez espiritual y el discipulado.",
      },
      {
        type: "link",
        href: "/ministerios/servicio/compromiso",
        itemTitle: "Compromiso",
        itemDescription: "Equipando y apoyando a quienes sirven en la iglesia.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Servicio"
      description="Ministerios enfocados en el servicio y el alcance."
      imageUrl="/ministerios/servicio/Servicio.jpg"
      imageAlt="Ministerios de Servicio"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...serviceMinistries} />
    </PublicPageLayout>
  );
}
