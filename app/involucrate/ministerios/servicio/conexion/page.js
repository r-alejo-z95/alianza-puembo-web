
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Conexión",
  description: "Ministerios de Conexión en Alianza Puembo. Alcanzamos a la comunidad a través de eventos, proyectos de amor en acción y redes de evangelismo.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion",
  },
};

export default function Conexion() {
  const introSectionData = {
    title: "Conectando Personas con el Amor de Dios",
    description: [
      "Los ministerios de Conexión están diseñados para ser el primer punto de contacto para aquellos que buscan a Dios. Nuestro objetivo es crear puentes entre la iglesia y la comunidad, mostrando el amor de Cristo de maneras prácticas y relevantes.",
      "A través de eventos, proyectos de servicio y grupos de evangelismo, buscamos conectar a las personas con Dios y con nuestra comunidad de fe.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/Conexion.avif",
    imageAlt: "Personas dándose la bienvenida en la iglesia",
    imagePosition: "right",
  };

  const connectionMinistriesData = {
    title: "Áreas de Conexión",
    items: [
      {
        type: "link",
        href: "/ministerios/eventos-conexion",
        itemTitle: "Eventos",
        itemDescription: "Eventos especiales diseñados para alcanzar a diferentes grupos de personas.",
      },
      {
        type: "link",
        href: "/ministerios/amor-en-accion",
        itemTitle: "Amor en Acción",
        itemDescription: "Proyectos de servicio que demuestran el amor de Dios a través de obras.",
      },
      {
        type: "link",
        href: "/ministerios/redes-de-amor",
        itemTitle: "Redes de Amor (Evangelismo)",
        itemDescription: "Grupos dedicados a compartir el evangelio de manera personal y creativa.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Conexión"
      description="Alcanzando a nuestra comunidad y conectando a las personas con Cristo."
      imageUrl="/involucrate/ministerios/servicio/conexion/header.avif"
      imageAlt="Ministerios de Conexión"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        hierarchy={[{ name: "Servicio", href: "/ministerios/servicio" }]}
        current="Conexión"
        backLink="/ministerios/servicio" 
        backLabel="Volver a Servicio" 
      />
      <MinistryContentSection {...connectionMinistriesData} />
    </PublicPageLayout>
  );
}
