
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Amor en Acción",
  description: "Proyectos de servicio en Alianza Puembo que demuestran el amor de Dios a través de obras. Incluye Misión Dignidad, brigadas médicas, boutique de moda circular y más.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/amor-en-accion",
  },
};

export default function AmorEnAccion() {
  const introSectionData = {
    title: "Amor en Acción: Manos que Sirven",
    description: [
      "Amor en Acción es el corazón de nuestro servicio a la comunidad. A través de diversos proyectos, buscamos llevar esperanza, ayuda y el amor de Cristo a quienes más lo necesitan, demostrando nuestra fe con obras concretas que honran a las personas.",
      "Te invitamos a unirte a nuestras iniciativas y ser parte de la transformación de vidas y comunidades a través de la generosidad radical.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/AmorEnAccion.avif",
    imageAlt: "Voluntarios entregando ayuda a personas necesitadas",
    imagePosition: "right",
  };

  const projectsListData = {
    title: "Nuestros Proyectos de Servicio",
    items: [
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/mision-dignidad/header.avif",
        href: "/ministerios/mision-dignidad",
        itemTitle: "Misión Dignidad",
        itemDescription: "Nuestro brazo social principal, atendiendo diversas necesidades de la comunidad.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/brigadas-medicas/header.avif",
        href: "/ministerios/brigadas-medicas",
        itemTitle: "Brigadas Médicas",
        itemDescription: "Atención médica y de salud para comunidades vulnerables.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/ropero/header.avif",
        href: "/ministerios/boutique",
        itemTitle: "Boutique de Moda Circular",
        itemDescription: "Vistiendo con dignidad y sostenibilidad a quienes más lo necesitan.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/navidad-digna/header.avif",
        href: "/ministerios/navidad-digna",
        itemTitle: "Navidad Digna",
        itemDescription: "Nuestra celebración anual de generosidad que ocurre una vez al año.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/canasta-de-amor/header.avif",
        href: "/ministerios/canasta-de-amor",
        itemTitle: "Canasta de Amor",
        itemDescription: "Apoyo solidario de alimentos, exclusivo para nuestra familia de fe.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/hogar-digno/header.avif",
        href: "/ministerios/hogar-digno",
        itemTitle: "Hogar Digno",
        itemDescription: "Transformando espacios en hogares de esperanza y paz.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Amor en Acción"
      description="Proyectos de servicio que demuestran el amor de Dios."
      imageUrl="/involucrate/ministerios/servicio/conexion/amor-en-accion/header.avif"
      imageAlt="Amor en Acción"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        hierarchy={[
          { name: "Servicio", href: "/ministerios/servicio" },
          { name: "Conexión", href: "/ministerios/conexion" }
        ]}
        current="Amor en Acción"
        backLink="/ministerios/conexion" 
        backLabel="Volver a Conexión" 
      />
      <MinistryContentSection {...projectsListData} />
    </PublicPageLayout>
  );
}
