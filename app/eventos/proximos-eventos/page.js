import { cookies } from 'next/headers';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';
import { sectionTitle, sectionText } from "@/lib/styles";
import { Button } from '@/components/ui/button';
import { EventosHeader } from "@/components/public/layout/pages/eventos/EventosHeader";
import { PaginationControls } from "@/components/public/PaginationControls";

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
    <section>
      <EventosHeader />
      {paginatedEvents.length === 0 ? (
        <p className="text-center text-lg min-h-[60vh] flex items-center justify-center">No hay eventos próximamente.</p>
      ) : (
        <div className="flex flex-col gap-10 md:gap-16 w-full mx-auto px-8 md:px-28 pt-8 md:pt-16 pb-16 md:pb-24">
          {paginatedEvents.map(event => (
            <div id={event.title} key={event.id} className="flex flex-col items-center text-center">
              {event.poster_url && (
                <div className="relative w-full mb-2 md:mb-4" style={{ aspectRatio: event.poster_w && event.poster_h ? `${event.poster_w} / ${event.poster_h}` : '16 / 9' }}>
                  <Image
                    src={event.poster_url}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 576px, (max-width: 1200px) 50vw, 1000px"
                    quality={100}
                    className="rounded-lg object-contain"
                    unoptimized
                    priority
                  />
                </div>
              )}
              <h2 className={cn(sectionTitle, "mb-2")}>{event.title}</h2>
              {event.description && (
                <p className={cn(sectionText, "mb-2 max-w-2xl text-gray-800")}>{event.description}</p>
              )}
              <div className='flex flex-row justify-center items-center gap-8'>
                <div className='flex flex-col'>
                  <p className={cn("text-gray-600", sectionText)}>
                    <span className="font-medium">Fecha:</span> {new Date(event.start_time).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Guayaquil' })}
                  </p>
                  <p className={cn("text-gray-600", sectionText)}>
                    <span className="font-medium">Hora:</span> {new Date(event.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guayaquil' })}
                  </p>
                </div>
                {event.registration_link && (
                  <div className="mt-4">
                    <a href={event.registration_link} target="_blank" rel="noopener noreferrer">
                      <Button className="px-4 py-2 bg-(--puembo-green) text-white rounded-md hover:bg-[hsl(92,45.9%,40%)]">Regístrate</Button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
          {totalPages > 1 && (
            <PaginationControls hasNextPage={hasNextPage} totalPages={totalPages} basePath="/eventos/proximos-eventos" />
          )}
        </div>
      )}
    </section>
  );
}