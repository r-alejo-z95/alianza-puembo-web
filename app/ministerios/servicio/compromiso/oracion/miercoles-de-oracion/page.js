
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Miércoles de Oración",
  description: "Servicio semanal dedicado exclusivamente a la oración y la búsqueda de Dios en Alianza Puembo. Un tiempo para unirse en fe y clamar juntos.",
  alternates: {
    canonical: "/ministerios/servicio/compromiso/oracion/miercoles-de-oracion",
  },
};

export default function MiercolesDeOracion() {
  const introSectionData = {
    title: "Miércoles de Oración: Un Tiempo Sagrado",
    description: [
      "Cada miércoles, nos reunimos como iglesia para dedicar un tiempo exclusivo a la oración y la búsqueda de Dios. Es un servicio donde la alabanza, la Palabra y la intercesión se unen para crear un ambiente de profunda comunión con el Espíritu Santo.",
      "Te invitamos a unirte a nosotros en este tiempo sagrado, donde juntos presentamos nuestras peticiones, agradecemos por sus bondades y clamamos por avivamiento en nuestras vidas y en nuestra ciudad.",
    ],
    imageUrl: "/ministerios/servicio/compromiso/oracion/miercoles-de-oracion/MiercolesDeOracion.jpg",
    imageAlt: "Congregación orando en un servicio",
    imagePosition: "right",
  };

  const serviceDetails = {
    title: "¿Qué esperar?",
    items: [
      {
        type: "icon",
        iconType: "Clock",
        itemTitle: "Horario",
        itemDescription: "Todos los miércoles a las 7:00 PM en el auditorio principal.",
      },
      {
        type: "icon",
        iconType: "Mic",
        itemTitle: "Alabanza y Adoración",
        itemDescription: "Tiempo de música que prepara nuestros corazones para la presencia de Dios.",
      },
      {
        type: "icon",
        iconType: "Pray",
        itemTitle: "Intercesión Colectiva",
        itemDescription: "Oramos por peticiones específicas, por la iglesia, la nación y el mundo.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Miércoles de Oración"
      description="Un tiempo sagrado de oración y búsqueda de Dios."
      imageUrl="/ministerios/servicio/compromiso/oracion/miercoles-de-oracion/MiercolesDeOracion.jpg"
      imageAlt="Miércoles de Oración"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...serviceDetails} />
    </PublicPageLayout>
  );
}
