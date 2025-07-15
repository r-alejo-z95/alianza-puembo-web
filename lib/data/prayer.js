
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * @description Obtiene todas las peticiones de oración públicas.
 * @returns {Promise<Array>} Una promesa que se resuelve en un array de peticiones de oración.
 */
export async function getPublicPrayerRequests() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const { data, error } = await supabase
    .from('prayer_requests')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public prayer requests:', error);
    return [];
  }
  return data;
}
