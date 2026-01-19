import { createClient } from '@/lib/supabase/server';
import { getNowInEcuador } from '@/lib/date-utils';

interface Event {
  id: string;
  title: string;
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
}

/**
 * @description Obtiene todos los eventos para el calendario público.
 * @returns {Promise<Array>} Una promesa que se resuelve en un array de eventos completos.
 */
export async function getEventsForCalendar(): Promise<(Event & { page?: number })[]> {
  const supabase = await createClient();
  
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching events for calendar:', error);
    return [];
  }

  const now = getNowInEcuador();
  const eventsPerPage = 4;
  
  return (events as Event[]).map((event, index) => {
    // Calculate page based on its position in the chronological list of all events
    // or just pass a default if it's past. 
    // Actually, it's better to keep the same logic but for all events.
    return {
      ...event,
      page: Math.floor(index / eventsPerPage) + 1,
    };
  });
}

/**
 * @description Obtiene los próximos eventos paginados.
 * @param {number} page - El número de página actual.
 * @param {number} eventsPerPage - El número de eventos por página.
 * @returns {Promise<{paginatedEvents: Array, totalPages: number, hasNextPage: boolean}>} Un objeto con los eventos paginados y la información de paginación.
 */
export async function getUpcomingEvents(page: number = 1, eventsPerPage: number = 4): Promise<{ paginatedEvents: Event[], totalPages: number, hasNextPage: boolean }> {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching upcoming events:', error);
    return { paginatedEvents: [], totalPages: 0, hasNextPage: false };
  }

  const now = getNowInEcuador();
  const upcomingEvents = (events as Event[]).filter(event => new Date(event.end_time || event.start_time) >= now);

  const totalPages = Math.ceil(upcomingEvents.length / eventsPerPage);
  const paginatedEvents = upcomingEvents.slice(
    (page - 1) * eventsPerPage,
    page * eventsPerPage
  );

  const hasNextPage = page * eventsPerPage < upcomingEvents.length;

  return { paginatedEvents, totalPages, hasNextPage };
}