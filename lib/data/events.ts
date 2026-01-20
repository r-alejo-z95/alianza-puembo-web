import { createClient } from '@/lib/supabase/server';
import { getNowInEcuador } from '@/lib/date-utils';
import { unstable_noStore as noStore } from 'next/cache';

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  start_time: string;
  end_time: string;
  poster_url?: string;
  poster_w?: number;
  poster_h?: number;
  registration_link?: string;
  all_day?: boolean;
  color?: string;
  location?: string;
  is_multi_day?: boolean;
  is_recurring?: boolean;
  recurrence_pattern?: "weekly" | "biweekly" | "monthly" | "yearly" | null;
}

/**
 * @description Expande un evento recurrente en múltiples instancias futuras.
 */
function expandRecurringEvent(event: Event, monthsAhead: number = 6): Event[] {
  if (!event.is_recurring || !event.recurrence_pattern) {
    return [event];
  }

  const instances: Event[] = [];
  const startDate = new Date(event.start_time);
  const endDate = event.end_time ? new Date(event.end_time) : new Date(event.start_time);
  const durationMs = endDate.getTime() - startDate.getTime();
  
  const limitDate = new Date(getNowInEcuador());
  limitDate.setMonth(limitDate.getMonth() + monthsAhead);

  let currentStart = new Date(startDate);

  while (currentStart <= limitDate) {
    instances.push({
      ...event,
      id: `${event.id}-${currentStart.getTime()}`,
      start_time: currentStart.toISOString(),
      end_time: new Date(currentStart.getTime() + durationMs).toISOString(),
    });

    if (event.recurrence_pattern === 'weekly') {
      currentStart.setUTCDate(currentStart.getUTCDate() + 7);
    } else if (event.recurrence_pattern === 'biweekly') {
      currentStart.setUTCDate(currentStart.getUTCDate() + 14);
    } else if (event.recurrence_pattern === 'monthly') {
      currentStart.setUTCMonth(currentStart.getUTCMonth() + 1);
    } else if (event.recurrence_pattern === 'yearly') {
      currentStart.setUTCFullYear(currentStart.getUTCFullYear() + 1);
    } else {
      break; 
    }
  }

  return instances;
}

/**
 * @description Obtiene todos los eventos para el calendario público, incluyendo recurrencias.
 */
export async function getEventsForCalendar(): Promise<(Event & { page?: number })[]> {
  const supabase = await createClient();
  const { data: rawEvents, error } = await supabase.from('events').select('*').order('start_time', { ascending: true });

  if (error) return [];

  const allInstances = (rawEvents as Event[]).flatMap(event => expandRecurringEvent(event));
  const now = getNowInEcuador();
  const eventsPerPage = 4;

  const upcomingInstances = allInstances
    .filter(event => new Date(event.end_time || event.start_time) >= now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return allInstances.map((instance) => {
    const isUpcoming = new Date(instance.end_time || instance.start_time) >= now;
    let page = 1;
    if (isUpcoming) {
      const indexInUpcoming = upcomingInstances.findIndex(e => e.id === instance.id);
      page = Math.floor(indexInUpcoming / eventsPerPage) + 1;
    }
    return { ...instance, page };
  });
}

/**
 * @description Obtiene los próximos eventos paginados.
 * Para eventos recurrentes, solo muestra la instancia más próxima para evitar duplicados en la lista.
 */
export async function getUpcomingEvents(page: number = 1, eventsPerPage: number = 4): Promise<{ paginatedEvents: Event[], totalPages: number, hasNextPage: boolean }> {
  const supabase = await createClient();
  const { data: rawEvents, error } = await supabase.from('events').select('*').order('start_time', { ascending: true });

  if (error) return { paginatedEvents: [], totalPages: 0, hasNextPage: false };

  const now = getNowInEcuador();
  
  // Lógica de "Primera Instancia Próxima":
  // Para cada evento de la DB, encontramos su primera instancia que aún no ha pasado.
  const upcomingEvents = (rawEvents as Event[]).map(event => {
    if (!event.is_recurring) return event;
    
    const instances = expandRecurringEvent(event);
    const nextInstance = instances
        .filter(instance => new Date(instance.end_time || instance.start_time) >= now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];
    
    return nextInstance || null; // Si ya pasaron todas las repeticiones (ej: hace años), no lo mostramos
  })
  .filter(e => e !== null && new Date(e.end_time || e.start_time) >= now)
  .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const totalPages = Math.ceil(upcomingEvents.length / eventsPerPage);
  const paginatedEvents = upcomingEvents.slice((page - 1) * eventsPerPage, page * eventsPerPage);
  const hasNextPage = page * eventsPerPage < upcomingEvents.length;

  return { paginatedEvents, totalPages, hasNextPage };
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase.from('events').select('*').eq('slug', slug).maybeSingle();
  if (error) return null;
  return data;
}
