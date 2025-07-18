import { UpcomingEventsContentSection } from "@/components/public/layout/pages/eventos/UpcomingEventsContentSection";
import { getUpcomingEvents } from '@/lib/data/events.ts';
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";

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

  const introSectionData = {
    title: "No te Pierdas Nada",
    description: [
      "Mantente al tanto de los próximos eventos y actividades especiales en Alianza Puembo. Aquí encontrarás información detallada sobre cada evento, incluyendo fechas, horarios y cómo participar.",
      "Desde servicios especiales hasta reuniones de grupos pequeños y eventos comunitarios, nuestro calendario te ayudará a planificar tu participación y a no perderte ninguna oportunidad de crecimiento y comunión.",
    ],
    imageUrl: "/eventos/upcoming-events-intro.jpg",
    imageAlt: "Personas en un evento de la iglesia",
    imagePosition: "right",
  };

  return (
    <PublicPageLayout
      title="Próximos Eventos"
      description="Mantente al tanto de lo que viene en nuestra comunidad."
      imageUrl="/eventos/Eventos.jpg"
      imageAlt="Personas en un evento de la iglesia"
      introSectionData={introSectionData}
    >
      <UpcomingEventsContentSection
        paginatedEvents={paginatedEvents}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
      />
    </PublicPageLayout>
  );
}