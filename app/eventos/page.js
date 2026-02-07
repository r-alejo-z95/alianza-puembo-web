import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { MinistryContentSection } from "@/components/public/layout/pages/involucrate/ministerios/MinistryContentSection";

export const metadata = {
  title: "Eventos",
  description: "Explora los próximos eventos y el calendario de actividades de Alianza Puembo.",
  alternates: {
    canonical: "/eventos",
  },
};

export default function EventosRaiz() {
  const portalData = {
    title: "Nuestras Actividades",
    items: [
      {
        type: "link",
        href: "/eventos/proximos-eventos",
        itemTitle: "Próximos Eventos",
        itemDescription: "Consulta lo que viene pronto en nuestra iglesia.",
      },
      {
        type: "link",
        href: "/eventos/calendario",
        itemTitle: "Calendario",
        itemDescription: "Explora todas las fechas y actividades programadas.",
      },
    ],
  };

  const introSectionData = {
    title: "Vida en Comunidad",
    description: [
      "Creemos que la fe se fortalece cuando caminamos juntos. En Alianza Puembo, siempre hay algo sucediendo: desde celebraciones especiales hasta encuentros de crecimiento.",
      "Mantente al tanto de nuestras actividades y no pierdas la oportunidad de involucrarte y crecer con nosotros.",
    ],
    imageUrl: "/eventos/Eventos.avif",
    imageAlt: "Eventos Alianza Puembo",
    imagePosition: "right",
  };

  return (
    <PublicPageLayout
      title="Eventos"
      description="Conéctate con nuestra comunidad."
      imageUrl="/eventos/Eventos.avif"
      imageAlt="Eventos"
      introSectionData={introSectionData}
    >
      <MinistryContentSection {...portalData} />
    </PublicPageLayout>
  );
}