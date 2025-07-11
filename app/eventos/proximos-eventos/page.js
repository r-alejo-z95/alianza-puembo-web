import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/public/layout/pages/PageHeader";
import { UpcomingEventsIntroSection } from "@/components/public/layout/pages/eventos/UpcomingEventsIntroSection";
import { UpcomingEventsContentSection } from "@/components/public/layout/pages/eventos/UpcomingEventsContentSection";

export const metadata = {
  title: "Próximos Eventos",
  description: "Mantente al tanto de los próximos eventos y actividades especiales en Alianza Puembo. ¡No te pierdas nada!",
  alternates: {
    canonical: "/eventos/proximos-eventos",
  },
};

export default async function ProximosEventos({ searchParams }) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page) || 1;
  const eventsPerPage = 3;

  const { data: events, error, count } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return <p>Error al cargar los eventos.</p>;
  }

  const now = new Date();
  const upcomingEvents = events.filter(event => new Date(event.start_time) >= now);

  const totalPages = Math.ceil(upcomingEvents.length / eventsPerPage);
  const paginatedEvents = upcomingEvents.slice(
    (page - 1) * eventsPerPage,
    page * eventsPerPage
  );

  const hasNextPage = page * eventsPerPage < upcomingEvents.length;

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