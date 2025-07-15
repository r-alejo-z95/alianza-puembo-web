import { createClient } from '@/lib/supabase/server';

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
}

/**
 * @description Obtiene todos los eventos para el calendario público.
 * @returns {Promise<Array>} Una promesa que se resuelve en un array de eventos formateados para FullCalendar.
 */
export async function getEventsForCalendar(): Promise<Array<any>> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('events')
    .select('id, title, description, start_time, end_time');

  if (error) {
    console.error('Error fetching events for calendar:', error);
    return [];
  }

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

/**
 * @description Obtiene los próximos eventos paginados.
 * @param {number} page - El número de página actual.
 * @param {number} eventsPerPage - El número de eventos por página.
 * @returns {Promise<{paginatedEvents: Array, totalPages: number, hasNextPage: boolean}>} Un objeto con los eventos paginados y la información de paginación.
 */
export async function getUpcomingEvents(page: number = 1, eventsPerPage: number = 3): Promise<{ paginatedEvents: Event[], totalPages: number, hasNextPage: boolean }> {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching upcoming events:', error);
    return { paginatedEvents: [], totalPages: 0, hasNextPage: false };
  }

  const now = new Date();
  const upcomingEvents = (events as Event[]).filter(event => new Date(event.start_time) >= now);

  const totalPages = Math.ceil(upcomingEvents.length / eventsPerPage);
  const paginatedEvents = upcomingEvents.slice(
    (page - 1) * eventsPerPage,
    page * eventsPerPage
  );

  const hasNextPage = page * eventsPerPage < upcomingEvents.length;

  return { paginatedEvents, totalPages, hasNextPage };
}