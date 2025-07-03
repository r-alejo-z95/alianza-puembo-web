
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createServerSupabaseClient = async (cookieStore) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required.');
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get: async (name) => (await cookieStore).get(name)?.value,
        set: async (name, value, options) => {
          (await cookieStore).set({ name, value, ...options });
        },
        remove: async (name, options) => {
          (await cookieStore).set({ name, value: '', ...options });
        },
      },
    }
  );
};
