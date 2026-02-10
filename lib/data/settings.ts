import { createAdminClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";

export interface SiteSettings {
  id: number;
  notification_email: string;
  maintenance_mode: boolean;
  announcement_text: string;
  announcement_link: string;
  announcement_enabled: boolean;
  updated_at: string;
}

/**
 * @description Obtiene los ajustes globales del sitio con cache de Next.js.
 * Usamos createStaticClient para evitar el error de "cookies" durante el build.
 */
export const getCachedSettings = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Error fetching cached settings:", error);
      return null;
    }
    return data as SiteSettings;
  },
  ['site-settings-global'],
  {
    tags: ['settings'],
    revalidate: 3600
  }
);

export interface GoogleIntegration {
  id: number;
  account_name: string;
  account_email: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
}

/**
 * @description Cached fetch of Google Integration settings (safe fields only).
 */
export const getCachedGoogleSettings = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("google_integration")
      .select("account_name, account_email") // Only fetch public-safe info for UI
      .eq("id", 1)
      .single();

    if (error) {
      // It's common to not have integration set up yet
      return null;
    }
    return data as GoogleIntegration;
  },
  ['google-settings'],
  {
    tags: ['settings', 'google-integration'],
    revalidate: 3600
  }
);