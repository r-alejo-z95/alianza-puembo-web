
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

export const metadata = {
  title: "Brigadas Médicas",
  description: "Atención médica y de salud para comunidades vulnerables. Llevamos cuidado y esperanza a quienes más lo necesitan.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/amor-en-accion/brigadas-medicas",
  },
};

export default function BrigadasMedicas() {
  const introSectionData = {
    title: "Brigadas Médicas: Salud y Esperanza",
    description: [
      "Nuestras Brigadas Médicas son un esfuerzo continuo para llevar atención de salud integral a comunidades que tienen acceso limitado a servicios médicos. Creemos que la salud es un derecho fundamental y una expresión del amor de Dios.",
      "Un equipo de profesionales de la salud voluntarios ofrece consultas, medicamentos, y educación sanitaria, impactando vidas y restaurando la dignidad.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/amor-en-accion/brigadas-medicas/BrigadasMedicas.jpg",
    imageAlt: "Médicos voluntarios atendiendo a pacientes",
    imagePosition: "right",
  };

  const projectDetailsData = {
    title: "Nuestro Impacto",
    items: [
      {
        type: "icon",
        iconType: "HeartPulse",
        itemTitle: "Atención Primaria",
        itemDescription: "Consultas médicas generales, pediátricas y ginecológicas.",
      },
      {
        type: "icon",
        iconType: "Pill",
        itemTitle: "Entrega de Medicamentos",
        itemDescription: "Provisión de medicinas básicas y especializadas según la necesidad.",
      },
      {
        type: "icon",
        iconType: "BookOpen",
        itemTitle: "Educación Sanitaria",
        itemDescription: "Talleres y charlas sobre higiene, nutrición y prevención de enfermedades.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Brigadas Médicas"
      description="Llevando salud y esperanza a comunidades vulnerables."
      imageUrl="/involucrate/ministerios/servicio/conexion/amor-en-accion/brigadas-medicas/BrigadasMedicas.jpg"
      imageAlt="Brigadas Médicas"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...projectDetailsData} />
    </PublicPageLayout>
  );
}
