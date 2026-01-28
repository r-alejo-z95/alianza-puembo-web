import { createClient } from "@/lib/supabase/server";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  news_date: string;
  image_url?: string;
  image_w?: number;
  image_h?: number;
  created_at: string;
}

const NEWS_PER_PAGE = 4;

/**
 * @description Obtiene las noticias paginadas.
 * @param {number} page - El número de página actual.
 * @param {number} newsPerPage - El número de noticias por página.
 * @returns {Promise<{paginatedNews: Array, totalPages: number, hasNextPage: boolean}>} Un objeto con las noticias paginadas y la información de paginación.
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

  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .eq("is_archived", false)
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
