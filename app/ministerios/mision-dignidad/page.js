import { MissionDignityIntroSection } from "@/components/public/layout/pages/ministerios/mision-dignidad/MissionDignityIntroSection";
import { MissionDignityProjectsSection } from "@/components/public/layout/pages/ministerios/mision-dignidad/MissionDignityProjectsSection";
import { PageHeader } from "@/components/public/layout/pages/PageHeader";

export const metadata = {
  title: "Misión Dignidad",
  description: "Conoce y participa en Misión Dignidad, nuestro ministerio de servicio y alcance comunitario que busca llevar ayuda y esperanza a quienes más lo necesitan.",
  alternates: {
    canonical: "/ministerios/mision-dignidad",
  },
};

export default function MisionDignidad() {
  return (
    <main>
      <PageHeader
        title="Misión Dignidad"
        description="Extendiendo el amor de Cristo a los más necesitados."
        imageUrl="/ministerios/mision-dignidad/Mision-dignidad.jpg"
        imageAlt="Personas ayudando a los necesitados"
      />
      <MissionDignityIntroSection />
      <MissionDignityProjectsSection />
    </main>
  );
}
