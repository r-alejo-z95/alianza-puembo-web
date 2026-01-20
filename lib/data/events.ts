import { createClient } from '@/lib/supabase/server';
import { getNowInEcuador } from '@/lib/date-utils';
import { unstable_noStore as noStore } from 'next/cache';

interface Event {
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
}

/**
 * @description Obtiene todos los eventos para el calendario público.
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

  const upcomingEvents = (events as Event[])
    .filter(event => new Date(event.end_time || event.start_time) >= now);

  return (events as Event[]).map((event) => {
    const isUpcoming = new Date(event.end_time || event.start_time) >= now;
    let page = 1;

    if (isUpcoming) {
      const indexInUpcoming = upcomingEvents.findIndex(e => e.id === event.id);
      page = Math.floor(indexInUpcoming / eventsPerPage) + 1;
    }

    return {
      ...event,
      page,
    };
  });
}

/**
 * @description Obtiene los próximos eventos paginados.
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
  const upcomingEvents = (events as Event[])
    .filter(event => new Date(event.end_time || event.start_time) >= now);

  const totalPages = Math.ceil(upcomingEvents.length / eventsPerPage);
  const paginatedEvents = upcomingEvents.slice(
    (page - 1) * eventsPerPage,
    page * eventsPerPage
  );

  const hasNextPage = page * eventsPerPage < upcomingEvents.length;

  return { paginatedEvents, totalPages, hasNextPage };
}

/**

 * @description Obtiene un evento por su Slug directamente desde la DB.

 */

export async function getEventBySlug(slug: string): Promise<Event | null> {

  noStore();

  const supabase = await createClient();

  

  const { data, error } = await supabase

    .from('events')

    .select('*')

    .eq('slug', slug)

    .maybeSingle();



  if (error) {

    console.error(`Error fetching event with slug ${slug}:`, error);

    return null;

  }

  

  return data;

}


