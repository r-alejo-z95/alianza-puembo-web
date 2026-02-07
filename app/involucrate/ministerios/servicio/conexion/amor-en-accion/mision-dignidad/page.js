import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Misión Dignidad",
  description: "Conoce y participa en Misión Dignidad, nuestro ministerio de servicio y alcance comunitario que busca llevar ayuda y esperanza a quienes más lo necesitan.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/amor-en-accion/mision-dignidad",
  },
};

export default function MisionDignidad() {
  const introSectionData = {
    title: "Amor en Acción, Esperanza en Comunidad",
    description: [
      "Misión Dignidad es el brazo social de Alianza Puembo, dedicado a extender el amor de Cristo a los más necesitados. Creemos que la fe se demuestra a través de obras de servicio y compasión, impactando positivamente a nuestra comunidad.",
      "Trabajamos en proyectos que abordan diversas necesidades, desde la alimentación y el vestuario hasta el apoyo educativo y emocional. ¡Únete a nosotros y sé parte de la transformación!",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/mision-dignidad/Mision-dignidad.avif",
    imageAlt: "Miembros de la brigada médica internacional",
    imagePosition: "left",
  };

  const projectsData = {
    title: "Nuestros Proyectos",
    items: [
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/mision-dignidad/mission-dignity-project-1.avif",
        imageAlt: "Atención a pacientes médicos en vulnerabilidad",
        itemTitle: "Brigadas Médicas",
        itemDescription: "Atendemos a cientos de personas de la comunidad que están en necesidad.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/mision-dignidad/mission-dignity-project-2.avif",
        imageAlt: "Donación de Ropa y Artículos",
        itemTitle: "Donación de Ropa y Artículos",
        itemDescription: "Recolección y distribución de ropa, calzado y artículos de primera necesidad.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/mision-dignidad/mission-dignity-project-3.avif",
        imageAlt: "Apoyo a ancianos",
        itemTitle: "Visitas a Abuelitos",
        itemDescription: "Apadrinamos a ancianos que viven en escasez.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Misión Dignidad"
      description="Extendiendo el amor de Cristo a los más necesitados."
      imageUrl="/involucrate/ministerios/servicio/conexion/amor-en-accion/mision-dignidad/header.avif"
      imageAlt="Personas ayudando a los necesitados"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        hierarchy={[
          { name: "Servicio", href: "/ministerios/servicio" },
          { name: "Conexión", href: "/ministerios/conexion" },
          { name: "Amor en Acción", href: "/ministerios/amor-en-accion" },
        ]}
        current="Misión Dignidad"
        backLink="/ministerios/amor-en-accion" 
        backLabel="Volver a Amor en Acción" 
      />
      <MinistryContentSection {...projectsData} />
    </PublicPageLayout>
  );
}
