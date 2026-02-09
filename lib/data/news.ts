import { createAdminClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  publish_at: string;
  image_url?: string;
  image_w?: number;
  image_h?: number;
  created_at: string;
  is_archived?: boolean;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const NEWS_PER_PAGE = 4;

/**
 * @description Cached fetch of news.
 * @param includeScheduled If true, returns all non-archived news (for Admin).
 * If false, returns only news where publish_at <= now (for Public).
 */
export const getCachedNews = (includeScheduled = false) => {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      const nowStr = new Date().toISOString();

      let query = supabase
        .from("news")
        .select("*, profiles(full_name, email)")
        .eq("is_archived", false);

      if (!includeScheduled) {
        query = query.lte("publish_at", nowStr);
      }

      const { data, error } = await query.order("publish_at", { ascending: false });

      if (error) {
        console.error("Error fetching cached news:", error);
        return [];
      }
      return data as NewsItem[];
    },
    ['news-list', includeScheduled ? 'admin' : 'public'],
    {
      tags: ['news'],
      revalidate: 3600
    }
  )();
};

/**
 * @description Obtiene las noticias paginadas y filtradas por fecha de publicación programada.
 */
export async function getNews(
  page: number = 1,
  newsPerPage: number = NEWS_PER_PAGE,
): Promise<{
  paginatedNews: (NewsItem & { page?: number })[];
  totalPages: number;
  hasNextPage: boolean;
}> {
  const news = await getCachedNews(false); // Public only

  const newsWithPage = news.map((item, index) => ({
    ...item,
    page: Math.floor(index / newsPerPage) + 1,
  }));

  const totalPages = Math.ceil(newsWithPage.length / newsPerPage);
  const paginatedNews = newsWithPage.slice(
    (page - 1) * newsPerPage,
    page * newsPerPage,
  );

  const hasNextPage = page * newsPerPage < newsWithPage.length;

  return { paginatedNews, totalPages, hasNextPage };
}

/**
 * @description Obtiene todas las noticias publicadas sin paginar.
 */
export async function getAllNews(): Promise<NewsItem[]> {
  return await getCachedNews(false);
}

/**
 * @description Obtiene todas las noticias (incluyendo programadas) para el panel admin.
 */
export async function getAllNewsForAdmin(): Promise<NewsItem[]> {
  return await getCachedNews(true);
}
