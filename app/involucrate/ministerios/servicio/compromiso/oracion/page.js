
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Oración",
  description: "El motor espiritual de Alianza Puembo. Únete a nuestros Círculos de Oración, Intercesores y Miércoles de Oración para buscar a Dios juntos.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/compromiso/oracion",
  },
};

export default function Oracion() {
  const introSectionData = {
    title: "Oración: Nuestra Conexión con el Padre",
    description: [
      "Creemos que la oración no es solo una actividad, sino el aliento de vida de nuestra iglesia. En Alianza Puembo, buscamos el rostro de Dios de manera constante y apasionada, sabiendo que Él escucha y responde el clamor de Sus hijos.",
      "Te invitamos a sumarte a nuestros diversos espacios de intercesión, donde juntos levantamos nuestras peticiones y agradecimientos delante del Trono de la Gracia.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/compromiso/oracion/Oracion.jpg",
    imageAlt: "Persona orando",
    imagePosition: "right",
  };

  const prayerGroupsData = {
    title: "Espacios de Oración",
    items: [
      {
        type: "link",
        href: "/ministerios/circulos-oracion",
        itemTitle: "Círculos de Oración",
        itemDescription: "Intercesión comunitaria vía Zoom por propósitos específicos.",
      },
      {
        type: "link",
        href: "/ministerios/intercesores",
        itemTitle: "Intercesores",
        itemDescription: "Clamando por la visión, el liderazgo y el avance del Reino.",
      },
      {
        type: "link",
        href: "/ministerios/miercoles-oracion",
        itemTitle: "Miércoles de Oración",
        itemDescription: "Nuestro servicio semanal de búsqueda y adoración a las 06h30.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Oración"
      description="El motor espiritual de nuestra familia."
      imageUrl="/involucrate/ministerios/servicio/compromiso/oracion/Oracion.jpg"
      imageAlt="Oración"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        backLink="/ministerios/servicio" 
        backLabel="Volver a Servicio" 
      />
      <MinistryContentSection {...prayerGroupsData} />
    </PublicPageLayout>
  );
}
