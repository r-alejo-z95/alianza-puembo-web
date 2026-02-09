import { createAdminClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  reply_content?: string;
  replied_at?: string;
  replied_by?: any;
  created_at: string;
  is_archived: boolean;
}

/**
 * @description Cached fetch of all non-archived contact messages for admin.
 */
export const getCachedContactMessages = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*, replied_by:profiles(full_name, email)')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cached contact messages:', error);
      return [];
    }
    return data as ContactMessage[];
  },
  ['contact-messages-list'],
  {
    tags: ['contact'],
    revalidate: 3600
  }
);
