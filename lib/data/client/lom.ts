import { createClient } from '@/lib/supabase/client';

export async function getLomPosts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('lom_posts')
    .select('*')
    .order('publication_date', { ascending: false });

  if (error) {
    console.error('Error fetching LOM posts:', error);
    return [];
  }

  return data;
}