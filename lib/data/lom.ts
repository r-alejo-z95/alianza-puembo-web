import { createClient } from '@/lib/supabase/server';

/**
 * @description Obtiene el devocional LOM más reciente.
 * @returns {Promise<Object|null>} Una promesa que se resuelve en el post más reciente o null si no se encuentra.
 */
export async function getLatestLomPost(): Promise<{ slug: string } | null> {
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
 * @param {string} slug - El slug del post.
 * @returns {Promise<Object|null>} Una promesa que se resuelve en el post o null si no se encuentra.
 */
export async function getLomPostBySlug(slug: string): Promise<any | null> {
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
 * @param {string} currentPostDate - La fecha de publicación del post actual.
 * @returns {Promise<{prevPost: Object|null, nextPost: Object|null}>} Un objeto con el post anterior y siguiente.
 */
export async function getLomNavigationPosts(currentPostDate: string): Promise<{ prevPost: { slug: string } | null, nextPost: { slug: string } | null }> {
  const supabase = await createClient();

  const { data: prevPost } = await supabase
    .from('lom_posts')
    .select('slug')
    .lt('publication_date', currentPostDate)
    .order('publication_date', { ascending: false })
    .limit(1)
    .single();

  const { data: nextPost } = await supabase
    .from('lom_posts')
    .select('slug')
    .gt('publication_date', currentPostDate)
    .order('publication_date', { ascending: true })
    .limit(1)
    .single();

  return { prevPost, nextPost };
}