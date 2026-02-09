import { createAdminClient } from '@/lib/supabase/server';
import { getNowInEcuador } from '@/lib/date-utils';
import { unstable_cache } from 'next/cache';

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
  is_archived?: boolean; // Added to interface since we use it in queries
}

/**
 * @description Cached fetch of all active events.
 * This reduces Supabase hits by caching the raw list of non-archived events.
 * Revalidate this cache using revalidateTag('events') after mutations.
 */
export const getCachedEvents = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('events')
      .select('*, profiles(full_name, email)')
      .eq('is_archived', false)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching cached events:', error);
      return [];
    }
    return data as (Event & { profiles?: any })[];
  },
  ['events-list'], // Key parts
  {
    tags: ['events'],
    revalidate: 3600 // Fallback: revalidate every hour
  }
);

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
  const rawEvents = await getCachedEvents();

  const allInstances = rawEvents.flatMap(event => expandRecurringEvent(event));
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
  const rawEvents = await getCachedEvents();
  const now = getNowInEcuador();
  
  // Lógica de "Primera Instancia Próxima":
  // Para cada evento de la DB, encontramos su primera instancia que aún no ha pasado.
  const upcomingEvents = rawEvents.map(event => {
    if (!event.is_recurring) return event;
    
    const instances = expandRecurringEvent(event);
    const nextInstance = instances
        .filter(instance => new Date(instance.end_time || instance.start_time) >= now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];
    
    return nextInstance || null; // Si ya pasaron todas las repeticiones (ej: hace años), no lo mostramos
  })
  .filter((e): e is Event => e !== null && new Date(e.end_time || e.start_time) >= now)
  .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const totalPages = Math.ceil(upcomingEvents.length / eventsPerPage);
  const paginatedEvents = upcomingEvents.slice((page - 1) * eventsPerPage, page * eventsPerPage);
  const hasNextPage = page * eventsPerPage < upcomingEvents.length;

  return { paginatedEvents, totalPages, hasNextPage };
}

/**
 * @description Obtiene todos los próximos eventos sin paginar.
 * Útil para búsqueda y filtrado en el cliente.
 */
export async function getAllUpcomingEvents(): Promise<Event[]> {
  const rawEvents = await getCachedEvents();
  const now = getNowInEcuador();
  
  const upcomingEvents = rawEvents.map(event => {
    if (!event.is_recurring) return event;
    
    const instances = expandRecurringEvent(event);
    const nextInstance = instances
        .filter(instance => new Date(instance.end_time || instance.start_time) >= now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];
    
    return nextInstance || null;
  })
  .filter((e): e is Event => e !== null && new Date(e.end_time || e.start_time) >= now)
  .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return upcomingEvents;
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  // Nota: No cacheamos getEventBySlug individualmente con unstable_cache por ahora
  // porque getAllUpcomingEvents ya suele cubrir la mayoría de usos.
  // Pero podríamos usar getCachedEvents() y filtrar en memoria si la lista no es gigante.
  // Por ahora, lo dejamos directo o usamos la lista cacheada si preferimos consistencia.
  // Vamos a usar la lista cacheada para mantener consistencia con 'events'.
  
  const rawEvents = await getCachedEvents();
  const event = rawEvents.find(e => e.slug === slug);
  return event || null;
}
