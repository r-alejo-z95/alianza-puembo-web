import { createAdminClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import { getTodayEcuadorDateLiteral } from "@/lib/date-utils";

/**
 * @description Cached fetch of LOM posts.
 */
export const getCachedLomPosts = (includeFuture = false) => {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      const today = getTodayEcuadorDateLiteral();

      let query = supabase
        .from("lom_posts")
        .select("*, profiles(full_name, email)")
        .eq("is_archived", false);

      if (!includeFuture) {
        query = query.lte("publication_date", today);
      }

      const { data, error } = await query.order("publication_date", { ascending: false });

      if (error) {
        console.error("Error fetching cached LOM posts:", error);
        return [];
      }
      return data;
    },
    ['lom-posts-list', includeFuture ? 'admin' : 'public'],
    {
      tags: ['lom'],
      revalidate: 3600
    }
  )();
};

/**
 * @description Obtiene todos los devocionales LOM publicados hasta hoy (Ecuador).
 */
export async function getLomPosts() {
  return await getCachedLomPosts(false);
}

/**
 * @description Obtiene todos los devocionales LOM (incluyendo futuros) para Admin.
 */
export async function getAllLomPostsForAdmin() {
  return await getCachedLomPosts(true);
}

/**
 * @description Obtiene el devocional LOM más reciente (publicado).
 */
export async function getLatestLomPost(): Promise<{ slug: string } | null> {
  const posts = await getCachedLomPosts(false);
  return posts.length > 0 ? { slug: posts[0].slug } : null;
}

/**
 * @description Obtiene un devocional LOM por su slug.
 */
export async function getLomPostBySlug(slug: string): Promise<any | null> {
  const posts = await getCachedLomPosts(false);
  return posts.find(post => post.slug === slug) || null;
}

/**
 * @description Obtiene los posts de navegación (anterior y siguiente).
 * `currentPostDate` DEBE ser YYYY-MM-DD (DATE).
 */
export async function getLomNavigationPosts(currentPostDate: string): Promise<{
  prevPost: { slug: string; publication_date: string } | null;
  nextPost: { slug: string; publication_date: string } | null;
}> {
  const posts = await getCachedLomPosts(false);
  
  // Assuming posts are ordered descending by publication_date
  const currentIndex = posts.findIndex(p => p.publication_date === currentPostDate);
  
  if (currentIndex === -1) return { prevPost: null, nextPost: null };

  // Next post in time (future relative to current) -> previous in array (since desc sort)
  const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  
  // Prev post in time (past relative to current) -> next in array
  const prevPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return {
    prevPost: prevPost ? { slug: prevPost.slug, publication_date: prevPost.publication_date } : null,
    nextPost: nextPost ? { slug: nextPost.slug, publication_date: nextPost.publication_date } : null,
  };
}
