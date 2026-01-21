import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * @description Obtiene todos los devocionales LOM.
 */
export async function getLomPosts() {
  noStore();
  const supabase = await createClient();
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

/**
 * @description Obtiene el devocional LOM más reciente.
 */
export async function getLatestLomPost(): Promise<{ slug: string } | null> {
  noStore();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lom_posts')
    .select('slug')
    .order('publication_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.error('Error fetching latest LOM post:', error);
    return null;
  }

  return data;
}

/**
 * @description Obtiene un devocional LOM por su slug.
 */
export async function getLomPostBySlug(slug: string): Promise<any | null> {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lom_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching LOM post with slug ${slug}:`, error);
    return null;
  }
  return data;
}

/**
 * @description Obtiene los posts de navegación (anterior y siguiente) para un devocional LOM.
 */
export async function getLomNavigationPosts(currentPostDate: string): Promise<{ prevPost: { slug: string, publication_date: string } | null, nextPost: { slug: string, publication_date: string } | null }> {
  noStore();
  const supabase = await createClient();

  const { data: prevPost } = await supabase
    .from('lom_posts')
    .select('slug, publication_date')
    .lt('publication_date', currentPostDate)
    .order('publication_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: nextPost } = await supabase
    .from('lom_posts')
    .select('slug, publication_date')
    .gt('publication_date', currentPostDate)
    .order('publication_date', { ascending: true })
    .limit(1)
    .maybeSingle();

  return { 
    prevPost: prevPost || null, 
    nextPost: nextPost || null 
  };
}