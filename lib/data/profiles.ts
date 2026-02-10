import { createAdminClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  phone?: string;
}

/**
 * @description Cached fetch of all profiles (staff).
 */
export const getCachedProfiles = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching cached profiles:", error);
      return [];
    }
    return data as Profile[];
  },
  ['profiles-list'],
  {
    tags: ['profiles'],
    revalidate: 3600
  }
);
