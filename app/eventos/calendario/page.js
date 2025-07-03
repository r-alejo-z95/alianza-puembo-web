import UserCalendar from '@/components/UserCalendar';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// --- Obtención de datos reales desde Supabase ---
async function getEvents() {
  const supabase = await createServerSupabaseClient();
  // La política de RLS permite que cualquiera lea los eventos, por lo que no se necesita autenticación aquí.
  const { data, error } = await supabase
    .from('events')
        .select('id, title, description, start_time, end_time');

  if (error) {
    console.error('Error fetching events from Supabase:', error);
    return [];
  }

  // FullCalendar espera las propiedades 'start' y 'end', 
  // así que mapeamos los nombres de las columnas de la base de datos.
  return data.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start_time,
    end: event.end_time,
    extendedProps: {
      description: event.description,
    },
  }));
}
// --- Fin de la obtención de datos ---

export default async function CalendarPage() {
  const events = await getEvents();

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-merriweather">
          Calendario de Eventos
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Descubre los próximos eventos de la iglesia y marca tu calendario.
        </p>
      </div>
      <UserCalendar events={events} />
    </section>
  );
}
