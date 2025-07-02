import UserCalendar from '@/components/UserCalendar';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { mainTitleSizes, sectionPx } from '@/lib/styles';

// --- Obtención de datos reales desde Supabase ---
async function getEvents() {
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
    <div className={cn(sectionPx, "py-16 md:py-24 lg:py-32")}>
      <UserCalendar events={events} />
    </div>
  );
}