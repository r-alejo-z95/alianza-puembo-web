'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function addPrayerRequest(formData) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const name = formData.get('name');
  const request_text = formData.get('request_text');
  const is_public = formData.get('is_public') === 'true';
  const is_anonymous = formData.get('is_anonymous') === 'true';

  if (!request_text) {
    return { error: 'El texto de la petición no puede estar vacío.' };
  }

  const { data, error } = await supabase
    .from('prayer_requests')
    .insert([{ name, request_text, is_public, is_anonymous }])
    .select();

  if (error) {
    console.error('Error inserting prayer request:', error);
    return { error: 'No se pudo enviar tu petición. Por favor, inténtalo de nuevo.' };
  }

  revalidatePath('/oracion');

  return { data };
}
