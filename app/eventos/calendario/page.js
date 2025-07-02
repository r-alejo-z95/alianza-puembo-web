import UserCalendar from '@/components/UserCalendar';
import { cn } from '@/lib/utils';
import { mainTitleSizes, sectionPx } from '@/lib/styles';

// --- Simulación de obtención de datos --- 
// En una aplicación real, esto vendría de tu base de datos.
async function getEventsFromDatabase() {
  // Simula un retardo de red
  await new Promise(resolve => setTimeout(resolve, 500));

  const events = [
    {
      id: '1',
      title: 'Servicio Dominical',
      start: '2025-07-06T10:00:00',
      end: '2025-07-06T11:30:00',
    },
    {
      id: '2',
      title: 'Servicio Dominical',
      start: '2025-07-06T12:00:00',
      end: '2025-07-06T13:30:00',
    },
    {
      id: '3',
      title: 'Reunión de Jóvenes',
      start: '2025-07-12T18:00:00',
      end: '2025-07-12T20:00:00',
    },
    {
      id: '4',
      title: 'Estudio Bíblico Semanal',
      start: '2025-07-09T19:00:00',
      end: '2025-07-09T20:30:00',
    },
  ];

  return events;
}
// --- Fin de la simulación ---

export default async function CalendarPage() {
  const events = await getEventsFromDatabase();

  return (
    <div className={cn(sectionPx, "py-16 md:py-24 lg:py-32")}>
       <h1 className={cn(mainTitleSizes, "text-center mb-12 font-merriweather font-bold")}>
          Calendario de Eventos
        </h1>
      <UserCalendar events={events} />
    </div>
  );
}