import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

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
    imageUrl: "/involucrate/ministerios/mision-dignidad/mission-dignity-intro.jpg",
    imageAlt: "Miembros de la brigada médica internacional",
    imagePosition: "left",
  };

  const projectsData = {
    title: "Nuestros Proyectos",
    items: [
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/mision-dignidad/mission-dignity-project-1.jpg",
        imageAlt: "Atención a pacientes médicos en vulnerabilidad",
        itemTitle: "Brigadas Médicas",
        itemDescription: "Atendemos a cientos de personas de la comunidad que están en necesidad.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/mision-dignidad/mission-dignity-project-2.jpg",
        imageAlt: "Donación de Ropa y Artículos",
        itemTitle: "Donación de Ropa y Artículos",
        itemDescription: "Recolección y distribución de ropa, calzado y artículos de primera necesidad.",
      },
      {
        type: "image",
        imageUrl: "/involucrate/ministerios/mision-dignidad/mission-dignity-project-3.jpg",
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
      imageUrl="/involucrate/ministerios/mision-dignidad/Mision-dignidad.jpg"
      imageAlt="Personas ayudando a los necesitados"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...projectsData} />
    </PublicPageLayout>
  );
}
