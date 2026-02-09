import { createAdminClient, createStaticClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';

export interface PrayerRequest {
  id: string;
  name: string | null;
  request_text: string;
  is_public: boolean;
  is_anonymous: boolean;
  created_at: string;
  status: string;
  is_archived: boolean;
  archived_at?: string;
}

/**
 * @description Cached fetch of all public approved prayer requests.
 * Revalidate this cache using revalidateTag('prayer') after mutations.
 */
const getCachedPublicPrayerRequests = unstable_cache(
  async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'approved')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public prayer requests:', error);
      return [];
    }
    return data as PrayerRequest[];
  },
  ['public-prayer-requests'],
  {
    tags: ['prayer'],
    revalidate: 3600 // Fallback: revalidate every hour
  }
);

/**
 * @description Cached fetch of all non-archived prayer requests for admin.
 */
export const getCachedAllPrayerRequestsForAdmin = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all prayer requests for admin:', error);
      return [];
    }
    return data as PrayerRequest[];
  },
  ['admin-prayer-requests-list'],
  {
    tags: ['prayer'],
    revalidate: 3600
  }
);

/**
 * @description Obtiene todas las peticiones de oración públicas.
 * @returns {Promise<Array>} Una promesa que se resuelve en un array de peticiones de oración.
 */
export async function getPublicPrayerRequests(): Promise<PrayerRequest[]> {
  return await getCachedPublicPrayerRequests();
}