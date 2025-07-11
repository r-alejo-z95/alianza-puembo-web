import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import UserCalendar from '@/components/public/calendar/UserCalendar';
import { contentSection } from "@/lib/styles";
import { PageHeader } from "@/components/public/layout/pages/PageHeader";

export const metadata = {
  title: "Calendario de Eventos",
  description: "Consulta nuestro calendario para no perderte ningún evento, reunión o actividad especial en Alianza Puembo. ¡Te esperamos!",
  alternates: {
    canonical: "/eventos/calendario",
  },
};

// --- Obtención de datos reales desde Supabase ---
async function getEvents() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  // La política de RLS permite que cualquiera lea los eventos, por lo que no se necesita autenticación aquí.
  const { data, error } = await supabase
    .from('events')
    .select('*');

  if (error) {
    console.error('Error fetching events from Supabase:', error);
    return <p>Error al cargar los eventos en el calendario.</p>;
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
    <section>
      <PageHeader
        title="Calendario de Eventos"
        description="Descubre los próximos eventos de la iglesia y marca tu calendario."
        imageUrl="/eventos/Calendario.jpg"
        imageAlt="Evento en la iglesia"
      />
      <div className={contentSection}>
        <UserCalendar events={events} />
      </div>
    </section>
  );
}
