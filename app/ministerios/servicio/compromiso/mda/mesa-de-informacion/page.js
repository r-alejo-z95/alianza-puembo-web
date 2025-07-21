
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/ministerios/MinistryContentSection";

export const metadata = {
  title: "Mesa de Información",
  description: "Proporcionando información y orientación a los visitantes y miembros de Alianza Puembo. El centro de ayuda de nuestra iglesia.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/compromiso/mda/mesa-de-informacion",
  },
};

export default function MesaDeInformacion() {
  const introSectionData = {
    title: "Mesa de Información: Tu Centro de Ayuda",
    description: [
      "La Mesa de Información es el punto central para resolver dudas, obtener recursos y conocer más sobre las actividades y ministerios de Alianza Puembo. Nuestro equipo está listo para brindarte la orientación que necesitas con una sonrisa y eficiencia.",
      "Si tienes preguntas sobre cómo involucrarte, próximos eventos, o cualquier otra inquietud, acércate a nuestra mesa. Estamos aquí para servirte.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/compromiso/mda/mesa-de-informacion/MesaDeInformacion.jpg",
    imageAlt: "Persona atendiendo en una mesa de información",
    imagePosition: "right",
  };

  const services = {
    title: "Nuestros Servicios",
    items: [
      {
        type: "icon",
        iconType: "Info",
        itemTitle: "Información General",
        itemDescription: "Detalles sobre horarios de servicios, eventos, y ubicación de salones.",
      },
      {
        type: "icon",
        iconType: "BookOpen",
        itemTitle: "Registro y Recursos",
        itemDescription: "Inscripciones para cursos, eventos y entrega de materiales informativos.",
      },
      {
        type: "icon",
        iconType: "Users",
        itemTitle: "Orientación Ministerial",
        itemDescription: "Ayuda para encontrar el ministerio adecuado según tus dones e intereses.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Mesa de Información"
      description="Tu centro de ayuda en Alianza Puembo."
      imageUrl="/involucrate/ministerios/servicio/compromiso/mda/mesa-de-informacion/MesaDeInformacion.jpg"
      imageAlt="Mesa de Información"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...services} />
    </PublicPageLayout>
  );
}
