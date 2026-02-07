import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { CalendarioClient } from "./CalendarioClient";
import { ClientEventsProvider } from "@/components/providers/ClientEventsProvider";
import { getEventsForCalendar } from "@/lib/data/events";

export const metadata = {
  title: "Calendario de Eventos",
  description: "Consulta nuestro calendario mensual de actividades, servicios y eventos especiales. Planifica tu visita y sé parte de nuestra comunidad.",
  alternates: {
    canonical: "/eventos/calendario",
  },
};

export default async function CalendarioPage() {
  const initialEvents = await getEventsForCalendar();

  return (
    <PublicPageLayout
      title="Calendario"
      description="Explora todas nuestras actividades y eventos programados."
      imageUrl="/eventos/Calendario.avif"
      imageAlt="Calendario de la iglesia"
    >
      <ClientEventsProvider initialEvents={initialEvents}>
        <CalendarioClient />
      </ClientEventsProvider>
    </PublicPageLayout>
  );
}
