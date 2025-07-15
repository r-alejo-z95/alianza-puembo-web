import { createClient } from '@/lib/supabase/server';

interface PrayerRequest {
  id: string;
  name: string | null;
  request_text: string;
  is_public: boolean;
  is_anonymous: boolean;
  created_at: string;
}

/**
 * @description Obtiene todas las peticiones de oración públicas.
 * @returns {Promise<Array>} Una promesa que se resuelve en un array de peticiones de oración.
 */
export async function getPublicPrayerRequests(): Promise<PrayerRequest[]> {
  const supabase = await createClient();
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