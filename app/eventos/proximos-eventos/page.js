import { PageHeader } from "@/components/public/layout/pages/PageHeader";
import { UpcomingEventsIntroSection } from "@/components/public/layout/pages/eventos/UpcomingEventsIntroSection";
import { UpcomingEventsContentSection } from "@/components/public/layout/pages/eventos/UpcomingEventsContentSection";
import { getUpcomingEvents } from '@/lib/data/events';

export const metadata = {
  title: "Próximos Eventos",
  description: "Mantente al tanto de los próximos eventos y actividades especiales en Alianza Puembo. ¡No te pierdas nada!",
  alternates: {
    canonical: "/eventos/proximos-eventos",
  },
};

export default async function ProximosEventos({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page) || 1;
  const { paginatedEvents, totalPages, hasNextPage } = await getUpcomingEvents(page);

  return (
    <main>
      <PageHeader
        title="Próximos Eventos"
        description="Mantente al tanto de lo que viene en nuestra comunidad."
        imageUrl="/eventos/Eventos.jpg"
        imageAlt="Personas en un evento de la iglesia"
      />
      <UpcomingEventsIntroSection />
      <UpcomingEventsContentSection
        paginatedEvents={paginatedEvents}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
      />
    </main>
  );
}