import { MissionDignityProjectsSection } from "@/components/public/layout/pages/ministerios/mision-dignidad/MissionDignityProjectsSection";
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";

export const metadata = {
  title: "Misión Dignidad",
  description: "Conoce y participa en Misión Dignidad, nuestro ministerio de servicio y alcance comunitario que busca llevar ayuda y esperanza a quienes más lo necesitan.",
  alternates: {
    canonical: "/ministerios/mision-dignidad",
  },
};

export default function MisionDignidad() {
  const introSectionData = {
    title: "Amor en Acción, Esperanza en Comunidad",
    description: [
      "Misión Dignidad es el brazo social de Alianza Puembo, dedicado a extender el amor de Cristo a los más necesitados. Creemos que la fe se demuestra a través de obras de servicio y compasión, impactando positivamente a nuestra comunidad.",
      "Trabajamos en proyectos que abordan diversas necesidades, desde la alimentación y el vestuario hasta el apoyo educativo y emocional. ¡Únete a nosotros y sé parte de la transformación!",
    ],
    imageUrl: "/ministerios/mision-dignidad/mission-dignity-intro.jpg",
    imageAlt: "Miembros de la brigada médica internacional",
    imagePosition: "left",
  };

  return (
    <PublicPageLayout
      title="Misión Dignidad"
      description="Extendiendo el amor de Cristo a los más necesitados."
      imageUrl="/ministerios/mision-dignidad/Mision-dignidad.jpg"
      imageAlt="Personas ayudando a los necesitados"
      introSectionData={introSectionData}
    >
      <MissionDignityProjectsSection />
    </PublicPageLayout>
  );
}
