import { Suspense } from "react";
import { getUpcomingEvents } from '@/lib/data/events.ts';
import { PublicPageLayout } from "@/components/public/layout/pages/PublicPageLayout";
import { UpcomingEventsClient } from "./UpcomingEventsClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Próximos Eventos",
  description: "Mantente al tanto de los próximos eventos y actividades especiales en Alianza Puembo. ¡No te pierdas nada!",
  alternates: {
    canonical: "/eventos/proximos-eventos",
  },
};

function LoadingState() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  );
}

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
      introSectionData={page === 1 ? introSectionData : undefined}
    >
      <Suspense fallback={<LoadingState />}>
        <UpcomingEventsClient 
          paginatedEvents={paginatedEvents}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          page={page}
        />
      </Suspense>
    </PublicPageLayout>
  );
}