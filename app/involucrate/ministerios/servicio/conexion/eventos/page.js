
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";
import { MinistryNavigation } from "@/components/public/layout/pages/involucrate/ministerios/MinistryNavigation";

export const metadata = {
  title: "Eventos de Conexión",
  description: "Eventos especiales en Alianza Puembo para conectar con la comunidad y crecer en fe. Encuentros para matrimonios, varones, mujeres y jóvenes.",
  alternates: {
    canonical: "/involucrate/ministerios/servicio/conexion/eventos",
  },
};

export default function Eventos() {
  const introSectionData = {
    title: "Eventos que Conectan y Transforman",
    description: [
      "Nuestros eventos de conexión son oportunidades únicas para invitar a amigos y familiares, y para crecer en áreas específicas de tu vida. Cada evento está diseñado con un propósito claro y un ambiente inspirador.",
      "Explora nuestros eventos anuales y sé parte de estas experiencias transformadoras.",
    ],
    imageUrl: "/involucrate/ministerios/servicio/conexion/eventos/Eventos.jpg",
    imageAlt: "Multitud en un evento de la iglesia",
    imagePosition: "right",
  };

  const eventsListData = {
    title: "Nuestros Eventos Anuales",
    items: [
      {
        type: "link",
        href: "/ministerios/alma",
        itemTitle: "Alma (para Matrimonios)",
        itemDescription: "Un evento para fortalecer la conexión y el propósito en el matrimonio.",
      },
      {
        type: "link",
        href: "/ministerios/legado",
        itemTitle: "Legado (para Varones)",
        itemDescription: "Un tiempo para desafiar a los hombres a vivir un legado de fe e integridad.",
      },
      {
        type: "link",
        href: "/ministerios/cautivante",
        itemTitle: "Cautivante (para Mujeres)",
        itemDescription: "Un encuentro para que las mujeres descubran su belleza, valor y propósito en Dios.",
      },
      {
        type: "link",
        href: "/ministerios/eje",
        itemTitle: "Eje (para Jóvenes)",
        itemDescription: "El evento juvenil del año, lleno de energía, adoración y un mensaje que marca vidas.",
      },
    ],
  };

  return (
    <PublicPageLayout
      title="Eventos de Conexión"
      description="Experiencias diseñadas para conectar y transformar."
      imageUrl="/involucrate/ministerios/servicio/conexion/eventos/Eventos.jpg"
      imageAlt="Eventos de Conexión"
      introSectionData={introSectionData}
    >
      <MinistryNavigation 
        backLink="/ministerios/servicio" 
        backLabel="Volver a Servicio" 
      />
      <MinistryContentSection {...eventsListData} />
    </PublicPageLayout>
  );
}
