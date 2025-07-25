
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

export const metadata = {
  title: "Redes de Amor (Evangelismo)",
  description: "Grupos dedicados a compartir el evangelio de manera personal y creativa en Alianza Puembo. Incluye Pescadores y Punto de Conexión.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/redes-de-amor",
  },
};

export default function RedesDeAmor() {
  const introSectionData = {
    title: "Redes de Amor: Compartiendo la Buena Noticia",
    description: [
      "Nuestras Redes de Amor son grupos de creyentes apasionados por compartir el evangelio de Jesucristo de una manera auténtica y relacional. Creemos que la Buena Noticia es para todos y que cada creyente es llamado a ser un testigo.",
      "A través de diferentes estrategias y enfoques, buscamos alcanzar a nuestra comunidad con el mensaje transformador del amor de Dios.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/redes-de-amor/RedesDeAmor.jpg",
    imageAlt: "Personas compartiendo la Biblia en un parque",
    imagePosition: "right",
  };

  const networksListData = {
    title: "Nuestras Redes",
    items: [
      {
        type: "link",
        href: "/involucrate/ministerios/servicio/conexion/redes-de-amor/pescadores",
        itemTitle: "Pescadores",
        itemDescription: "Grupos de evangelismo personal y relacional en diferentes contextos.",
      },
      {
        type: "link",
        href: "/involucrate/ministerios/servicio/conexion/redes-de-amor/punto-de-conexion",
        itemTitle: "Punto de Conexión",
        itemDescription: "Eventos y actividades diseñadas para crear oportunidades de evangelismo.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Redes de Amor"
      description="Compartiendo la Buena Noticia de Jesús."
      imageUrl="/involucrate/ministerios/servicio/conexion/redes-de-amor/RedesDeAmor.jpg"
      imageAlt="Redes de Amor"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...networksListData} />
    </PublicPageLayout>
  );
}
