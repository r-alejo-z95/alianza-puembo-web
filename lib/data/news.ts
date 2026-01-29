import { createClient } from "@/lib/supabase/server";
import { getNowInEcuador } from "@/lib/date-utils";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  news_date: string;
  news_time: string;
  publish_at: string; // Nueva columna
  image_url?: string;
  image_w?: number;
  image_h?: number;
  created_at: string;
}

const NEWS_PER_PAGE = 4;

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
  const supabase = await createClient();
  const nowStr = new Date().toISOString(); // UTC real para comparar con TIMESTAMPTZ

  // Filtrar directamente en la consulta de Supabase para mayor eficiencia
  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .eq("is_archived", false)
    .lte("publish_at", nowStr) // Solo publicadas (ahora o en el pasado UTC)
    .order("news_date", { ascending: false, nullsFirst: true })
    .order("news_time", { ascending: false, nullsFirst: true });

  if (error) {
    console.error("Error fetching news:", error);
    return { paginatedNews: [], totalPages: 0, hasNextPage: false };
  }

  const newsWithPage = (news as NewsItem[]).map((item, index) => ({
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
