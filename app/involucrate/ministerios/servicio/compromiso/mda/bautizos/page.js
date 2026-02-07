
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Bautizos",
  description: "Apoyando en la organización y desarrollo de las ceremonias de bautismo en Alianza Puembo. Un momento de celebración y compromiso.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/compromiso/mda/bautizos",
  },
};

export default function Bautizos() {
  const introSectionData = {
    title: "Bautizos: Celebrando un Nuevo Comienzo",
    description: [
      "El ministerio de Bautizos tiene el honor de apoyar en la organización y desarrollo de las ceremonias de bautismo, un momento trascendental en la vida de un creyente. Nos aseguramos de que cada detalle esté cuidado para que sea una experiencia memorable y significativa para quienes dan este paso de fe.",
      "Si deseas ser parte de este hermoso ministerio que celebra la decisión de seguir a Cristo, te invitamos a unirte a nuestro equipo.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/compromiso/mda/bautizos/Bautizos.avif",
    imageAlt: "Persona siendo bautizada en el agua",
    imagePosition: "right",
  };

  const rolesData = {
    title: "Nuestras Tareas",
    items: [
      {
        type: "icon",
        iconType: "CalendarCheck",
        itemTitle: "Coordinación Logística",
        itemDescription: "Ayudar en la planificación y preparación del lugar para la ceremonia.",
      },
      {
        type: "icon",
        iconType: "Shirt",
        itemTitle: "Asistencia a Bautizandos",
        itemDescription: "Apoyar a los que se bautizan con la vestimenta y orientación antes y después.",
      },
      {
        type: "icon",
        iconType: "Camera",
        itemTitle: "Registro y Documentación",
        itemDescription: "Asegurar el registro de los bautizados y la entrega de certificados.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Bautizos"
      description="Celebrando un nuevo comienzo en Cristo."
      imageUrl="/involucrate/ministerios/servicio/compromiso/mda/bautizos/header.avif"
      imageAlt="Bautizos"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        hierarchy={[
          { name: "Servicio", href: "/ministerios/servicio" },
          { name: "Compromiso", href: "/ministerios/compromiso" },
          { name: "MDA", href: "/ministerios/mda" }
        ]}
        current="Bautizos"
        backLink="/ministerios/mda" 
        backLabel="Volver a MDA" 
      />
      <MinistryContentSection {...rolesData} />
    </PublicPageLayout>
  );
}
