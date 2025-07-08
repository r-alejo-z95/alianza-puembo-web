import { cookies } from 'next/headers';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';
import { pageSection, pageHeaderContainer, pageTitle, pageDescription, sectionTitle } from "@/lib/styles";

export default async function ProximosEventos() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return <p>Error al cargar los eventos.</p>;
  }

  const now = new Date();
  const upcomingEvents = events.filter(event => new Date(event.start_time) >= now).slice(0, 2);

  return (
    <section className={pageSection}>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-merriweather">
          Próximos Eventos
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Mantente al tanto de lo que viene en nuestra comunidad.
        </p>
      </div>
      {upcomingEvents.length === 0 ? (
        <p className="text-center text-lg min-h-[60vh] flex items-center justify-center">No hay eventos próximamente.</p>
      ) : (
        <div className="flex flex-col gap-12 w-full max-w-3xl mx-auto">
          {upcomingEvents.map(event => (
            <div key={event.id} className="flex flex-col items-center text-center">
              {event.poster_url && (
                <div className="relative w-full max-w-xl h-96 mb-4">
                  <Image
                    src={event.poster_url}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 576px, (max-width: 1200px) 50vw, 1000px"
                    quality={100}
                    className="rounded-lg object-contain"
                  />
                </div>
              )}
              <h2 className={cn(sectionTitle, "text-3xl mb-2")}>{event.title}</h2>
              {event.description && (
                <p className="text-gray-700 mb-4 max-w-2xl">{event.description}</p>
              )}
              <p className="text-gray-600 text-lg">
                <span className="font-medium">Fecha:</span> {new Date(event.start_time).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-gray-600 text-lg">
                <span className="font-medium">Hora:</span> {new Date(event.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
